import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBq9UKtBS6tt7iqY1xM5ofdk-x2TYT6bTY",
    authDomain: "api-oasis-go.firebaseapp.com",
    projectId: "api-oasis-go",
    storageBucket: "api-oasis-go.firebasestorage.app",
    messagingSenderId: "675036930748",
    appId: "1:675036930748:web:3599384d825ee98bf1a6b9",
    measurementId: "G-KBKCSH4L4M"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, analytics, auth, storage };