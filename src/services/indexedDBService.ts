/**
 * IndexedDB Service for persistent local storage
 * Replaces localStorage for credentials and session data
 */

const DB_NAME = 'GiroAsfaltoGameDB';
const DB_VERSION = 1;
const CREDENTIALS_STORE = 'playerCredentials';
const SESSION_STORE = 'playerSession';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB connection
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create credentials store
      if (!database.objectStoreNames.contains(CREDENTIALS_STORE)) {
        database.createObjectStore(CREDENTIALS_STORE, { keyPath: 'email' });
      }

      // Create session store
      if (!database.objectStoreNames.contains(SESSION_STORE)) {
        database.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Store player credentials in IndexedDB
 */
export async function storeCredential(
  email: string,
  hashedPassword: string,
  playerId: string
): Promise<void> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CREDENTIALS_STORE], 'readwrite');
    const store = transaction.objectStore(CREDENTIALS_STORE);

    const credential = {
      email,
      password: hashedPassword,
      playerId,
      createdAt: new Date().toISOString(),
    };

    const request = store.put(credential);

    request.onerror = () => {
      reject(new Error('Failed to store credential'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Retrieve player credentials from IndexedDB
 */
export async function getCredential(email: string): Promise<{
  password: string;
  playerId: string;
  createdAt: string;
} | null> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CREDENTIALS_STORE], 'readonly');
    const store = transaction.objectStore(CREDENTIALS_STORE);
    const request = store.get(email);

    request.onerror = () => {
      reject(new Error('Failed to retrieve credential'));
    };

    request.onsuccess = () => {
      const result = request.result;
      resolve(result || null);
    };
  });
}

/**
 * Check if credential exists
 */
export async function credentialExists(email: string): Promise<boolean> {
  const credential = await getCredential(email);
  return credential !== null;
}

/**
 * Store current session in IndexedDB
 */
export async function storeSession(
  playerId: string,
  email: string
): Promise<void> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);

    const session = {
      id: 'current',
      playerId,
      email,
      timestamp: new Date().toISOString(),
    };

    const request = store.put(session);

    request.onerror = () => {
      reject(new Error('Failed to store session'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Retrieve current session from IndexedDB
 */
export async function getSession(): Promise<{
  playerId: string;
  email: string;
  timestamp: string;
} | null> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.get('current');

    request.onerror = () => {
      reject(new Error('Failed to retrieve session'));
    };

    request.onsuccess = () => {
      const result = request.result;
      resolve(result || null);
    };
  });
}

/**
 * Clear current session from IndexedDB
 */
export async function clearSession(): Promise<void> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.delete('current');

    request.onerror = () => {
      reject(new Error('Failed to clear session'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Delete all credentials (for testing/reset)
 */
export async function clearAllCredentials(): Promise<void> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CREDENTIALS_STORE], 'readwrite');
    const store = transaction.objectStore(CREDENTIALS_STORE);
    const request = store.clear();

    request.onerror = () => {
      reject(new Error('Failed to clear credentials'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Get all stored credentials (for debugging)
 */
export async function getAllCredentials(): Promise<Array<{
  email: string;
  playerId: string;
  createdAt: string;
}>> {
  const database = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CREDENTIALS_STORE], 'readonly');
    const store = transaction.objectStore(CREDENTIALS_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to retrieve credentials'));
    };

    request.onsuccess = () => {
      const results = request.result.map((cred: any) => ({
        email: cred.email,
        playerId: cred.playerId,
        createdAt: cred.createdAt,
      }));
      resolve(results);
    };
  });
}
