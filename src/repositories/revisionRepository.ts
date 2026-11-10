import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
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
    const q = query(
      colRef,
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ProjectRevision);
  },

  async listPending(): Promise<ProjectRevision[]> {
    const colRef = collection(db, REVISIONS_COLLECTION);
    const q = query(
      colRef,
      where('revisionStatus', '==', 'PENDING_REVIEW'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ProjectRevision);
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
};

