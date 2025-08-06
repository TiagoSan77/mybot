import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBFredZwbgA0NefOoOfgkrWKRz0AxY4cG8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clientlogin-33401.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clientlogin-33401",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clientlogin-33401.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "691644671893",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:691644671893:web:34b40ab7b9bda7a96bb6bb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obter instância de Auth
export const auth = getAuth(app);
export default app;
