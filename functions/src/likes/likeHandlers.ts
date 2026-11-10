import * as admin from 'firebase-admin';

export async function processLikeToggle(
  db: admin.firestore.Firestore,
  projectId: string,
  callerUid: string
): Promise<{ isLiked: boolean; newCount: number }> {
  const projectRef = db.collection('projects').doc(projectId);
  const likeDocId = `${projectId}_${callerUid}`;
  const likeRef = db.collection('likes').doc(likeDocId);

  return await db.runTransaction(async (tx) => {
    const projectSnap = await tx.get(projectRef);
    if (!projectSnap.exists) {
      throw new Error('Project not found');
    }
    const project = projectSnap.data();
    if (!project) throw new Error('Invalid project document');

    if (project.creatorId === callerUid) {
      throw new Error('Creators cannot like their own projects');
    }

    const likeSnap = await tx.get(likeRef);
    let likeCount = Number(project.likeCount || 0);
    const nowIso = new Date().toISOString();

    if (likeSnap.exists) {
      // Unlike
      tx.delete(likeRef);
      likeCount = Math.max(0, likeCount - 1);
      tx.update(projectRef, {
        likeCount,
        updatedAt: nowIso,
      });
      return { isLiked: false, newCount: likeCount };
    } else {
      // Like
      tx.set(likeRef, {
        id: likeDocId,
        projectId,
        userId: callerUid,
        createdAt: nowIso,
      });
      likeCount = likeCount + 1;
      tx.update(projectRef, {
        likeCount,
        updatedAt: nowIso,
      });
      return { isLiked: true, newCount: likeCount };
    }
  });
}

