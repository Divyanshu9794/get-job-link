import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 1. Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAdJURK2WoFuP-gTPqdKD9RV516RZQ-ueo",
  authDomain: "get-job-link.firebaseapp.com",
  projectId: "get-job-link",
  storageBucket: "get-job-link.firebasestorage.app",
  messagingSenderId: "90243575495",
  appId: "1:90243575495:web:1b54bee58cd2cadaf298e2",
  measurementId: "G-7LPCET02EM"
};

const app = initializeApp(firebaseConfig);

if (typeof window !== "undefined") {
  getAnalytics(app);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // 2. Export Database instance