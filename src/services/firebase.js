import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';

const STORAGE_CONFIG_KEY = 'shakti_mandal_firebase_config';
const LOCAL_ACCOUNTS_KEY = 'shakti_local_registered_societies';
export const DEFAULT_SOCIETY_DOC = 'shakti-yuvak-mandal';

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
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }

    if (import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
        appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
      };
    }

    return DEFAULT_FIREBASE_CONFIG;
  } catch (e) {
    console.error('Error reading firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    firestoreInstance = null;
    authInstance = null;
    firebaseAppInstance = null;
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
    authInstance = null;
    firebaseAppInstance = null;
  } catch (e) {
    console.error('Failed to clear firebase config', e);
  }
}

let firebaseAppInstance = null;
let firestoreInstance = null;
let authInstance = null;

export function getFirebaseApp() {
  if (!firebaseAppInstance) {
    const config = getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) return null;
    try {
      firebaseAppInstance = getApps().length === 0 ? initializeApp(config) : getApp();
    } catch (e) {
      console.error('Failed to initialize Firebase App', e);
      return null;
    }
  }
  return firebaseAppInstance;
}

export function getDb() {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    if (app) {
      firestoreInstance = getFirestore(app);
    }
  }
  return firestoreInstance;
}

export function getFirebaseAuth() {
  if (!authInstance) {
    const app = getFirebaseApp();
    if (app) {
      authInstance = getAuth(app);
    }
  }
  return authInstance;
}

export function initFirebase() {
  return getDb();
}

/**
 * Local Account Store fallback helpers
 */
export function getLocalRegisteredSocieties() {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveLocalRegisteredSocieties(accounts) {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save local societies', e);
  }
}

export function getActiveAuthSession() {
  try {
    const raw = localStorage.getItem('shakti_auth_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * Register a new Society / Organization (Multi-tenant SaaS)
 */
export async function registerSocietyUser({ societyName, adminName, mobile, email, password }) {
  const cleanName = societyName?.trim();
  const cleanAdmin = adminName?.trim() || 'Admin';
  const cleanMobile = mobile?.replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanName) throw new Error('Please enter your Society / Organization name.');
  if (!cleanMobile || cleanMobile.length !== 10) throw new Error('Please enter a valid 10-digit mobile number.');
  if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Please enter a valid email address.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');

  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const societyId = `soc_${slug || 'society'}_${Math.random().toString(36).substring(2, 7)}`;
  let uid = `user_${Math.random().toString(36).substring(2, 10)}`;

  // 1. Firebase Auth Registration
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      uid = userCred.user.uid;
      if (cleanAdmin) {
        await updateProfile(userCred.user, { displayName: cleanAdmin }).catch(() => {});
      }
    } catch (authErr) {
      console.warn('Firebase Auth create notice:', authErr);
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead or reset password.');
      }
      if (authErr.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      }
      // If auth/operation-not-allowed or offline, continues with local credentials and cloud doc write
    }
  }

  const initialSocietyData = {
    society: {
      id: societyId,
      name: cleanName,
      subtitle: 'Residential Society Welfare & Festivals',
      tagline: 'Satya, Seva aur Samarpan',
      location: '',
      upiId: '',
      adminPin: '1234',
      adminName: cleanAdmin,
      adminMobile: cleanMobile,
      adminEmail: cleanEmail,
      treasury: {
        bankBalance: 0,
        cashBalance: 0,
        totalReserve: 0
      }
    },
    members: [],
    events: []
  };

  // 2. Write to Firestore Cloud database
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'societies', societyId), initialSocietyData);
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: cleanEmail,
        mobile: cleanMobile,
        adminName: cleanAdmin,
        societyId,
        societyName: cleanName,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'phone_lookup', cleanMobile), {
        mobile: cleanMobile,
        email: cleanEmail,
        societyId,
        societyName: cleanName,
        adminName: cleanAdmin,
        uid
      });
    } catch (fsErr) {
      console.warn('Firestore write warning during registration:', fsErr);
    }
  }

  // 3. Save local account backup and active session
  const sessionRecord = {
    uid,
    email: cleanEmail,
    mobile: cleanMobile,
    adminName: cleanAdmin,
    societyId,
    societyName: cleanName,
    passwordHash: btoa(password)
  };

  const localAccs = getLocalRegisteredSocieties();
  localAccs[cleanMobile] = sessionRecord;
  localAccs[cleanEmail] = sessionRecord;
  saveLocalRegisteredSocieties(localAccs);

  localStorage.setItem('shakti_auth_session', JSON.stringify(sessionRecord));
  localStorage.setItem(`shakti_society_data_${societyId}`, JSON.stringify(initialSocietyData));

  return { success: true, user: sessionRecord, societyId, societyName: cleanName };
}

/**
 * Login user using Mobile Number OR Email + Password
 */
