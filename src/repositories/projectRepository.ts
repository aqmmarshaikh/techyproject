import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { Project, ProjectFilterCriteria } from '../types';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';

const PROJECTS_COLLECTION = 'projects';

export const projectRepository = {
  async getById(projectId: string): Promise<Project | null> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Project;
  },

  async create(project: Project): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, project.id);
    const payload = cleanFirestoreData({
      ...project,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    await setDoc(docRef, payload);
  },

  async update(projectId: string, updates: Partial<Project>): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const payload = cleanFirestoreData({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, payload);
  },

  /**
   * Fetches approved projects and applies in-memory filtering and sorting.
   * Uses single-field equality in Firestore to avoid requiring composite indexes on unindexed collections.
   */
  async listApproved(criteria?: ProjectFilterCriteria, maxResults: number = 60): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      colRef,
      where('approvalStatus', '==', 'APPROVED'),
      limit(Math.max(maxResults, 120))
    );

    const snap = await getDocs(q);
    let projects = snap.docs.map((d) => d.data() as Project);

    // Apply in-memory non-archived rule
    projects = projects.filter((p) => !p.isArchived);

    // Exclude legacy dummy profiles if any
    projects = projects.filter((p) => !p.creatorId?.startsWith('usr_'));

    // Category filter
    if (criteria?.category && criteria.category !== 'all') {
      projects = projects.filter((p) => p.category === criteria.category);
    }

    // Technology filter
    if (criteria?.technology && criteria.technology !== 'all') {
      const techLower = criteria.technology.toLowerCase();
      projects = projects.filter((p) =>
        p.technologies?.some((t) => t.toLowerCase() === techLower)
      );
    }

    // Project Status filter
    if (criteria?.projectStatus && criteria.projectStatus !== 'all') {
      projects = projects.filter((p) => p.projectStatus === criteria.projectStatus);
    }

    // Department filter
    if (criteria?.department && criteria.department !== 'all') {
      const deptLower = criteria.department.toLowerCase();
      projects = projects.filter(
        (p) => (p.creatorDepartment || '').toLowerCase() === deptLower
      );
    }

    // Creator ID filter
    if (criteria?.creatorId) {
      projects = projects.filter((p) => p.creatorId === criteria.creatorId);
    }

    // Text search filter
    if (criteria?.searchQuery && criteria.searchQuery.trim().length > 0) {
      const qLower = criteria.searchQuery.toLowerCase().trim();
      projects = projects.filter((p) =>
        p.title?.toLowerCase().includes(qLower) ||
        p.description?.toLowerCase().includes(qLower) ||
        p.creatorName?.toLowerCase().includes(qLower) ||
        p.technologies?.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    // Dynamic sorting
    if (criteria?.sortBy) {
      switch (criteria.sortBy) {
        case 'likes':
          projects.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));
          break;
        case 'votes':
          projects.sort((a, b) => (b.totalValidVotes || 0) - (a.totalValidVotes || 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));
          break;
        case 'rating':
          projects.sort((a, b) => (b.goodPercentage || 0) - (a.goodPercentage || 0) || (b.totalValidVotes || 0) - (a.totalValidVotes || 0));
          break;
        case 'trending':
          projects.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));
          break;
        case 'newest':
        default:
          projects.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          break;
      }
    } else {
      projects.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }

    return projects.slice(0, maxResults);
  },

  /**
   * Subscribes to real-time updates for approved projects.
   */
  subscribeToApproved(onUpdate: (projects: Project[]) => void, onError?: (err: Error) => void): () => void {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      colRef,
      where('approvalStatus', '==', 'APPROVED'),
      limit(150)
    );

    return onSnapshot(
      q,
      (snap) => {
        let items = snap.docs.map((d) => d.data() as Project);
        items = items.filter((p) => !p.isArchived && !p.creatorId?.startsWith('usr_'));
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('[projectRepository] Approved subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Fetches all projects submitted by a specific user.
   * Single-field equality filter guarantees zero composite index requirements.
   */
  async listByCreator(creatorId: string): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(colRef, where('creatorId', '==', creatorId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as Project);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  /**
   * Real-time subscription to an employee's personal projects.
   */
  subscribeToMyProjects(
    creatorId: string,
    onUpdate: (projects: Project[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(colRef, where('creatorId', '==', creatorId));

    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Project);
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('[projectRepository] MyProjects subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Fetches all pending review projects for admin queue.
   */
  async listPendingReview(): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(colRef, where('approvalStatus', '==', 'PENDING_REVIEW'));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as Project);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  /**
   * Real-time subscription to pending review submissions for the Admin Control Center.
   */
  subscribeToPendingReview(
    onUpdate: (projects: Project[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(colRef, where('approvalStatus', '==', 'PENDING_REVIEW'));

    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Project);
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('[projectRepository] PendingReview subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Lists all projects for admin management with optional status filter.
   */
  async listAllForAdmin(statusFilter?: string): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    let q = query(colRef, limit(200));

    if (statusFilter && statusFilter !== 'ALL') {
      q = query(colRef, where('approvalStatus', '==', statusFilter), limit(200));
    }

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as Project);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  /**
   * Real-time subscription for all projects for Admin Overview & Management.
   */
  subscribeToAllForAdmin(
    onUpdate: (projects: Project[]) => void,
    statusFilter?: string,
    onError?: (err: Error) => void
  ): () => void {
    const colRef = collection(db, PROJECTS_COLLECTION);
    let q = query(colRef, limit(200));

    if (statusFilter && statusFilter !== 'ALL') {
      q = query(colRef, where('approvalStatus', '==', statusFilter), limit(200));
    }

    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Project);
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('[projectRepository] AllForAdmin subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  async delete(projectId: string): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
  },
};
