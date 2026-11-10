export type NotificationType = 
  | 'APPROVAL' 
  | 'REJECTION' 
  | 'CHANGES_REQUESTED' 
  | 'REVISION_STATUS'
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
}

