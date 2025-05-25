// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBckfZmUPQsQBjOfZ5e51j7tocZKkKFf74",
  authDomain: "microprocessor-pit-914bc.firebaseapp.com",
  projectId: "microprocessor-pit-914bc",
  storageBucket: "microprocessor-pit-914bc.appspot.com",
  messagingSenderId: "518807869338",
  appId: "1:518807869338:web:f26ea511b5446313508c23"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
