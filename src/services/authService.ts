import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../app/firebase';
import { userRepository } from '../repositories/userRepository';
import { UserProfile } from '../types';

export const authService = {
  async login(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await userRepository.getById(cred.user.uid);
    if (!profile) {
      throw new Error('User profile record does not exist. Please contact your company administrator.');
    }
    if (profile.accountStatus === 'SUSPENDED') {
      await firebaseSignOut(auth);
      throw new Error('Your account is suspended. Please contact the platform administrator.');
    }
    // Update last login
    await userRepository.updateProfile(profile.id, {
      lastLoginAt: new Date().toISOString(),
    });
    return profile;
  },

  async logout(): Promise<void> {
    await firebaseSignOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    return await userRepository.getById(uid);
  },
};

