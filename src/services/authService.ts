import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../app/firebase';
import { userRepository } from '../repositories/userRepository';
import { adminRepository } from '../repositories/adminRepository';
import { UserProfile, UserRole } from '../types';
import { resolveUserRoleByEmail } from '../utils/roleResolver';

export const authService = {
  async login(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    let profile = await userRepository.getById(cred.user.uid);
    const expectedRole = resolveUserRoleByEmail(cred.user.email || email);

    if (!profile) {
      profile = {
        id: cred.user.uid,
        email: cred.user.email || email,
        fullName: cred.user.displayName || email.split('@')[0],
        avatarUrl: cred.user.photoURL || undefined,
        designation: expectedRole === 'SUPER_ADMIN' ? 'Platform Director' : 'Employee',
        department: expectedRole === 'SUPER_ADMIN' ? 'Executive' : 'Engineering',
        skills: ['TypeScript', 'React'],
        technologies: ['Vite', 'Firebase', 'Cloud Services'],
        role: expectedRole,
        accountStatus: 'ACTIVE',
        joinDate: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        totalSubmittedProjects: 0,
        totalApprovedProjects: 0,
        totalLikesReceived: 0,
        totalVotesReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await userRepository.createProfile(profile);
      return profile;
    }

    if (profile.accountStatus === 'SUSPENDED') {
      await firebaseSignOut(auth);
      throw new Error('Your account is suspended. Please contact the platform administrator.');
    }

    // Ensure role strictly adheres to email policy
    const updates: Partial<UserProfile> = {
      lastLoginAt: new Date().toISOString(),
    };
    if (profile.role !== expectedRole) {
      updates.role = expectedRole;
    }
    await userRepository.updateProfile(profile.id, updates);
    return { ...profile, ...updates };
  },

  /**
   * Google Sign-In with automatic role assignment:
   * ammarshaikh6100@gmail.com -> SUPER_ADMIN
   * All other users -> EMPLOYEE
   */
  async loginWithGoogle(): Promise<UserProfile> {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    let profile = await userRepository.getById(user.uid);
    const expectedRole = resolveUserRoleByEmail(user.email);

    if (profile) {
      if (profile.accountStatus === 'SUSPENDED') {
        await firebaseSignOut(auth);
        throw new Error('Your account is suspended. Please contact the platform administrator.');
      }

      const updates: Partial<UserProfile> = {
        lastLoginAt: new Date().toISOString(),
      };
      if (profile.role !== expectedRole) {
        updates.role = expectedRole;
      }
      if (!profile.avatarUrl && user.photoURL) {
        updates.avatarUrl = user.photoURL;
      }
      await userRepository.updateProfile(profile.id, updates);
      return { ...profile, ...updates };
    }

    // New Google employee user - check domain policy if set
    try {
      const settings = await adminRepository.getSettings();
      if (
        settings.registrationPolicy === 'RESTRICTED_DOMAIN' &&
        settings.companyDomain &&
        user.email
      ) {
        if (!user.email.toLowerCase().endsWith(`@${settings.companyDomain.toLowerCase()}`)) {
          await firebaseSignOut(auth);
          throw new Error(
            `Access restricted to company email addresses ending in @${settings.companyDomain}`
          );
        }
      }
    } catch (err: unknown) {
      // If error is domain restriction, rethrow it
      if (err instanceof Error && err.message.includes('Access restricted')) {
        throw err;
      }
    }

    const newProfile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      fullName: user.displayName || user.email?.split('@')[0] || 'Employee',
      avatarUrl: user.photoURL || undefined,
      designation: expectedRole === 'SUPER_ADMIN' ? 'Platform Director' : 'Employee',
      department: expectedRole === 'SUPER_ADMIN' ? 'Executive' : 'Engineering',
      skills: ['TypeScript', 'React'],
      technologies: ['Vite', 'Firebase', 'Cloud Services'],
      role: expectedRole,
      accountStatus: 'ACTIVE',
      joinDate: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      totalSubmittedProjects: 0,
      totalApprovedProjects: 0,
      totalLikesReceived: 0,
      totalVotesReceived: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRepository.createProfile(newProfile);
    return newProfile;
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
