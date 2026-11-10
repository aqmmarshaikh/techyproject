import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { AppNotification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationRepository = {
  async listUserNotifications(userId: string): Promise<AppNotification[]> {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      colRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppNotification);
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
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  },
};

