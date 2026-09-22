/**
 * KALORA — Offline Storage & Draft Mode Service (#30, #31)
 * Manages IndexedDB local storage for caching artisan product drafts when offline
 * and handles background auto-sync upon reconnection.
 */

export interface OfflineDraftItem {
  id: string;
  artisanId?: string;
  productName: string;
  category: string;
  price: number;
  material?: string;
  artisanStory?: string;
  audioBase64?: string;
  createdAt: string;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
}

const DB_NAME = 'KALORA_OFFLINE_DB';
const STORE_NAME = 'artisan_drafts';

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveDraft(draft: Omit<OfflineDraftItem, 'id' | 'createdAt' | 'syncStatus'>): Promise<OfflineDraftItem> {
    const db = await this.initDB();
    const fullItem: OfflineDraftItem = {
      ...draft,
      id: `DRAFT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      syncStatus: 'PENDING'
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fullItem);

      req.onsuccess = () => resolve(fullItem);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingDrafts(): Promise<OfflineDraftItem[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const all: OfflineDraftItem[] = req.result || [];
        resolve(all.filter((item) => item.syncStatus === 'PENDING'));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async markSynced(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result;
        if (item) {
          item.syncStatus = 'SYNCED';
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }
}

export const offlineStorageService = new OfflineStorageService();
