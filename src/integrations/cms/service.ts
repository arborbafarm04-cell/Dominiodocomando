import { CrudServiceOptions, CrudServiceResult } from '@/integrations/cms/types';

/**
 * BaseCrudService - Mock implementation for local development
 * In production, this would connect to Wix CMS collections
 */
export class BaseCrudService {
  private static store: Map<string, any[]> = new Map();

  static async create<T extends { _id: string }>(
    collectionId: string,
    itemData: T,
    multiRefs?: Record<string, string[]>
  ): Promise<T> {
    if (!this.store.has(collectionId)) {
      this.store.set(collectionId, []);
    }
    
    const collection = this.store.get(collectionId)!;
    const item = { ...itemData, ...multiRefs };
    collection.push(item);
    
    return item;
  }

  static async getAll<T>(
    collectionId: string,
    refs?: { singleRef?: string[]; multiRef?: string[] },
    options?: { limit?: number; skip?: number }
  ): Promise<CrudServiceResult<T>> {
    const collection = this.store.get(collectionId) || [];
    const limit = options?.limit || 50;
    const skip = options?.skip || 0;
    
    const items = collection.slice(skip, skip + limit) as T[];
    const totalCount = collection.length;
    const hasNext = skip + limit < totalCount;
    
    return {
      items,
      totalCount,
      hasNext,
      currentPage: Math.floor(skip / limit),
      pageSize: limit,
      nextSkip: hasNext ? skip + limit : null,
    };
  }

  static async getById<T>(
    collectionId: string,
    itemId: string,
    refs?: { singleRef?: string[]; multiRef?: string[] }
  ): Promise<T | null> {
    const collection = this.store.get(collectionId) || [];
    return collection.find((item: any) => item._id === itemId) || null;
  }

  static async update<T extends { _id: string }>(
    collectionId: string,
    itemData: Partial<T> & { _id: string }
  ): Promise<T> {
    const collection = this.store.get(collectionId) || [];
    const index = collection.findIndex((item: any) => item._id === itemData._id);
    
    if (index === -1) {
      throw new Error(`Item with id ${itemData._id} not found`);
    }
    
    collection[index] = { ...collection[index], ...itemData };
    return collection[index];
  }

  static async delete<T>(collectionId: string, itemId: string): Promise<void> {
    const collection = this.store.get(collectionId) || [];
    const index = collection.findIndex((item: any) => item._id === itemId);
    
    if (index !== -1) {
      collection.splice(index, 1);
    }
  }

  static async addReferences(
    collectionId: string,
    itemId: string,
    refs: Record<string, string[]>
  ): Promise<void> {
    const collection = this.store.get(collectionId) || [];
    const item = collection.find((i: any) => i._id === itemId);
    
    if (item) {
      Object.entries(refs).forEach(([key, values]) => {
        if (!item[key]) {
          item[key] = [];
        }
        item[key] = [...new Set([...item[key], ...values])];
      });
    }
  }

  static async removeReferences(
    collectionId: string,
    itemId: string,
    refs: Record<string, string[]>
  ): Promise<void> {
    const collection = this.store.get(collectionId) || [];
    const item = collection.find((i: any) => i._id === itemId);
    
    if (item) {
      Object.entries(refs).forEach(([key, values]) => {
        if (item[key]) {
          item[key] = item[key].filter((v: string) => !values.includes(v));
        }
      });
    }
  }
}
