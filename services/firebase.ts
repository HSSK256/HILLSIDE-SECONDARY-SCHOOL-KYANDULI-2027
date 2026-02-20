
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let db: Firestore;

try {
    // Only initialize if explicitly enabled or if keys are present (optional strategy)
    // Here we rely on the flag to avoid accidental initialization errors
    if (import.meta.env.VITE_USE_FIRESTORE === 'true') {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
} catch (error) {
    console.error("Firebase initialization failed. Check your .env variables.", error);
}

export { db };
