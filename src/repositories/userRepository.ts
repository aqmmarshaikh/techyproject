import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../app/firebase';
import { UserProfile, AccountStatus, UserRole } from '../types';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';

const USERS_COLLECTION = 'users';

export const userRepository = {
  async getById(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  },

  async createProfile(profile: UserProfile): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, profile.id);
    const payload = cleanFirestoreData({
      ...profile,
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    await setDoc(docRef, payload);
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const payload = cleanFirestoreData({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, payload);
  },

  async listEmployees(params?: {
    department?: string;
    searchQuery?: string;
    role?: UserRole;
    accountStatus?: AccountStatus;
    maxResults?: number;
  }): Promise<UserProfile[]> {
    const colRef = collection(db, USERS_COLLECTION);
    let q = query(colRef, orderBy('fullName', 'asc'), limit(params?.maxResults || 100));

    if (params?.accountStatus) {
      q = query(colRef, where('accountStatus', '==', params.accountStatus), limit(params?.maxResults || 100));
    }

    const snap = await getDocs(q);
    let users = snap.docs.map((d) => d.data() as UserProfile);

    // In-memory filter for department & search query to handle compound text searches
    if (params?.department && params.department !== 'all') {
      users = users.filter((u) => u.department.toLowerCase() === params.department?.toLowerCase());
    }

    if (params?.role) {
      users = users.filter((u) => u.role === params.role);
    }

    if (params?.searchQuery && params.searchQuery.trim().length > 0) {
      const qLower = params.searchQuery.toLowerCase().trim();
      users = users.filter((u) => 
        u.fullName.toLowerCase().includes(qLower) ||
        u.email.toLowerCase().includes(qLower) ||
        u.designation.toLowerCase().includes(qLower) ||
        u.skills.some((s) => s.toLowerCase().includes(qLower)) ||
        u.technologies.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    return users;
  },

  async setAccountStatus(uid: string, status: AccountStatus): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      accountStatus: status,
      updatedAt: new Date().toISOString(),
    });
  },

  async setUserRole(uid: string, role: UserRole): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      role: role,
      updatedAt: new Date().toISOString(),
    });
  },
};

