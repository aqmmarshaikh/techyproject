import { ProjectStatus } from './project';

export type RevisionStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface ProjectRevision {
  id: string;
  projectId: string;
  creatorId: string;
  revisionStatus: RevisionStatus;
  proposedChanges: {
    title?: string;
    description?: string;
    coverImageUrl?: string;
    screenshots?: string[];
    category?: string;
    technologies?: string[];
    projectStatus?: ProjectStatus;
    liveWebsiteUrl?: string;
    githubRepoUrl?: string;
  };
  previousSnapshot: Record<string, unknown>;
  changeSummary: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewFeedback?: string;
}
