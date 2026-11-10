export type ProjectStatus = 'IN_DEVELOPMENT' | 'LIVE' | 'COMPLETED' | 'ON_HOLD';

export type ApprovalStatus = 
  | 'DRAFT' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CHANGES_REQUESTED';

export interface Project {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  screenshots: string[];
  category: string; // Category ID or slug
  technologies: string[];
  projectStatus: ProjectStatus;
  approvalStatus: ApprovalStatus;
  isArchived: boolean;
  isFeatured: boolean;
  liveWebsiteUrl?: string;
  githubRepoUrl?: string;
  
  // Creator snapshot
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorDepartment: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;

  // Review metadata
  rejectionReason?: string;
  adminFeedback?: string;
  reviewedBy?: string;
  activeRevisionId?: string;

  // Server-authoritative aggregate counters
  likeCount: number;
  goodVoteCount: number;
  needsImprovementVoteCount: number;
  totalValidVotes: number;
  goodPercentage: number; // 0 - 100
  trendingScore: number;
}

export interface ProjectSubmissionInput {
  title: string;
  description: string;
  coverImageUrl: string;
  screenshots?: string[];
  category: string;
  technologies: string[];
  projectStatus: ProjectStatus;
  liveWebsiteUrl?: string;
  githubRepoUrl?: string;
}

