import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Reemplaza con tu configuración
const firebaseConfig = {
  apiKey: "AIzaSyBYuaAVyjameyEy6cALQsNM1bR39ck1CZ4",
  authDomain: "tu-parque-bo.firebaseapp.com",
  projectId: "tu-parque-bo",
  storageBucket: "tu-parque-bo.firebasestorage.app",
  messagingSenderId: "295913213710",
  appId: "1:295913213710:android:5b387e3211728b1b64d15f"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore
export const db = getFirestore(app);