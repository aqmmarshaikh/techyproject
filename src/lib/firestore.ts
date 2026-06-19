import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, ProjectSubmission, Settings } from '../types';

// ==========================================
// SETTINGS
// ==========================================

export const getSettings = async (): Promise<Settings | null> => {
  const docRef = doc(db, 'settings', 'config');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as Settings;
  }
  return null;
};

export const updateSettings = async (updates: Partial<Settings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'config');
  await updateDoc(docRef, updates);
};

export const verifySubmissionPassword = async (password: string): Promise<boolean> => {
  const settings = await getSettings();
  if (!settings) return false;
  return settings.submissionPassword === password;
};

// ==========================================
// SUBMISSIONS & OWNERSHIP
// ==========================================

export const submitProject = async (data: Omit<ProjectSubmission, 'id' | 'submittedAt' | 'approvalStatus'>): Promise<string> => {
  const projectsRef = collection(db, 'projects');
  const docRef = await addDoc(projectsRef, {
    ...data,
    approvalStatus: 'pending',
    editedAfterApproval: false,
    likesCount: 0,
    viewsCount: 0,
    featured: false,
    submittedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getPendingSubmissions = async (): Promise<ProjectSubmission[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  
  const pending = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as ProjectSubmission))
    .filter(p => p.approvalStatus === 'pending');

  console.log("Pending Projects Loaded:", pending.length);
  return pending;
};

export const getUserProjects = async (uid: string): Promise<Project[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    where('ownerId', '==', uid)
  );
  const snapshot = await getDocs(q);
  
  const userProjects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Project[];

  userProjects.sort((a, b) => {
    const timeA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
    const timeB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
    return timeB - timeA;
  });

  return userProjects;
};

export const generatePreviewForSubmission = async (submissionId: string, liveDemoUrl: string): Promise<void> => {
  console.log("Generating preview for:", liveDemoUrl);
  try {
    const url = `https://api.microlink.io?url=${encodeURIComponent(liveDemoUrl)}&screenshot=true&meta=true`;
    console.log("Microlink URL:", url);
    const res = await fetch(url);
    const data = await res.json();
    let previewUrl = '';
    let source: "cover" | "og" | "microlink" | "placeholder" = 'placeholder';
    
    if (data.data?.image?.url) {
      previewUrl = data.data.image.url;
      source = 'og';
    } else if (data.data?.screenshot?.url) {
      previewUrl = data.data.screenshot.url;
      source = 'microlink';
    }

    console.log("Generated preview:", previewUrl, "Source:", source);

    const docRef = doc(db, 'projects', submissionId);
    if (previewUrl || source !== 'placeholder') {
      console.log("Saving preview to document:", submissionId, "Url:", previewUrl, "Source:", source);
      await updateDoc(docRef, {
        previewImageUrl: previewUrl,
        previewSource: source
      });
    } else {
      console.log("Saving placeholder to document:", submissionId);
      await updateDoc(docRef, {
        previewSource: 'placeholder'
      });
    }
  } catch (error) {
    console.error("Preview generation failed:", error);
    try {
      const docRef = doc(db, 'projects', submissionId);
      await updateDoc(docRef, {
        previewSource: 'placeholder'
      });
    } catch (e) {
      console.error('Fallback preview generation failed:', e);
    }
  }
};

// ==========================================
// PROJECTS & APPROVAL WORKFLOW
// ==========================================

export const getApprovedProjects = async (): Promise<Project[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    orderBy('publishedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  
  console.log("Total Projects Loaded (with publishedAt):", snapshot.docs.length);

  const approved = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Project))
    .filter(p => p.approvalStatus !== 'pending' && p.approvalStatus !== 'rejected');
  
  console.log("Approved Projects Loaded:", approved.length);
  return approved;
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const docRef = doc(db, 'projects', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
};

export const getFeaturedProjects = async (): Promise<Project[]> => {
  const settings = await getSettings();
  const limitCount = settings?.featuredProjectsLimit || 5;

  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    where('featured', '==', true)
  );
  
  const snapshot = await getDocs(q);
  const projects = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Project))
    .filter(p => p.approvalStatus !== 'pending' && p.approvalStatus !== 'rejected');

  projects.sort((a, b) => {
    const timeA = a.publishedAt?.toMillis ? a.publishedAt.toMillis() : 0;
    const timeB = b.publishedAt?.toMillis ? b.publishedAt.toMillis() : 0;
    return timeB - timeA;
  });

  const featured = projects.slice(0, limitCount);
  console.log("Featured Projects Loaded:", featured.length);
  return featured;
};

export const getLeaderboard = async (): Promise<Project[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    orderBy('likesCount', 'desc')
  );
  const snapshot = await getDocs(q);
  
  const leaderboard = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Project))
    .filter(p => p.approvalStatus !== 'pending' && p.approvalStatus !== 'rejected')
    .slice(0, 10);

  console.log("Leaderboard Projects Loaded:", leaderboard.length);
  return leaderboard;
};

export const approveProject = async (id: string): Promise<void> => {
  const projectRef = doc(db, 'projects', id);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) throw new Error("Project does not exist!");
  const projectData = projectSnap.data() as Project;

  const wasAlreadyApproved = projectData.approvalStatus === 'approved';

  await runTransaction(db, async (transaction) => {
    transaction.update(projectRef, {
      approvalStatus: 'approved',
      publishedAt: serverTimestamp(),
      editedAfterApproval: false
    });

    // If it wasn't approved before, increment the owner's totalProjects
    if (!wasAlreadyApproved && projectData.ownerId) {
      const userRef = doc(db, 'users', projectData.ownerId);
      transaction.update(userRef, {
        totalProjects: increment(1)
      });
    }
  });
};

