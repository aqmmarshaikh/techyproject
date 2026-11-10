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
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { ProjectRevision, RevisionStatus } from '../types';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';

const REVISIONS_COLLECTION = 'projectRevisions';

export const revisionRepository = {
  async getById(revisionId: string): Promise<ProjectRevision | null> {
    const docRef = doc(db, REVISIONS_COLLECTION, revisionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as ProjectRevision;
  },

  async create(revision: ProjectRevision): Promise<void> {
    const docRef = doc(db, REVISIONS_COLLECTION, revision.id);
    const payload = cleanFirestoreData({
      ...revision,
      createdAt: revision.createdAt || new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    await setDoc(docRef, payload);
  },

  async listByProject(projectId: string): Promise<ProjectRevision[]> {
    const colRef = collection(db, REVISIONS_COLLECTION);
    const q = query(colRef, where('projectId', '==', projectId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as ProjectRevision);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  async listPending(): Promise<ProjectRevision[]> {
    const colRef = collection(db, REVISIONS_COLLECTION);
    const q = query(colRef, where('revisionStatus', '==', 'PENDING_REVIEW'));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as ProjectRevision);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  subscribeToPending(
    onUpdate: (revisions: ProjectRevision[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const colRef = collection(db, REVISIONS_COLLECTION);
    const q = query(colRef, where('revisionStatus', '==', 'PENDING_REVIEW'));

    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as ProjectRevision);
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('[revisionRepository] Pending subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  async updateStatus(
    revisionId: string,
    status: RevisionStatus,
    feedback?: string,
    reviewedBy?: string
  ): Promise<void> {
    const docRef = doc(db, REVISIONS_COLLECTION, revisionId);
    await updateDoc(docRef, {
      revisionStatus: status,
      reviewFeedback: feedback || null,
      reviewedBy: reviewedBy || null,
      reviewedAt: new Date().toISOString(),
    });
  },

  async deleteByProject(projectId: string): Promise<void> {
    try {
      const colRef = collection(db, REVISIONS_COLLECTION);
      const q = query(colRef, where('projectId', '==', projectId));
      const snap = await getDocs(q);
      const deletes = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.allSettled(deletes);
    } catch (err) {
      console.warn('[revisionRepository] Non-fatal revision cleanup warning:', err);
    }
  },
};
