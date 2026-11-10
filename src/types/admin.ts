export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string; // e.g. "PROJECT_APPROVED", "USER_SUSPENDED", "ROLE_UPDATED"
  targetEntity: string; // e.g. "projects", "users", "systemSettings"
  targetId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface SystemSettings {
  companyDomain: string; // e.g. "company.com" or empty
  registrationPolicy: 'INVITE_ONLY' | 'RESTRICTED_DOMAIN' | 'OPEN_REGISTRATION';
  arenaMinVoteThreshold: number; // default: 10
  maxCoverImageSizeBytes: number; // default: 5MB (5242880)
  maxScreenshotsPerProject: number; // default: 6
  allowedMimeTypes: string[];
  trendingWindowDays: number; // default: 7
  featuredProjectIds: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface AdminAnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalApprovedProjects: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  totalLikes: number;
  totalVotes: number;
}