export const rejectProject = async (id: string): Promise<void> => {
  const projectRef = doc(db, 'projects', id);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) throw new Error("Project does not exist!");
  const projectData = projectSnap.data() as Project;

  const wasApproved = projectData.approvalStatus === 'approved';

  await runTransaction(db, async (transaction) => {
    transaction.update(projectRef, {
      approvalStatus: 'rejected',
      featured: false
    });

    // If it was approved, decrement the creator's totalProjects, views and likes
    if (wasApproved && projectData.ownerId) {
      const userRef = doc(db, 'users', projectData.ownerId);
      transaction.update(userRef, {
        totalProjects: increment(-1),
        totalViews: increment(-(projectData.viewsCount || 0)),
        totalLikes: increment(-(projectData.likesCount || 0))
      });
    }
  });
};

export const toggleFeatured = async (id: string, currentState: boolean): Promise<void> => {
  const docRef = doc(db, 'projects', id);
  await updateDoc(docRef, { featured: !currentState });
};

export const deleteProject = async (id: string): Promise<void> => {
  const projectRef = doc(db, 'projects', id);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) return;
  const projectData = projectSnap.data() as Project;

  const wasApproved = projectData.approvalStatus === 'approved';

  await runTransaction(db, async (transaction) => {
    transaction.delete(projectRef);

    if (projectData.ownerId) {
      const userRef = doc(db, 'users', projectData.ownerId);
      if (wasApproved) {
        transaction.update(userRef, {
          totalProjects: increment(-1),
          totalViews: increment(-(projectData.viewsCount || 0)),
          totalLikes: increment(-(projectData.likesCount || 0))
        });
      }
    }
  });
};

export const duplicateProject = async (id: string): Promise<string> => {
  const projectRef = doc(db, 'projects', id);
  const snap = await getDoc(projectRef);
  if (!snap.exists()) throw new Error('Project not found');
  const data = snap.data();
  
  const newDocRef = await addDoc(collection(db, 'projects'), {
    ...data,
    title: `${data.title} (Copy)`,
    approvalStatus: 'pending',
    likesCount: 0,
    viewsCount: 0,
    featured: false,
    editedAfterApproval: false,
    submittedAt: serverTimestamp(),
    publishedAt: null
  });
  return newDocRef.id;
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
  const projectRef = doc(db, 'projects', id);
  const snap = await getDoc(projectRef);
  if (!snap.exists()) throw new Error('Project not found');
  const currentData = snap.data() as Project;
  
  const isApproved = currentData.approvalStatus === 'approved';
  
  const finalUpdates: any = {
    ...updates,
    lastEditedAt: serverTimestamp()
  };

  if (isApproved) {
    // Approved project transitions back to pending on edit
    finalUpdates.approvalStatus = 'pending';
    finalUpdates.editedAfterApproval = true;
    
    // Decrement the user's total projects since it is no longer public/approved
    if (currentData.ownerId) {
      const userRef = doc(db, 'users', currentData.ownerId);
      await runTransaction(db, async (transaction) => {
        transaction.update(projectRef, finalUpdates);
        transaction.update(userRef, {
          totalProjects: increment(-1)
        });
      });
      return;
    }
  }

  await updateDoc(projectRef, finalUpdates);
};

export const updatePendingSubmission = async (id: string, updates: Partial<ProjectSubmission>): Promise<void> => {
  await updateProject(id, updates as any);
};

// ==========================================
// LIKES & VIEWS
// ==========================================

export const toggleLike = async (projectId: string, visitorId: string): Promise<boolean> => {
  const likeDocId = `${projectId}_${visitorId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const projectRef = doc(db, 'projects', projectId);
  
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) return false;
  const projectData = projectSnap.data() as Project;

  let newStatus = false;

  await runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef);
    const userRef = projectData.ownerId ? doc(db, 'users', projectData.ownerId) : null;

    if (likeSnap.exists()) {
      // Remove like
      transaction.delete(likeRef);
      transaction.update(projectRef, {
        likesCount: increment(-1)
      });
      if (userRef && projectData.approvalStatus === 'approved') {
        transaction.update(userRef, {
          totalLikes: increment(-1)
        });
      }
      newStatus = false;
    } else {
      // Add like
      transaction.set(likeRef, {
        projectId,
        visitorId,
        createdAt: serverTimestamp()
      });
      transaction.update(projectRef, {
        likesCount: increment(1)
      });
      if (userRef && projectData.approvalStatus === 'approved') {
        transaction.update(userRef, {
          totalLikes: increment(1)
        });
      }
      newStatus = true;
    }
  });

  return newStatus;
};

export const checkHasLiked = async (projectId: string, visitorId: string): Promise<boolean> => {
  const likeDocId = `${projectId}_${visitorId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
};

export const recordView = async (projectId: string, _visitorId: string): Promise<void> => {
  const viewKey = `viewed_${projectId}`;
  const lastViewed = localStorage.getItem(viewKey);
  const now = Date.now();
  
  if (lastViewed && (now - parseInt(lastViewed, 10) < 60 * 60 * 1000)) {
    return; // Ignore
  }
  
  localStorage.setItem(viewKey, now.toString());
  
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) return;
  const projectData = projectSnap.data() as Project;

  await runTransaction(db, async (transaction) => {
    transaction.update(projectRef, {
      viewsCount: increment(1)
    });
    if (projectData.ownerId && projectData.approvalStatus === 'approved') {
      const userRef = doc(db, 'users', projectData.ownerId);
      transaction.update(userRef, {
        totalViews: increment(1)
      });
    }
  });
};
