export type VoteChoice = 'GOOD' | 'NEEDS_IMPROVEMENT';

export interface VoteRecord {
  id: string; // `${projectId}_${userId}`
  projectId: string;
  userId: string;
  choice: VoteChoice;
  createdAt: string;
  updatedAt: string;
}

export interface LikeRecord {
  id: string; // `${projectId}_${userId}`
  projectId: string;
  userId: string;
  createdAt: string;
}

export interface BookmarkRecord {
  id: string; // `${userId}_${projectId}`
  userId: string;
  projectId: string;
  projectTitle: string;
  projectCoverUrl: string;
  projectCategory: string;
  createdAt: string;
}

export type ArenaSection = 
  | 'MOST_LIKED' 
  | 'TOP_RATED' 
  | 'MOST_VOTED' 
  | 'TRENDING' 
  | 'NEWEST';

export interface ProjectFilterCriteria {
  searchQuery?: string;
  category?: string;
  technology?: string;
  projectStatus?: string;
  creatorId?: string;
  department?: string;
  sortBy?: 'newest' | 'likes' | 'votes' | 'rating' | 'trending';
  timePeriod?: 'all' | 'today' | 'week' | 'month' | 'year';
}

