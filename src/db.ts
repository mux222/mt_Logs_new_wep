import { User, Ticket, Ban } from './types';

const DB_NAME = 'MT_Logs_DB';
const DB_VERSION = 7; // Incremented for personal_notes store

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'user' });
      }

      if (!db.objectStoreNames.contains('tickets')) {
        const ticketStore = db.createObjectStore('tickets', { keyPath: 'id' });
        ticketStore.createIndex('creator', 'creator');
        ticketStore.createIndex('status', 'status');
      }

      if (!db.objectStoreNames.contains('bans')) {
        const banStore = db.createObjectStore('bans', { keyPath: 'id' });
        banStore.createIndex('discordId', 'discordId');
        banStore.createIndex('type', 'type');
        banStore.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('audit_logs')) {
        const logStore = db.createObjectStore('audit_logs', { keyPath: 'id' });
        logStore.createIndex('userId', 'userId');
        logStore.createIndex('timestamp', 'timestamp');
      }

      if (!db.objectStoreNames.contains('personal_notes')) {
        const noteStore = db.createObjectStore('personal_notes', { keyPath: 'id' });
        noteStore.createIndex('userId', 'userId');
        noteStore.createIndex('updatedAt', 'updatedAt');
      }
    };
  });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const putItem = <T>(storeName: string, item: T): Promise<void> => {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
};

export const deleteItem = (storeName: string, key: any): Promise<void> => {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
};
