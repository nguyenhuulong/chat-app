import { auth, db } from "@/config/firebase";
import { AppUser, Conversation } from "@/types";
import { getRecipientEmail } from "@/utils/getRecipientEmail";
import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

export const useRecipient = (conversationsUsers: Conversation['users']) => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const recipientEmail = getRecipientEmail(conversationsUsers, loggedInUser)
    // get recipient avatar
    const queryGetRecipient = query(collection(db, 'users'), where('email', '==', recipientEmail))
    const [recipientSnapshot, __loading, __error] = useCollection(queryGetRecipient)
    // recipientSnapshot?.docs could be an empty array, leading to docs[0] being undefined
    // so we hace to force "?" after docs[0] because there is no data on "undefined"
    const recipient = recipientSnapshot?.docs[0]?.data() as AppUser | undefined
    return {
        recipient,
        recipientEmail
    }
}