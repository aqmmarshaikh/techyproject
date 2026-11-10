import * as admin from 'firebase-admin';

export interface SubmitProjectInput {
  title: string;
  description: string;
  coverImageUrl: string;
  screenshots?: string[];
  category: string;
  technologies: string[];
  projectStatus: 'IN_DEVELOPMENT' | 'LIVE' | 'COMPLETED' | 'ON_HOLD';
  liveWebsiteUrl?: string;
  githubRepoUrl?: string;
}

export async function submitProjectServer(
  db: admin.firestore.Firestore,
  input: SubmitProjectInput,
  caller: { uid: string; email: string; name?: string; department?: string }
): Promise<{ id: string }> {
  // Validate basic criteria
  if (!input.title || input.title.trim().length < 3) {
    throw new Error('Title must be at least 3 characters');
  }
  if (!input.description || input.description.trim().length < 25) {
    throw new Error('Description must contain at least 2 lines (at least 25 characters)');
  }
  if (input.projectStatus === 'LIVE' && !input.liveWebsiteUrl) {
    throw new Error('Live website URL is mandatory when project status is LIVE');
  }

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newProject = {
    id: projectId,
    title: input.title.trim(),
    description: input.description.trim(),
    coverImageUrl: input.coverImageUrl,
    screenshots: input.screenshots || [],
    category: input.category,
    technologies: input.technologies,
    projectStatus: input.projectStatus,
    approvalStatus: 'PENDING_REVIEW',
    isArchived: false,
    isFeatured: false,
    liveWebsiteUrl: input.liveWebsiteUrl || null,
    githubRepoUrl: input.githubRepoUrl || null,
    creatorId: caller.uid,
    creatorName: caller.name || caller.email,
    creatorDepartment: caller.department || 'Engineering',
    createdAt: now,
    updatedAt: now,
    likeCount: 0,
    goodVoteCount: 0,
    needsImprovementVoteCount: 0,
    totalValidVotes: 0,
    goodPercentage: 0,
    trendingScore: 0,
  };

  await db.collection('projects').doc(projectId).set(newProject);
  return { id: projectId };
}

