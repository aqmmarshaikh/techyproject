import * as admin from 'firebase-admin';

export interface CastVoteParams {
  projectId: string;
  callerUid: string;
  choice: 'GOOD' | 'NEEDS_IMPROVEMENT';
}

export async function processVoteTransaction(
  db: admin.firestore.Firestore,
  params: CastVoteParams
): Promise<{
  goodVoteCount: number;
  needsImprovementVoteCount: number;
  totalValidVotes: number;
  goodPercentage: number;
  choice: 'GOOD' | 'NEEDS_IMPROVEMENT';
}> {
  const { projectId, callerUid, choice } = params;
  const projectRef = db.collection('projects').doc(projectId);
  const voteDocId = `${projectId}_${callerUid}`;
  const voteRef = db.collection('votes').doc(voteDocId);
  const arenaStatRef = db.collection('arenaStats').doc(projectId);

  return await db.runTransaction(async (tx) => {
    // 1. Read Project
    const projectSnap = await tx.get(projectRef);
    if (!projectSnap.exists) {
      throw new Error('Project not found');
    }
    const project = projectSnap.data();
    if (!project) throw new Error('Invalid project document');

    if (project.approvalStatus !== 'APPROVED') {
      throw new Error('Only approved projects can receive peer community votes.');
    }

    if (project.creatorId === callerUid) {
      throw new Error('Company policy prohibits creators from voting on their own submissions.');
    }

    // 2. Read existing vote
    const voteSnap = await tx.get(voteRef);
    let goodCount = Number(project.goodVoteCount || 0);
    let needsImpCount = Number(project.needsImprovementVoteCount || 0);

    const nowIso = new Date().toISOString();

    if (!voteSnap.exists) {
      // First-time vote
      if (choice === 'GOOD') {
        goodCount += 1;
      } else {
        needsImpCount += 1;
      }

      tx.set(voteRef, {
        id: voteDocId,
        projectId,
        userId: callerUid,
        choice,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    } else {
      const existingVote = voteSnap.data();
      if (existingVote?.choice === choice) {
        // Idempotent: already voted same choice
        const total = goodCount + needsImpCount;
        const pct = total === 0 ? 0 : Math.round(((goodCount / total) * 100) * 10) / 10;
        return {
          goodVoteCount: goodCount,
          needsImprovementVoteCount: needsImpCount,
          totalValidVotes: total,
          goodPercentage: pct,
          choice,
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
        updatedAt: nowIso,
      });
    }

    const totalValidVotes = goodCount + needsImpCount;
    const rawGoodPct = totalValidVotes === 0 ? 0 : (goodCount / totalValidVotes) * 100;
    const goodPercentage = Math.round(rawGoodPct * 10) / 10;

    // Time decay formula for Arena
    const approvedAtMs = new Date(project.approvedAt || project.createdAt).getTime() || Date.now();
    const ageInDays = Math.max(0, Date.now() - approvedAtMs) / (1000 * 60 * 60 * 24);
    const likeCount = Number(project.likeCount || 0);
    const engagement = (likeCount * 2) + (totalValidVotes * 3) + (goodCount * 1.5);
    const trendingScore = Math.round((engagement / Math.pow(ageInDays + 2, 1.5)) * 100) / 100;

    // Atomic update to project
    tx.update(projectRef, {
      goodVoteCount: goodCount,
      needsImprovementVoteCount: needsImpCount,
      totalValidVotes,
      goodPercentage,
      trendingScore,
      updatedAt: nowIso,
    });

    // Update arenaStats aggregate
    tx.set(
      arenaStatRef,
      {
        projectId,
        goodPercentage,
        totalValidVotes,
        likeCount,
        trendingScore,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    return {
      goodVoteCount: goodCount,
      needsImprovementVoteCount: needsImpCount,
      totalValidVotes,
      goodPercentage,
      choice,
    };
  });
}

