import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { UserProfile, UserRole } from '../types';
import { resolveUserRoleByEmail } from '../utils/roleResolver';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Auth Modal State
  isAuthModalOpen: boolean;
  authModalPrompt: string | undefined;
  openAuthModal: (prompt?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Check local storage for session persistence while discarding any stale dummy profiles
    const saved = localStorage.getItem('project_hub_active_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.id?.startsWith('usr_') || 
          parsed.email?.toLowerCase().includes('@company.com') ||
          parsed.email === 'superadmin@company.com' ||
          parsed.email === 'admin@company.com' ||
          parsed.email === 'employee@company.com'
        ) {
          localStorage.removeItem('project_hub_active_profile');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | undefined>(undefined);

  const openAuthModal = (prompt?: string) => {
    setAuthModalPrompt(prompt);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalPrompt(undefined);
  };

  // Synchronize active profile with localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('project_hub_active_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('project_hub_active_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const expectedRole = resolveUserRoleByEmail(user.email);
          let profile = await userRepository.getById(user.uid);

          if (profile) {
            if (profile.accountStatus === 'SUSPENDED') {
              await authService.logout();
              setUserProfile(null);
              setError('Your account is currently suspended.');
            } else {
              // Ensure role strictly adheres to role hierarchy and email policy:
              // 1. SUPER_ADMIN takes absolute precedence if listed in superAdminEmails
              // 2. ADMIN takes precedence if listed in adminEmails or already assigned in Firestore
              // 3. Otherwise defaults to EMPLOYEE
              let targetRole = profile.role || 'EMPLOYEE';
              if (expectedRole === 'SUPER_ADMIN') {
                targetRole = 'SUPER_ADMIN';
              } else if (expectedRole === 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
                targetRole = 'ADMIN';
              }

              if (profile.role !== targetRole) {
                await userRepository.updateProfile(profile.id, { role: targetRole });
                profile.role = targetRole;
              }
              setUserProfile(profile);
            }
          } else {
            // First-time profile initialization with strictly resolved role
            profile = {
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
            await userRepository.createProfile(profile);
            setUserProfile(profile);
          }
        } catch (err) {
          console.warn('[useAuth] Failed to load Firestore profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await authService.login(email, pass);
      setUserProfile(profile);
      closeAuthModal();
      return profile;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await authService.loginWithGoogle();
      setUserProfile(profile);
      closeAuthModal();
      return profile;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUserProfile(null);
      setFirebaseUser(null);
    } catch (err: unknown) {
      console.warn('[useAuth] Logout error:', err);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (userProfile?.id) {
      const fresh = await userRepository.getById(userProfile.id);
      if (fresh) {
        setUserProfile(fresh);
      }
    }
  };

  const isAuthenticated = Boolean(userProfile && userProfile.accountStatus !== 'SUSPENDED');
  const isAdmin = Boolean(userProfile && (userProfile.role === 'ADMIN' || userProfile.role === 'SUPER_ADMIN'));
  const isSuperAdmin = Boolean(userProfile && userProfile.role === 'SUPER_ADMIN');

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        isLoading,
        error,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
        isAuthModalOpen,
        authModalPrompt,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

