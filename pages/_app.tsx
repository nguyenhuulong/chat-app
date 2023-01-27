import { auth, db } from '../config/firebase';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useAuthState } from 'react-firebase-hooks/auth';
import Login from './login';
import Loading from '@/components/Loading';
import { useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function App({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, _error] = useAuthState(auth);
  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(
          doc(db, 'users', loggedInUser?.email as string),
          {
            email: loggedInUser?.email,
            lastSeen: serverTimestamp(),
            photoURL: loggedInUser?.photoURL
          },
          {merge: true} // merge same key: email
        )
      } catch(error) {
        console.log('ERROR SETTING USER INFO IN DB', error)
      }
    }
    if(loggedInUser) {
      setUserInDb()
    }
  }, [loggedInUser])
  if(loading) return <Loading />; 
  if(!loggedInUser) return <Login />;
  return <Component {...pageProps} />;
}
