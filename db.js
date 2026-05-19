// db.js
const DB_NAME = 'DarAisheDB';
const DB_VERSION = 1;

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('media')) {
            const store = db.createObjectStore('media', { keyPath: 'id', autoIncrement: true });
            store.createIndex('type', 'type', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
});

async function addMedia(type, dataUrl) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('media', 'readwrite');
        const store = tx.objectStore('media');
        const request = store.add({ type, dataUrl, timestamp: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getMedia(type) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('media', 'readonly');
        const store = tx.objectStore('media');
        const index = store.index('type');
        const request = index.getAll(type);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteMedia(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('media', 'readwrite');
        const store = tx.objectStore('media');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function setSetting(key, value) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getSetting(key) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
    });
}

async function getAllSettings() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const request = store.getAll();
        request.onsuccess = () => {
            const result = {};
            request.result.forEach(item => {
                result[item.key] = item.value;
            });
            resolve(result);
        };
        request.onerror = () => reject(request.error);
    });
}
