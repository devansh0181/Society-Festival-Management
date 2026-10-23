import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_CONFIG_KEY = 'shakti_mandal_firebase_config';
const DEFAULT_SOCIETY_DOC = 'shakti-yuvak-mandal';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBOPHjwr9sWR-LR4-chf6kclb23bwR1rP4",
  authDomain: "shakti-mandal.firebaseapp.com",
  projectId: "shakti-mandal",
  storageBucket: "shakti-mandal.firebasestorage.app",
  messagingSenderId: "928679043566",
  appId: "1:928679043566:web:92607d8aa90fbc0615aeff",
  measurementId: "G-4ZCQHGB7TE"
};

/**
 * Reads Firebase configuration from localStorage, environment variables, or defaults
 */
export function getSavedFirebaseConfig() {
  try {
    // 1. Check custom localStorage configuration
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }

    // 2. Check Vite env variables if set
    if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
        appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
      };
    }

    // 3. Live Production Cloud Database configuration
    return DEFAULT_FIREBASE_CONFIG;
  } catch (e) {
    console.error('Error reading firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    // Reset instance so it re-initializes
    firestoreInstance = null;
    return true;
  } catch (e) {
    console.error('Failed to save firebase config', e);
    return false;
  }
}

export function clearFirebaseConfig() {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
    firestoreInstance = null;
  } catch (e) {
    console.error('Failed to clear firebase config', e);
  }
}

let firestoreInstance = null;

export function initFirebase() {
  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (e) {
    console.error('Failed to initialize Firebase SDK', e);
    return null;
  }
}

export function getDb() {
  if (!firestoreInstance) {
    return initFirebase();
  }
  return firestoreInstance;
}

/**
 * Subscribes in real-time to the society's cloud document.
 * Invokes onDataUpdate(data) whenever any member or admin updates it.
 */
export function subscribeToCloudSociety(societyId = DEFAULT_SOCIETY_DOC, onDataUpdate, onError) {
  const db = getDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'societies', societyId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onDataUpdate(docSnap.data());
        } else {
          onDataUpdate(null);
        }
      },
      (err) => {
        console.error('Firestore snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to cloud society', err);
    if (onError) onError(err);
    return null;
  }
}

/**
 * Saves current society accounts state to Google Cloud Firestore
 */
export async function syncToCloudSociety(societyId = DEFAULT_SOCIETY_DOC, data) {
  const db = getDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'societies', societyId);
    await setDoc(docRef, {
      ...data,
      lastCloudSync: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to write to Cloud Firestore:', err);
    throw err;
  }
}
