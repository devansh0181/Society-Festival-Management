import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  collection,
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
export const AUTH_DIRECTORY_DOC = '_auth_directory';

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
 * Look up society account in Cloud Firestore across any device / browser.
 * 1. Checks central index at /societies/_auth_directory (O(1) fast lookup)
 * 2. If not found in index, scans /societies collection documents
 * 3. Checks adminMobile, adminEmail, and members array inside society documents
 */
export async function lookupSocietyInCloud(identifier) {
  const cleanInput = identifier?.trim();
  if (!cleanInput) return null;

  const isEmail = cleanInput.includes('@');
  const cleanMobile = cleanInput.replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail = cleanInput.toLowerCase();

  const db = getDb();
  if (!db) return null;

  // 1. Check central index doc: /societies/_auth_directory
  try {
    const dirSnap = await getDoc(doc(db, 'societies', AUTH_DIRECTORY_DOC));
    if (dirSnap.exists()) {
      const dirData = dirSnap.data();
      const matched = isEmail ? dirData[cleanEmail] : dirData[cleanMobile];
      if (matched && matched.societyId) {
        return {
          societyId: matched.societyId,
          societyName: matched.societyName || 'Society Portal',
          adminName: matched.adminName || 'Admin',
          adminMobile: matched.adminMobile || cleanMobile,
          adminEmail: matched.adminEmail || '',
          adminPin: matched.adminPin || '1234',
          passwordHash: matched.passwordHash || '',
          uid: matched.uid || null,
          source: 'cloud_index'
        };
      }
    }
  } catch (err) {
    console.warn('Central directory read warning:', err);
  }

  // 2. Scan /societies collection
  try {
    const societiesSnap = await getDocs(collection(db, 'societies'));
    const validDocs = societiesSnap.docs.filter((d) => !d.id.startsWith('_'));

    let matchedDoc = null;
    let matchedMember = null;

    // Prioritize adminMobile / adminEmail match
    for (const d of validDocs) {
      const data = d.data();
      const soc = data.society || {};
      const docMobile = soc.adminMobile ? soc.adminMobile.replace(/[^0-9]/g, '').slice(-10) : '';
      const docEmail = soc.adminEmail ? soc.adminEmail.trim().toLowerCase() : '';

      if ((!isEmail && docMobile && docMobile === cleanMobile) || (isEmail && docEmail && docEmail === cleanEmail)) {
        matchedDoc = d;
        break;
      }
    }

    // Next check members array if mobile entered
    if (!matchedDoc && !isEmail && cleanMobile.length === 10) {
      for (const d of validDocs) {
        const data = d.data();
        const members = Array.isArray(data.members) ? data.members : [];
        const m = members.find((mem) => mem.phone && mem.phone.replace(/[^0-9]/g, '').slice(-10) === cleanMobile);
        if (m) {
          matchedDoc = d;
          matchedMember = m;
          break;
        }
      }
    }

    // Direct match on societyId or slug
    if (!matchedDoc) {
      const directDoc = validDocs.find(
        (d) => d.id.toLowerCase() === cleanInput.toLowerCase() || 
               (d.data().society?.name && d.data().society.name.toLowerCase() === cleanInput.toLowerCase())
      );
      if (directDoc) matchedDoc = directDoc;
    }

    if (matchedDoc) {
      const docData = matchedDoc.data();
      const soc = docData.society || {};
      const resolved = {
        societyId: matchedDoc.id,
        societyName: soc.name || matchedDoc.id,
        adminName: soc.adminName || (matchedMember ? matchedMember.name : 'Admin'),
        adminMobile: soc.adminMobile || cleanMobile,
        adminEmail: soc.adminEmail || '',
        adminPin: soc.adminPin || '1234',
        passwordHash: soc.passwordHash || '',
        uid: soc.id || matchedDoc.id,
        source: 'cloud_scan'
      };

      // Auto-backfill into central directory for instant future lookups
      const backfillData = {};
      if (resolved.adminMobile) backfillData[resolved.adminMobile] = resolved;
      if (resolved.adminEmail) backfillData[resolved.adminEmail] = resolved;
      backfillData[resolved.societyId] = resolved;
      setDoc(doc(db, 'societies', AUTH_DIRECTORY_DOC), backfillData, { merge: true }).catch(() => {});

      return resolved;
    }
  } catch (err) {
    console.warn('Societies collection scan warning:', err);
  }

  return null;
}

