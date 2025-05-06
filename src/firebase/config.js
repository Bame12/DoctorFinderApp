// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDjn6D2MIelGDwnleVX3kXausuz5slswKY",

  authDomain: "doctor-finder-b94c2.firebaseapp.com",

  projectId: "doctor-finder-b94c2",

  storageBucket: "doctor-finder-b94c2.firebasestorage.app",

  messagingSenderId: "489321981801",

  appId: "1:489321981801:web:821d8266c36a1a86213ff8",

  measurementId: "G-T0KDWWM1BE"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { app, db, auth, storage };
