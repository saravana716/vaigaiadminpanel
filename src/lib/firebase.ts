// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1IparOzxxgmBG_izKTuq4W2MKfaFMZ9M",
  authDomain: "project1-71847.firebaseapp.com",
  projectId: "project1-71847",
  storageBucket: "project1-71847.appspot.com",
  messagingSenderId: "375856044262",
  appId: "1:375856044262:web:aa81461c8c783572b80327",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
