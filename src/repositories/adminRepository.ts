import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { SystemSettings, AuditLog, AdminAnalyticsSummary, UserProfile, Project } from '../types';

const SETTINGS_COLLECTION = 'systemSettings';
const LOGS_COLLECTION = 'adminLogs';
const USERS_COLLECTION = 'users';
const PROJECTS_COLLECTION = 'projects';

const DEFAULT_SETTINGS: SystemSettings = {
  companyDomain: '',
  registrationPolicy: 'INVITE_ONLY',
  arenaMinVoteThreshold: 10,
  maxCoverImageSizeBytes: 5242880, // 5MB
  maxScreenshotsPerProject: 6,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  trendingWindowDays: 7,
  featuredProjectIds: [],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export const adminRepository = {
  async getSettings(): Promise<SystemSettings> {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return snap.data() as SystemSettings;
  },

  async updateSettings(settings: Partial<SystemSettings>, adminUid: string): Promise<void> {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
      },
      { merge: true }
    );
  },

  async listAuditLogs(maxEntries: number = 50): Promise<AuditLog[]> {
    const colRef = collection(db, LOGS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxEntries));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AuditLog);
  },

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const docRef = doc(db, LOGS_COLLECTION, logId);
    await setDoc(docRef, {
      ...log,
      id: logId,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  },

  /**
   * Computes genuine live system aggregates from Firestore documents.
   * Never hardcodes fake numbers!
   */
  async getAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    const projectsSnap = await getDocs(collection(db, PROJECTS_COLLECTION));

    const users = usersSnap.docs.map((d) => d.data() as UserProfile);
    const projects = projectsSnap.docs.map((d) => d.data() as Project);

    const totalEmployees = users.length;
    const activeEmployees = users.filter((u) => u.accountStatus === 'ACTIVE').length;

    let totalApprovedProjects = 0;
    let pendingSubmissions = 0;
    let rejectedSubmissions = 0;
    let totalLikes = 0;
    let totalVotes = 0;

    for (const p of projects) {
      if (p.approvalStatus === 'APPROVED' && !p.isArchived) {
        totalApprovedProjects += 1;
      } else if (p.approvalStatus === 'PENDING_REVIEW') {
        pendingSubmissions += 1;
      } else if (p.approvalStatus === 'REJECTED') {
        rejectedSubmissions += 1;
      }
      totalLikes += p.likeCount || 0;
      totalVotes += p.totalValidVotes || 0;
    }

    return {
      totalEmployees,
      activeEmployees,
      totalApprovedProjects,
      pendingSubmissions,
      rejectedSubmissions,
      totalLikes,
      totalVotes,
    };
  },
};

