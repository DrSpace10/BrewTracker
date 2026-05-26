// js/firebase.js
// Importando as ferramentas do Firebase (Versão Modular via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// SUAS CHAVES DO FIREBASE VÃO AQUI (Substitua esse bloco pelo seu)
const firebaseConfig = {
  apiKey: "AIzaSyAyt1-hmV_ZVcLE8pjY6P1pHY0Ggvys5XY",
  authDomain: "brewtracker-1a321.firebaseapp.com",
  projectId: "brewtracker-1a321",
  storageBucket: "brewtracker-1a321.firebasestorage.app",
  messagingSenderId: "805002480752",
  appId: "1:805002480752:web:b3daff5ec34bc13472b8b5"
};

// Inicializa o App, a Autenticação e o Banco de Dados
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);