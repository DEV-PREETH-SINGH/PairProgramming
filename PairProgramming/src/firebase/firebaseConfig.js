import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC0TjISmsEDYHShj2_9eqeG-PbAEw4OjPo", // Your Firebase API Key
    authDomain: "pairprogramming-4ea92.firebaseapp.com", // Firebase Auth Domain
    projectId: "pairprogramming-4ea92", // Your Firebase Project ID
    storageBucket: "pairprogramming-4ea92.appspot.com", // Firebase Storage Bucket
    messagingSenderId: "496801671434", // Firebase Messaging Sender ID
    appId: "1:496801671434:android:83a1943c8ad1632f4e72f3" // Firebase App ID
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  export { auth };