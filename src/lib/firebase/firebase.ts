import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSQ_BANqZL00hBaSbI8e_u2i07zkalJGI",
  authDomain: "mj-pro-b1c3f.firebaseapp.com",
  projectId: "mj-pro-b1c3f",
  storageBucket: "mj-pro-b1c3f.firebasestorage.app",
  messagingSenderId: "662951537010",
  appId: "1:662951537010:web:1712d6dd38180e946595eb",
  measurementId: "G-Z02T460Q6M"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
