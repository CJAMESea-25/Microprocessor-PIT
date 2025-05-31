import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDlzhu_eSDIMehcoB9tbQvqD9_2DU-gC9g",
  authDomain: "micropit2.firebaseapp.com",
  projectId: "micropit2",
  storageBucket: "micropit2.firebasestorage.app",
  messagingSenderId: "520952971688",
  appId: "1:520952971688:web:cb3b48d5030a414f729d9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);



export { auth, db, storage };
