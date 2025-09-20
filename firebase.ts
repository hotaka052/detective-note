/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC49slxqHtpZAmydU9n2MXNXPH3ktB1CJg",
  authDomain: "detective-note-472615.firebaseapp.com",
  projectId: "detective-note-472615",
  storageBucket: "detective-note-472615.firebasestorage.app",
  messagingSenderId: "992859299298",
  appId: "1:992859299298:web:a284656ff2695e3a8c6dbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider };
