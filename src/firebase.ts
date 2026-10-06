import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyOhZaNkFcENK2MjosgeD6qm0DfTGBrRs",
  authDomain: "tahu-kocek-app.firebaseapp.com",
  projectId: "tahu-kocek-app",
  storageBucket: "tahu-kocek-app.firebasestorage.app",
  messagingSenderId: "866596739681",
  appId: "1:866596739681:web:ab433a691b66946e1ba820",
  measurementId: "G-MRPQS87S68",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
