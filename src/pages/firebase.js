// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBckfZmUPQsQBjOfZ5e51j7tocZKkKFf74",
  authDomain: "microprocessor-pit-914bc.firebaseapp.com",
  projectId: "microprocessor-pit-914bc",
  storageBucket: "microprocessor-pit-914bc.firebasestorage.app",
  messagingSenderId: "518807869338",
  appId: "1:518807869338:web:f26ea511b5446313508c23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
