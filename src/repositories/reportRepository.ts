import {
  collection,
  doc,
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
import { ProjectReport, ReportStatus } from '../types';

const REPORTS_COLLECTION = 'reports';

export const reportRepository = {
  async create(report: ProjectReport): Promise<void> {
    const docRef = doc(db, REPORTS_COLLECTION, report.id);
    await setDoc(docRef, {
      ...report,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  },

  async list(statusFilter?: ReportStatus | 'ALL'): Promise<ProjectReport[]> {
    const colRef = collection(db, REPORTS_COLLECTION);
    let q = query(colRef);

    if (statusFilter && statusFilter !== 'ALL') {
      q = query(colRef, where('status', '==', statusFilter));
    }

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as ProjectReport);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  async updateStatus(
    reportId: string, 
    status: ReportStatus, 
    adminNotes?: string, 
    actionTaken?: string
  ): Promise<void> {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(docRef, {
      status,
      adminNotes: adminNotes || null,
      actionTaken: actionTaken || null,
      resolvedAt: status !== 'PENDING' ? new Date().toISOString() : null,
    });
  },

  async deleteByProject(projectId: string): Promise<void> {
    try {
      const colRef = collection(db, REPORTS_COLLECTION);
      const q = query(colRef, where('projectId', '==', projectId));
      const snap = await getDocs(q);
      const deletes = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.allSettled(deletes);
    } catch (err) {
      console.warn('[reportRepository] Non-fatal report cleanup warning:', err);
    }
  },
};

