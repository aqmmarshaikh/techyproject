import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  orderBy,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { VoteChoice, VoteRecord, LikeRecord, BookmarkRecord, Project } from '../types';
import { calculateVotePercentages } from '../utils/formatters';

const LIKES_COLLECTION = 'likes';
const VOTES_COLLECTION = 'votes';
const BOOKMARKS_COLLECTION = 'bookmarks';
const PROJECTS_COLLECTION = 'projects';

export const interactionRepository = {
  // ---------------------------------------------------------------------------
  // Likes
  // ---------------------------------------------------------------------------
  async getLike(projectId: string, userId: string): Promise<boolean> {
    const likeDocId = `${projectId}_${userId}`;
    const snap = await getDoc(doc(db, LIKES_COLLECTION, likeDocId));
    return snap.exists();
  },

  async toggleLike(projectId: string, userId: string): Promise<{ isLiked: boolean; newCount: number }> {
    const likeDocId = `${projectId}_${userId}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeDocId);
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

    return await runTransaction(db, async (tx) => {
      const projectSnap = await tx.get(projectRef);
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      const projectData = projectSnap.data() as Project;
      if (projectData.creatorId === userId) {
        throw new Error('Creators cannot like their own projects');
      }

      const likeSnap = await tx.get(likeRef);
      const isCurrentlyLiked = likeSnap.exists();
      let newCount = projectData.likeCount || 0;

      if (isCurrentlyLiked) {
        // Unlike
        tx.delete(likeRef);
        newCount = Math.max(0, newCount - 1);
        tx.update(projectRef, { 
          likeCount: newCount,
          updatedAt: new Date().toISOString(),
        });
        return { isLiked: false, newCount };
      } else {
        // Like
        const newLike: LikeRecord = {
          id: likeDocId,
          projectId,
          userId,
          createdAt: new Date().toISOString(),
        };
        tx.set(likeRef, newLike);
        newCount = newCount + 1;
        tx.update(projectRef, { 
          likeCount: newCount,
          updatedAt: new Date().toISOString(),
        });
        return { isLiked: true, newCount };
      }
    });
  },

  // ---------------------------------------------------------------------------
  // Votes
  // ---------------------------------------------------------------------------
  async getVote(projectId: string, userId: string): Promise<VoteRecord | null> {
    const voteDocId = `${projectId}_${userId}`;
    const snap = await getDoc(doc(db, VOTES_COLLECTION, voteDocId));
    if (!snap.exists()) return null;
    return snap.data() as VoteRecord;
  },

  async castVote(
    projectId: string, 
    userId: string, 
    choice: VoteChoice
  ): Promise<{ 
    goodVoteCount: number; 
    needsImprovementVoteCount: number; 
    totalValidVotes: number; 
    goodPercentage: number;
    activeChoice: VoteChoice;
  }> {
    const voteDocId = `${projectId}_${userId}`;
    const voteRef = doc(db, VOTES_COLLECTION, voteDocId);
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

    return await runTransaction(db, async (tx) => {
      const projectSnap = await tx.get(projectRef);
      if (!projectSnap.exists()) {
        throw new Error('Project does not exist');
      }
      const projectData = projectSnap.data() as Project;

      if (projectData.approvalStatus !== 'APPROVED') {
        throw new Error('Only approved projects can receive votes');
      }

      if (projectData.creatorId === userId) {
        throw new Error('Project creators are not permitted to vote on their own projects');
      }

      const voteSnap = await tx.get(voteRef);
      let goodCount = projectData.goodVoteCount || 0;
      let needsImpCount = projectData.needsImprovementVoteCount || 0;

      if (!voteSnap.exists()) {
        // First-time vote
        if (choice === 'GOOD') {
          goodCount += 1;
        } else {
          needsImpCount += 1;
        }

        const newVote: VoteRecord = {
          id: voteDocId,
          projectId,
          userId,
          choice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tx.set(voteRef, newVote);
      } else {
        const existingVote = voteSnap.data() as VoteRecord;
        if (existingVote.choice === choice) {
          // Idempotent: same choice selected, no counter changes
          const { goodPercentage, totalVotes } = calculateVotePercentages(goodCount, needsImpCount);
          return {
            goodVoteCount: goodCount,
            needsImprovementVoteCount: needsImpCount,
            totalValidVotes: totalVotes,
            goodPercentage,
            activeChoice: choice,
          };
        }

        // Switching vote choice
        if (choice === 'GOOD') {
          goodCount += 1;
          needsImpCount = Math.max(0, needsImpCount - 1);
        } else {
          needsImpCount += 1;
          goodCount = Math.max(0, goodCount - 1);
        }

        tx.update(voteRef, {
          choice,
          updatedAt: new Date().toISOString(),
        });
      }

      const { goodPercentage, totalVotes } = calculateVotePercentages(goodCount, needsImpCount);

      tx.update(projectRef, {
        goodVoteCount: goodCount,
        needsImprovementVoteCount: needsImpCount,
        totalValidVotes: totalVotes,
        goodPercentage,
        updatedAt: new Date().toISOString(),
      });

      return {
        goodVoteCount: goodCount,
        needsImprovementVoteCount: needsImpCount,
        totalValidVotes: totalVotes,
        goodPercentage,
        activeChoice: choice,
      };
    });
  },

  // ---------------------------------------------------------------------------
  // Bookmarks
  // ---------------------------------------------------------------------------
  async getBookmark(projectId: string, userId: string): Promise<boolean> {
    const bookmarkDocId = `${userId}_${projectId}`;
    const snap = await getDoc(doc(db, BOOKMARKS_COLLECTION, bookmarkDocId));
    return snap.exists();
  },

  async toggleBookmark(
    project: Project, 
    userId: string
  ): Promise<{ isBookmarked: boolean }> {
    const bookmarkDocId = `${userId}_${project.id}`;
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, bookmarkDocId);
    const snap = await getDoc(bookmarkRef);

    if (snap.exists()) {
      await deleteDoc(bookmarkRef);
      return { isBookmarked: false };
    } else {
      const record: BookmarkRecord = {
        id: bookmarkDocId,
        userId,
        projectId: project.id,
        projectTitle: project.title,
        projectCoverUrl: project.coverImageUrl,
        projectCategory: project.category,
        createdAt: new Date().toISOString(),
      };
      await setDoc(bookmarkRef, record);
      return { isBookmarked: true };
    }
  },

  async listUserBookmarks(userId: string): Promise<BookmarkRecord[]> {
    const colRef = collection(db, BOOKMARKS_COLLECTION);
    const q = query(
      colRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as BookmarkRecord);
  },
};
