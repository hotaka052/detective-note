/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Fix: Import from firebase/compat/app and firebase/compat/auth for authentication to resolve import errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
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
const app = firebase.initializeApp(firebaseConfig);
// Fix: Use compat auth to resolve import errors, while keeping modular firestore.
const auth = app.auth();
const db = getFirestore(app);

export { auth, db };