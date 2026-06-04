import { Presentation, OfflineBible } from '../types';

const DB_NAME = 'dalyric_studio_db';
const DB_VERSION = 2;
const STORE_NAME = 'presentations';

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function savePresentations(presentations: Presentation[]): Promise<void> {
  if (presentations.length === 0) return;
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let completed = 0;
    for (const pres of presentations) {
      const req = store.put(pres);
      req.onsuccess = () => { completed++; if (completed === presentations.length) resolve(); };
      req.onerror = () => reject(req.error);
    }
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePresentationsBulk(presentations: Presentation[]): Promise<void> {
  return savePresentations(presentations);
}

export async function getPresentations(): Promise<Presentation[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('WorshipBibleStore', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('bibles')) {
          db.createObjectStore('bibles', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) { reject(e); }
  });
}

export const saveBibleToDB = async (bible: OfflineBible): Promise<void> => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('bibles', 'readwrite');
    const store = tx.objectStore('bibles');
    store.put(bible);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error saving bible to IndexedDB:', err);
  }
};

export const deleteBibleFromDB = async (id: string): Promise<void> => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('bibles', 'readwrite');
    const store = tx.objectStore('bibles');
    store.delete(id);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error deleting bible from IndexedDB:', err);
  }
};

export async function loadBiblesFromDB(): Promise<OfflineBible[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('bibles', 'readonly');
    const store = tx.objectStore('bibles');
    const request = store.getAll();
    return new Promise<OfflineBible[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error loading bibles from IndexedDB:', err);
    return [];
  }
}