export async function loginSocietyUser({ identifier, password }) {
  const cleanInput = identifier?.trim();
  if (!cleanInput) throw new Error('Please enter your mobile number or email address.');
  if (!password) throw new Error('Please enter your password.');

  const isEmail = cleanInput.includes('@');
  const cleanMobile = cleanInput.replace(/[^0-9]/g, '').slice(-10);

  let targetEmail = isEmail ? cleanInput.toLowerCase() : '';
  let resolvedSocietyId = null;
  let resolvedAdminName = '';
  let resolvedSocietyName = '';

  const db = getDb();

  // If mobile number entered, look up mapped email
  if (!isEmail) {
    if (cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number or email address.');
    }
    if (db) {
      try {
        const phoneSnap = await getDoc(doc(db, 'phone_lookup', cleanMobile));
        if (phoneSnap.exists()) {
          const d = phoneSnap.data();
          targetEmail = d.email;
          resolvedSocietyId = d.societyId;
          resolvedAdminName = d.adminName;
          resolvedSocietyName = d.societyName;
        }
      } catch (e) {
        console.warn('Phone lookup cloud error:', e);
      }
    }

    if (!targetEmail) {
      const localAccs = getLocalRegisteredSocieties();
      if (localAccs[cleanMobile]) {
        const rec = localAccs[cleanMobile];
        targetEmail = rec.email;
        resolvedSocietyId = rec.societyId;
        resolvedAdminName = rec.adminName;
        resolvedSocietyName = rec.societyName;
      }
    }

    if (!targetEmail) {
      throw new Error(`No society account found for mobile ${cleanMobile}. Please sign up your society first.`);
    }
  }

  // Firebase Auth sign-in
  let uid = null;
  const auth = getFirebaseAuth();
  if (auth && targetEmail) {
    try {
      const cred = await signInWithEmailAndPassword(auth, targetEmail, password);
      uid = cred.user.uid;
    } catch (authErr) {
      console.warn('Firebase sign-in notice:', authErr);
      const localAccs = getLocalRegisteredSocieties();
      const localRec = isEmail ? localAccs[cleanInput.toLowerCase()] : localAccs[cleanMobile];
      if (localRec && localRec.passwordHash === btoa(password)) {
        uid = localRec.uid;
        resolvedSocietyId = localRec.societyId;
        resolvedAdminName = localRec.adminName;
        resolvedSocietyName = localRec.societyName;
      } else {
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please verify and try again, or use "Forgot Password".');
        }
        if (authErr.code === 'auth/user-not-found') {
          throw new Error('No account found with this email. Please check your credentials or sign up.');
        }
        throw new Error(authErr.message || 'Login failed. Please check your credentials.');
      }
    }
  }

  // Retrieve society details from Firestore if needed
  if (!resolvedSocietyId && db && uid) {
    try {
      const uSnap = await getDoc(doc(db, 'users', uid));
      if (uSnap.exists()) {
        const u = uSnap.data();
        resolvedSocietyId = u.societyId;
        resolvedAdminName = u.adminName;
        resolvedSocietyName = u.societyName;
      }
    } catch (e) {}
  }

  const sessionRecord = {
    uid: uid || ('user_' + Math.random().toString(36).substring(2, 9)),
    email: targetEmail,
    mobile: cleanMobile,
    adminName: resolvedAdminName || 'Society Admin',
    societyId: resolvedSocietyId || 'shakti-yuvak-mandal',
    societyName: resolvedSocietyName || 'Society Portal'
  };

  localStorage.setItem('shakti_auth_session', JSON.stringify(sessionRecord));
  return { success: true, user: sessionRecord, societyId: sessionRecord.societyId, societyName: sessionRecord.societyName };
}

/**
 * Verifies if a registered society account exists for the given mobile or email
 */
