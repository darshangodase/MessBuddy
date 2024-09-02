import { initializeApp } from "firebase/app";

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blogbreeze-2264d.firebaseapp.com",
  projectId: "blogbreeze-2264d",
  storageBucket: "blogbreeze-2264d.appspot.com",
  messagingSenderId: "801631747206",
  appId: "1:801631747206:web:bc4ef9cc4a47ed829da507",
  measurementId: "G-EXZ2SZDNLV"
};

export const app = initializeApp(firebaseConfig);
