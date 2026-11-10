import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { AppNotification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationRepository = {
  async listUserNotifications(userId: string): Promise<AppNotification[]> {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(colRef, where('recipientId', '==', userId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as AppNotification);
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  },

  subscribeToUserNotifications(
    userId: string,
    onUpdate: (notifications: AppNotification[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(colRef, where('recipientId', '==', userId));

    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AppNotification);
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('[notificationRepository] Subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, {
      isRead: true,
    });
  },

  async create(notification: AppNotification): Promise<void> {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
    await setDoc(docRef, {
      ...notification,
      createdAt: notification.createdAt || new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  },
};
