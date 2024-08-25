// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blogbreeze-2264d.firebaseapp.com",
  projectId: "blogbreeze-2264d",
  storageBucket: "blogbreeze-2264d.appspot.com",
  messagingSenderId: "801631747206",
  appId: "1:801631747206:web:bc4ef9cc4a47ed829da507",
  measurementId: "G-EXZ2SZDNLV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