/**
 * Register a new Society / Organization (Multi-tenant SaaS)
 * Stores credentials directly inside /societies/{societyId} and /societies/_auth_directory
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
  const passwordHash = btoa(password);

  // 1. Try Firebase Auth in background (optional, non-blocking)
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      uid = userCred.user.uid;
      if (cleanAdmin) {
        await updateProfile(userCred.user, { displayName: cleanAdmin }).catch(() => {});
      }
    } catch (authErr) {
      console.warn('Firebase Auth notice (cloud store continues):', authErr?.message || authErr);
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead or reset password.');
      }
      if (authErr.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      }
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
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      treasury: {
        bankBalance: 0,
        cashBalance: 0,
        totalReserve: 0
      }
    },
    members: [],
    events: [],
    lastCloudSync: new Date().toISOString()
  };

  const authRecord = {
    uid,
    societyId,
    societyName: cleanName,
    adminName: cleanAdmin,
    adminMobile: cleanMobile,
    adminEmail: cleanEmail,
    adminPin: '1234',
    passwordHash: passwordHash,
    updatedAt: new Date().toISOString()
  };

  // 2. Write to Firestore Cloud database - inside permitted /societies collection
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'societies', societyId), initialSocietyData);
      await setDoc(doc(db, 'societies', AUTH_DIRECTORY_DOC), {
        [cleanMobile]: authRecord,
        [cleanEmail]: authRecord,
        [societyId]: authRecord
      }, { merge: true });
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
    adminPin: '1234',
    passwordHash: passwordHash
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
 * Login user using Mobile Number OR Email + Password across ANY device
 */
export async function loginSocietyUser({ identifier, password }) {
  const cleanInput = identifier?.trim();
  if (!cleanInput) throw new Error('Please enter your mobile number or email address.');
  if (!password) throw new Error('Please enter your password.');

  const isEmail = cleanInput.includes('@');
  const cleanMobile = cleanInput.replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail = cleanInput.toLowerCase();
  const inputHash = btoa(password);

  // 1. Look up account in Cloud Firestore across devices
  let account = await lookupSocietyInCloud(cleanInput);

  // 2. If not found in cloud, fall back to local machine storage
  if (!account) {
    const localAccs = getLocalRegisteredSocieties();
    const key = isEmail ? cleanEmail : cleanMobile;
    if (localAccs[key]) {
      const rec = localAccs[key];
      account = {
        societyId: rec.societyId,
        societyName: rec.societyName,
        adminName: rec.adminName,
        adminMobile: rec.mobile || cleanMobile,
        adminEmail: rec.email || '',
        adminPin: rec.adminPin || '1234',
        passwordHash: rec.passwordHash || '',
        uid: rec.uid,
        source: 'local'
      };
    }
  }

  // 3. If account not found anywhere
  if (!account || !account.societyId) {
    throw new Error(`No society account found for "${cleanInput}". Please check your mobile number or sign up.`);
  }

  // 4. Verify Password
  // Accepts exact passwordHash, OR adminPin, OR if legacy doc has no hash yet, stores this password
  if (account.passwordHash) {
    const isPinMatch = password === account.adminPin || inputHash === btoa(account.adminPin || '1234');
    if (account.passwordHash !== inputHash && !isPinMatch) {
      throw new Error(`Incorrect password for "${account.societyName}". Please check your password or use "Forgot Password".`);
    }
  } else {
    // Legacy society document without stored password: set it now
    account.passwordHash = inputHash;
    const db = getDb();
    if (db) {
      setDoc(doc(db, 'societies', account.societyId), {
        society: { passwordHash: inputHash }
      }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'societies', AUTH_DIRECTORY_DOC), {
        [cleanMobile]: { ...account, passwordHash: inputHash }
      }, { merge: true }).catch(() => {});
    }
  }

  // 5. Try background Firebase Auth sign in if configured
  const auth = getFirebaseAuth();
  if (auth && account.adminEmail) {
    try {
      await signInWithEmailAndPassword(auth, account.adminEmail, password);
    } catch (e) {
      // Firebase auth not configured or email differs; cloud session continues seamlessly
    }
  }

  // 6. Build and cache session record
  const sessionRecord = {
    uid: account.uid || ('user_' + Math.random().toString(36).substring(2, 9)),
    email: account.adminEmail || (account.adminMobile ? `${account.adminMobile}@society.portal` : ''),
    mobile: account.adminMobile || cleanMobile,
    adminName: account.adminName || 'Society Member',
    societyId: account.societyId,
    societyName: account.societyName || 'Society Portal',
    adminPin: account.adminPin || '1234',
    passwordHash: account.passwordHash
  };

  const localAccs = getLocalRegisteredSocieties();
  if (account.adminMobile) localAccs[account.adminMobile] = sessionRecord;
  if (account.adminEmail) localAccs[account.adminEmail] = sessionRecord;
  saveLocalRegisteredSocieties(localAccs);

  localStorage.setItem('shakti_auth_session', JSON.stringify(sessionRecord));
  return { 
    success: true, 
    user: sessionRecord, 
    societyId: sessionRecord.societyId, 
    societyName: sessionRecord.societyName 
  };
}

/**
 * Verifies if a registered society account exists for the given mobile or email
 */
