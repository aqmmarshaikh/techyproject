export type NotificationType = 
  | 'APPROVAL' 
  | 'REJECTION' 
  | 'CHANGES_REQUESTED' 
  | 'REVISION_STATUS'
  | 'PROJECT_LIKED'
  | 'PROJECT_DELETED'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  projectId?: string;
  projectTitle?: string;
}

