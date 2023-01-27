import ConversationScreen from "@/components/ConversationScreen"
import Sidebar from "@/components/Sidebar"
import { auth, db } from "@/config/firebase"
import { Conversation, IMessage } from "@/types"
import { generateQueryGetMessage, transformMessage } from "@/utils/getMessageInConversation"
import { getRecipientEmail } from "@/utils/getRecipientEmail"
import { doc, getDoc, getDocs } from "firebase/firestore"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useAuthState } from "react-firebase-hooks/auth"
import styled from "styled-components"

interface Props {
    conversation: Conversation,
    messages: IMessage[]
}

const StyledContainer = styled.div`
    display: flex;
`

const StyledConversationContainer = styled.div`
    flex-grow: 1;
    overflow: scroll;
    height: 100vh;
    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    /* Hide scrollbar for Chrome, Safari and Opera */
    ::-webkit-scrollbar {
      display: none;
    }
`

const Conversation = ({conversation, messages}: Props) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  return <StyledContainer>
    <Head>
        <title>Conversation with {getRecipientEmail(conversation.users, loggedInUser)}</title>
    </Head>
    <Sidebar />
    {/* {
        messages.map((message, index) => (<p key={index}>{JSON.stringify(message)}</p>))
    } */}
    <StyledConversationContainer>
        <ConversationScreen conversation={conversation} messages={messages} />
    </StyledConversationContainer>
  </StyledContainer>
}

export default Conversation

export const getServerSideProps: GetServerSideProps<Props, {id: string}> = async context => {
    const conversationId = context.params?.id
    // get conversation, to know who we are chatting with
    const conversationRef = doc(db, 'conversations', conversationId as string)
    const conversaionSnapshot = await getDoc(conversationRef)
    // get all messages between logged in user and recipient in this conversation
    const queryMessages = generateQueryGetMessage(conversationId)
    const messagesSnapshot = await getDocs(queryMessages)
    // console.log('MESSAGE SNAPSHOT', messagesSnapshot.docs[0].data())
    const messages = messagesSnapshot.docs.map(messageDoc => transformMessage(messageDoc))
    return {
        props: {
            conversation: conversaionSnapshot.data() as Conversation,
            messages
        }
    }
}