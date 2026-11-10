import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { Project, ProjectFilterCriteria } from '../types';

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
    await setDoc(docRef, {
      ...project,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  },

  async update(projectId: string, updates: Partial<Project>): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async listApproved(criteria?: ProjectFilterCriteria, maxResults: number = 50): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    
    // Base query for approved and non-archived projects
    let q = query(
      colRef,
      where('approvalStatus', '==', 'APPROVED'),
      where('isArchived', '==', false),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    if (criteria?.category && criteria.category !== 'all') {
      q = query(
        colRef,
        where('approvalStatus', '==', 'APPROVED'),
        where('isArchived', '==', false),
        where('category', '==', criteria.category),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
    }

    const snap = await getDocs(q);
    let projects = snap.docs.map((d) => d.data() as Project);

    // Apply in-memory filters for compound search, technology, status, time period, and dynamic sorting
    if (criteria?.searchQuery && criteria.searchQuery.trim().length > 0) {
      const qLower = criteria.searchQuery.toLowerCase().trim();
      projects = projects.filter((p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower) ||
        p.creatorName.toLowerCase().includes(qLower) ||
        p.technologies.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    if (criteria?.technology && criteria.technology !== 'all') {
      const techLower = criteria.technology.toLowerCase();
      projects = projects.filter((p) =>
        p.technologies.some((t) => t.toLowerCase() === techLower)
      );
    }

    if (criteria?.projectStatus && criteria.projectStatus !== 'all') {
      projects = projects.filter((p) => p.projectStatus === criteria.projectStatus);
    }

    if (criteria?.department && criteria.department !== 'all') {
      projects = projects.filter((p) => 
        p.creatorDepartment.toLowerCase() === criteria.department?.toLowerCase()
      );
    }

    if (criteria?.creatorId) {
      projects = projects.filter((p) => p.creatorId === criteria.creatorId);
    }

    // Sort order
    if (criteria?.sortBy) {
      switch (criteria.sortBy) {
        case 'likes':
          projects.sort((a, b) => b.likeCount - a.likeCount || b.createdAt.localeCompare(a.createdAt));
          break;
        case 'votes':
          projects.sort((a, b) => b.totalValidVotes - a.totalValidVotes || b.createdAt.localeCompare(a.createdAt));
          break;
        case 'rating':
          projects.sort((a, b) => b.goodPercentage - a.goodPercentage || b.totalValidVotes - a.totalValidVotes);
          break;
        case 'trending':
          projects.sort((a, b) => b.trendingScore - a.trendingScore || b.createdAt.localeCompare(a.createdAt));
          break;
        case 'newest':
        default:
          projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
      }
    }

    return projects;
  },

  async listByCreator(creatorId: string): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      colRef,
      where('creatorId', '==', creatorId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Project);
  },

  async listPendingReview(): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      colRef,
      where('approvalStatus', '==', 'PENDING_REVIEW'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Project);
  },

  async listAllForAdmin(statusFilter?: string): Promise<Project[]> {
    const colRef = collection(db, PROJECTS_COLLECTION);
    let q = query(colRef, orderBy('createdAt', 'desc'), limit(150));

    if (statusFilter && statusFilter !== 'ALL') {
      q = query(
        colRef,
        where('approvalStatus', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(150)
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Project);
  },
};

