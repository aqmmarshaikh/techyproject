export type ReportReason = 
  | 'SPAM' 
  | 'MISLEADING' 
  | 'INAPPROPRIATE' 
  | 'BROKEN_LINK' 
  | 'IP_CONCERN' 
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';

export interface ProjectReport {
  id: string;
  projectId: string;
  projectTitle: string;
  reporterId: string;
  reporterEmail: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

