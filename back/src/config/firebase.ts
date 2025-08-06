import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBFredZwbgA0NefOoOfgkrWKRz0AxY4cG8",
  authDomain: "clientlogin-33401.firebaseapp.com",
  projectId: "clientlogin-33401",
  storageBucket: "clientlogin-33401.firebasestorage.app",
  messagingSenderId: "240403489849",
  appId: "1:240403489849:web:d875468cd89354a43259e8",
  measurementId: "G-14W6KEW3GD"
};

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: any;
  private auth: Auth;
  private firestore: Firestore;
  private storage: FirebaseStorage;

  private constructor() {
    // Inicializar Firebase
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    this.storage = getStorage(this.app);
    
    console.log('🔥 Firebase inicializado com sucesso!');
    console.log(`📦 Project ID: ${firebaseConfig.projectId}`);
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public getApp() {
    return this.app;
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getFirestore(): Firestore {
    return this.firestore;
  }

  public getStorage(): FirebaseStorage {
    return this.storage;
  }

  public getConfig() {
    return {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket
    };
  }
}

export default FirebaseConfig;
