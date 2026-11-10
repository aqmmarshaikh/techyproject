import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const CATEGORIES_COLLECTION = 'categories';
const PROJECTS_COLLECTION = 'projects';

export const categoryRepository = {
  async list(): Promise<Category[]> {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(colRef, orderBy('name', 'asc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Seed default categories if collection is currently unpopulated and caller has write permission
      try {
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cat);
        }
      } catch {
        // If caller is non-admin, setDoc may be rejected by security rule; return defaults gracefully
      }
      return DEFAULT_CATEGORIES;
    }

    return snap.docs.map((d) => d.data() as Category);
  },

  async getById(categoryId: string): Promise<Category | null> {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Category;
  },

  async create(category: Category): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
    await setDoc(docRef, {
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  },

  async update(categoryId: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Enforces referential integrity: Checks if any projects reference this category before deletion.
   */
  async canDelete(categoryId: string): Promise<{ canDelete: boolean; projectCount: number }> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(colRef, where('category', '==', categoryId));
    const snap = await getDocs(q);
    const count = snap.size;
    return {
      canDelete: count === 0,
      projectCount: count,
    };
  },

  async delete(categoryId: string): Promise<void> {
    const { canDelete, projectCount } = await this.canDelete(categoryId);
    if (!canDelete) {
      throw new Error(`Cannot delete category: ${projectCount} project(s) are currently categorized under it.`);
    }
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(docRef);
  },
};

