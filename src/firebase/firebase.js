import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // NUEVO: Importar Storage

// Reemplaza con tu configuración
const firebaseConfig = {
  apiKey: "AIzaSyBYuaAVyjameyEy6cALQsNM1bR39ck1CZ4",
  authDomain: "tu-parque-bo.firebaseapp.com",
  projectId: "tu-parque-bo",
  storageBucket: "tu-parque-bo.appspot.com", // Asegúrate que sea el correcto, usualmente termina en appspot.com
  messagingSenderId: "295913213710",
  appId: "1:295913213710:android:5b387e3211728b1b64d15f"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás
export const db = getFirestore(app);
export const storage = getStorage(app); // NUEVO: Exportar Storage