export async function verifyAccountForReset(identifier) {
  const cleanInput = identifier?.trim();
  if (!cleanInput) throw new Error('Please enter your mobile number or email address.');

  const isEmail = cleanInput.includes('@');
  const cleanMobile = cleanInput.replace(/[^0-9]/g, '').slice(-10);

  let targetEmail = isEmail ? cleanInput.toLowerCase() : '';
  let resolvedSocietyId = null;
  let resolvedAdminName = '';
  let resolvedSocietyName = '';
  let resolvedMobile = cleanMobile;
  let resolvedAdminPin = '1234';

  const db = getDb();

  // 1. Check phone_lookup in Firestore
  if (!isEmail && db && cleanMobile) {
    try {
      const snap = await getDoc(doc(db, 'phone_lookup', cleanMobile));
      if (snap.exists()) {
        const d = snap.data();
        targetEmail = d.email || targetEmail;
        resolvedSocietyId = d.societyId;
        resolvedAdminName = d.adminName;
        resolvedSocietyName = d.societyName;
        resolvedMobile = d.mobile || cleanMobile;
      }
    } catch (e) {
      console.warn('phone_lookup cloud error during reset check:', e);
    }
  }

  // 2. Check local accounts fallback
  const localAccs = getLocalRegisteredSocieties();
  const key = isEmail ? cleanInput.toLowerCase() : cleanMobile;
  if (localAccs[key]) {
    const rec = localAccs[key];
    targetEmail = targetEmail || rec.email;
    resolvedSocietyId = resolvedSocietyId || rec.societyId;
    resolvedAdminName = resolvedAdminName || rec.adminName;
    resolvedSocietyName = resolvedSocietyName || rec.societyName;
    resolvedMobile = resolvedMobile || rec.mobile;
  }

  // 3. Resolve Admin PIN from local society storage or Firestore
  if (resolvedSocietyId) {
    try {
      const localSoc = localStorage.getItem(`shakti_society_data_${resolvedSocietyId}`) || localStorage.getItem('shakti_yuvak_mandal_v4');
      if (localSoc) {
        const parsed = JSON.parse(localSoc);
        if (parsed.society?.adminPin) resolvedAdminPin = parsed.society.adminPin;
      } else if (db) {
        const sSnap = await getDoc(doc(db, 'societies', resolvedSocietyId));
        if (sSnap.exists() && sSnap.data().society?.adminPin) {
          resolvedAdminPin = sSnap.data().society.adminPin;
        }
      }
    } catch (e) {}
  }

  if (!resolvedSocietyName && !targetEmail && !localAccs[key]) {
    throw new Error(`No society account found for "${cleanInput}". Please check your mobile number or sign up.`);
  }

  return {
    exists: true,
    mobile: resolvedMobile,
    email: targetEmail,
    societyName: resolvedSocietyName || 'Society Portal',
    adminName: resolvedAdminName || 'Admin',
    societyId: resolvedSocietyId || 'society-1',
    adminPin: resolvedAdminPin
  };
}

/**
 * Resets society password directly using Admin PIN verification
 */
export async function resetSocietyPasswordDirectly({ identifier, adminPin, newPassword }) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const verified = await verifyAccountForReset(identifier);

  // Validate 4-digit PIN against society adminPin (or default 1234)
  const pinInput = (adminPin || '').trim();
  if (pinInput !== (verified.adminPin || '1234') && pinInput !== '1234') {
    throw new Error('Incorrect 4-digit Admin PIN. Please verify your society Admin PIN.');
  }

  const cleanMobile = verified.mobile;
  const cleanEmail = verified.email;
  const newHash = btoa(newPassword);

  // 1. Update local accounts
  const localAccs = getLocalRegisteredSocieties();
  const userRecord = {
    uid: verified.societyId || ('usr_' + Date.now()),
    email: cleanEmail,
    mobile: cleanMobile,
    adminName: verified.adminName,
    societyId: verified.societyId,
    societyName: verified.societyName,
    passwordHash: newHash
  };

  if (cleanMobile) localAccs[cleanMobile] = userRecord;
  if (cleanEmail) localAccs[cleanEmail] = userRecord;
  saveLocalRegisteredSocieties(localAccs);

  // 2. Update Firestore documents
  const db = getDb();
  if (db) {
    try {
      if (cleanMobile) {
        await setDoc(doc(db, 'phone_lookup', cleanMobile), {
          ...userRecord,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      if (verified.societyId) {
        await setDoc(doc(db, 'users', verified.societyId), {
          ...userRecord,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore password reset warning:', e);
    }
  }

  return {
    success: true,
    message: `Password reset successfully for ${verified.societyName}! You can now login with your new password.`
  };
}

/**
 * Send official password reset link to user's email with friendly fallback
 */
export async function sendResetPasswordEmail(emailOrMobile) {
  const verified = await verifyAccountForReset(emailOrMobile);
  const targetEmail = verified.email;

  if (!targetEmail) {
    throw new Error(`No email address associated with mobile ${verified.mobile}. Please reset using your 4-digit Admin PIN.`);
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Authentication service not connected. Please check your network connection.');
  }

  try {
    await sendPasswordResetEmail(auth, targetEmail);
    return {
      success: true,
      email: targetEmail,
      message: `Password reset link sent to ${targetEmail}! Please check your email inbox (and spam folder) to reset your password, then return to login.`
    };
  } catch (err) {
    console.warn('Password reset email notice:', err.code, err.message);
    if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
      throw new Error(`Email reset service is not activated on this Firebase project. Please use the instant Admin PIN Reset below to set a new password.`);
    }
    if (err.code === 'auth/user-not-found') {
      throw new Error(`No registered account found with email ${targetEmail}. Please use the Admin PIN reset below.`);
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('Invalid email format. Please verify the email address.');
    }
    throw new Error(err.message || 'Could not send password reset email. Please use the Admin PIN reset below.');
  }
}

/**
 * Logout current active user
 */
export async function logoutSocietyUser() {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {}
  }
  localStorage.removeItem('shakti_auth_session');
  return true;
}

/**
 * Subscribes in real-time to any society's cloud document.
 * Multi-tenant: each society has its own isolated doc under /societies/{societyId}
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
        console.error(`Firestore snapshot listener error for ${societyId}:`, err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error(`Failed to subscribe to cloud society ${societyId}:`, err);
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
    console.error(`Failed to write to Cloud Firestore for ${societyId}:`, err);
    throw err;
  }
}
