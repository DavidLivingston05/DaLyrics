import { Presentation, OfflineBible } from '../types';

const DB_NAME = 'dalyric_studio_db';
const DB_VERSION = 2;
const STORE_NAME = 'presentations';

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function savePresentations(presentations: Presentation[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear all existing presentations to sync with the in-memory array perfectly
    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      if (presentations.length === 0) {
        resolve();
        return;
      }

      let activeRequestCount = 0;
      let completedOrFailed = false;

      for (const pres of presentations) {
        const putRequest = store.put(pres);
        activeRequestCount++;

        putRequest.onsuccess = () => {
          activeRequestCount--;
          if (activeRequestCount === 0 && !completedOrFailed) {
            resolve();
          }
        };

        putRequest.onerror = (e) => {
          console.error('Error saving presentation item in transaction:', e);
          if (!completedOrFailed) {
            completedOrFailed = true;
            reject(new Error('Failed to save some presentations'));
          }
        };
      }
    };

    clearRequest.onerror = (e) => {
      console.error('Error clearing presentations object store:', e);
      reject(e);
    };

    transaction.onerror = (e) => {
      console.error('Transaction error in savePresentations:', e);
    };
  });
}

export async function getPresentations(): Promise<Presentation[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        console.error('Error reading presentations from IndexedDB:', event);
        reject(new Error('Failed to retrieve presentations'));
      };
    });
  } catch (err) {
    console.error('IndexedDB initialization failed, falling back to empty list:', err);
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
    } catch (e) {
      reject(e);
    }
  });
}

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


