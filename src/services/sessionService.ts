// sessionService.ts

class SessionService {
  private dbName: string = 'my-database';
  private storeName: string = 'sessions';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(this.dbName);
    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
    request.onupgradeneeded = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.db.createObjectStore(this.storeName, { keyPath: 'id' });
    };
  }

  public saveToken(token: string) {
    const transaction = this.db?.transaction(this.storeName, 'readwrite');
    const store = transaction?.objectStore(this.storeName);
    const sessionData = { id: 'token', token };
    store?.put(sessionData);
  }

  public getToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction(this.storeName, 'readonly');
      const store = transaction?.objectStore(this.storeName);
      const request = store?.get('token');

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.token : null);
      };
      request.onerror = (event) => {
        reject('Error fetching token');
      };
    });
  }

  public clearToken() {
    const transaction = this.db?.transaction(this.storeName, 'readwrite');
    const store = transaction?.objectStore(this.storeName);
    store?.delete('token');
  }

  public isAuthenticated(): Promise<boolean> {
    return this.getToken().then(token => !!token);
  }
}

export default new SessionService();