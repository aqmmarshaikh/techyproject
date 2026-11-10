import {
  collection,
  doc,
  setDoc,
  updateDoc,
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
    let q = query(colRef, orderBy('createdAt', 'desc'));

    if (statusFilter && statusFilter !== 'ALL') {
      q = query(colRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ProjectReport);
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
};