export async function verifyAccountForReset(identifier) {
  const cleanInput = identifier?.trim();
  if (!cleanInput) throw new Error('Please enter your mobile number or email address.');

  let account = await lookupSocietyInCloud(cleanInput);

  if (!account) {
    const isEmail = cleanInput.includes('@');
    const cleanMobile = cleanInput.replace(/[^0-9]/g, '').slice(-10);
    const localAccs = getLocalRegisteredSocieties();
    const key = isEmail ? cleanInput.toLowerCase() : cleanMobile;
    if (localAccs[key]) {
      const rec = localAccs[key];
      account = {
        societyId: rec.societyId,
        societyName: rec.societyName,
        adminName: rec.adminName,
        adminMobile: rec.mobile || cleanMobile,
        adminEmail: rec.email || '',
        adminPin: rec.adminPin || '1234'
      };
    }
  }

  if (!account || !account.societyId) {
    throw new Error(`No society account found for "${cleanInput}". Please check your mobile number or sign up.`);
  }

  // Always check society document directly to ensure freshest Admin PIN
  let freshAdminPin = account.adminPin || '1234';
  const db = getDb();
  if (db && account.societyId) {
    try {
      const sSnap = await getDoc(doc(db, 'societies', account.societyId));
      if (sSnap.exists() && sSnap.data().society?.adminPin) {
        freshAdminPin = sSnap.data().society.adminPin;
      }
    } catch (e) {}
  }

  return {
    exists: true,
    mobile: account.adminMobile,
    email: account.adminEmail,
    societyName: account.societyName || 'Society Portal',
    adminName: account.adminName || 'Admin',
    societyId: account.societyId,
    adminPin: freshAdminPin
  };
}

/**
 * Resets society password directly using Admin PIN verification across any device
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

  // 1. Update Firestore cloud documents inside permitted /societies collection
  const db = getDb();
  if (db && verified.societyId) {
    try {
      // Update society doc
      await setDoc(
        doc(db, 'societies', verified.societyId),
        {
          society: {
            passwordHash: newHash
          },
          lastCloudSync: new Date().toISOString()
        },
        { merge: true }
      );

      // Update central directory
      const authRecord = {
        societyId: verified.societyId,
        societyName: verified.societyName,
        adminName: verified.adminName,
        adminMobile: cleanMobile,
        adminEmail: cleanEmail,
        adminPin: verified.adminPin,
        passwordHash: newHash,
        updatedAt: new Date().toISOString()
      };

      const dirUpdates = {};
      if (cleanMobile) dirUpdates[cleanMobile] = authRecord;
      if (cleanEmail) dirUpdates[cleanEmail] = authRecord;
      dirUpdates[verified.societyId] = authRecord;

      await setDoc(doc(db, 'societies', AUTH_DIRECTORY_DOC), dirUpdates, { merge: true });
    } catch (e) {
      console.warn('Firestore password reset warning:', e);
    }
  }

  // 2. Update local accounts
  const localAccs = getLocalRegisteredSocieties();
  const userRecord = {
    uid: verified.societyId,
    email: cleanEmail,
    mobile: cleanMobile,
    adminName: verified.adminName,
    societyId: verified.societyId,
    societyName: verified.societyName,
    adminPin: verified.adminPin,
    passwordHash: newHash
  };

  if (cleanMobile) localAccs[cleanMobile] = userRecord;
  if (cleanEmail) localAccs[cleanEmail] = userRecord;
  saveLocalRegisteredSocieties(localAccs);

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

    // Keep central directory updated with latest adminPin, name, passwordHash
    if (data.society && societyId !== AUTH_DIRECTORY_DOC) {
      const s = data.society;
      const cleanMobile = s.adminMobile ? s.adminMobile.replace(/[^0-9]/g, '').slice(-10) : '';
      const cleanEmail = s.adminEmail ? s.adminEmail.trim().toLowerCase() : '';
      if (cleanMobile || cleanEmail) {
        const updateRec = {
          societyId,
          societyName: s.name || '',
          adminName: s.adminName || 'Admin',
          adminMobile: cleanMobile,
          adminEmail: cleanEmail,
          adminPin: s.adminPin || '1234',
          ...(s.passwordHash ? { passwordHash: s.passwordHash } : {}),
          updatedAt: new Date().toISOString()
        };
        const dirPatch = {};
        if (cleanMobile) dirPatch[cleanMobile] = updateRec;
        if (cleanEmail) dirPatch[cleanEmail] = updateRec;
        dirPatch[societyId] = updateRec;
        setDoc(doc(db, 'societies', AUTH_DIRECTORY_DOC), dirPatch, { merge: true }).catch(() => {});
      }
    }

    return true;
  } catch (err) {
    console.error(`Failed to write to Cloud Firestore for ${societyId}:`, err);
    throw err;
  }
}
