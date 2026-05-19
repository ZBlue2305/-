// ╔══════════════════════════════════════════════════════════════╗
// ║  Firebase Configuration for Dar Aishe                       ║
// ║                                                              ║
// ║  HOW TO SET UP:                                              ║
// ║  1. Go to https://console.firebase.google.com                ║
// ║  2. Click "Add project" → name it "dar-aishe"                ║
// ║  3. In the project, click the web icon (</>)                 ║
// ║  4. Register app → copy the config object below              ║
// ║  5. Go to Build → Firestore Database → Create database       ║
// ║     → Start in TEST mode                                     ║
// ║  6. Go to Build → Storage → Get started → Start in TEST mode ║
// ╚══════════════════════════════════════════════════════════════╝

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Auto-detect if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "";

let fireDB = null;
let fireStorage = null;

if (isFirebaseConfigured && typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  fireDB = firebase.firestore();
  fireStorage = firebase.storage();
}

// ── Firebase Helper Functions ──────────────────────────────────

async function fireUploadMedia(file, type) {
  if (!fireStorage || !fireDB) throw new Error('Firebase not configured');
  
  const timestamp = Date.now();
  const safeName = `${type}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const ref = fireStorage.ref(safeName);
  
  const snapshot = await ref.put(file);
  const downloadURL = await snapshot.ref.getDownloadURL();
  
  await fireDB.collection('media').add({
    type: type,
    url: downloadURL,
    storagePath: safeName,
    name: file.name,
    size: file.size,
    timestamp: timestamp
  });
  
  return downloadURL;
}

async function fireGetMedia(type) {
  if (!fireDB) return [];
  try {
    const snapshot = await fireDB.collection('media')
      .where('type', '==', type)
      .orderBy('timestamp', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.warn('Firestore query failed:', e);
    return [];
  }
}

async function fireDeleteMedia(docId, storagePath) {
  if (!fireDB || !fireStorage) return;
  await fireDB.collection('media').doc(docId).delete();
  try {
    await fireStorage.ref(storagePath).delete();
  } catch (e) {
    console.warn('Storage delete failed (file may not exist):', e);
  }
}

async function fireGetSettings() {
  if (!fireDB) return {};
  try {
    const doc = await fireDB.collection('settings').doc('siteConfig').get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    console.warn('Firestore settings read failed:', e);
    return {};
  }
}

async function fireSaveSettings(data) {
  if (!fireDB) throw new Error('Firebase not configured');
  await fireDB.collection('settings').doc('siteConfig').set(data, { merge: true });
}

async function fireUpdateMediaName(docId, newName) {
  if (!fireDB) throw new Error('Firebase not configured');
  await fireDB.collection('media').doc(docId).update({ name: newName });
}
