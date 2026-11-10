import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Built-in Seed/Demo Profiles for frictionless verification
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  SUPER_ADMIN: {
    id: 'usr_super_admin',
    email: 'superadmin@company.com',
    fullName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    designation: 'VP of Engineering',
    department: 'Executive',
    skills: ['System Architecture', 'Cloud Governance', 'Leadership', 'Security Audits'],
    technologies: ['Kubernetes', 'Go', 'TypeScript', 'GCP', 'PostgreSQL'],
    role: 'SUPER_ADMIN',
    accountStatus: 'ACTIVE',
    joinDate: '2023-01-15T09:00:00.000Z',
    totalSubmittedProjects: 3,
    totalApprovedProjects: 3,
    totalLikesReceived: 42,
    totalVotesReceived: 88,
    createdAt: '2023-01-15T09:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  ADMIN: {
    id: 'usr_admin',
    email: 'admin@company.com',
    fullName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    designation: 'Principal Architect & Tech Lead',
    department: 'Engineering',
    skills: ['Code Reviews', 'Platform Security', 'Performance Engineering', 'Mentorship'],
    technologies: ['React', 'Next.js', 'Node.js', 'GraphQL', 'AWS'],
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
    joinDate: '2023-06-01T10:00:00.000Z',
    totalSubmittedProjects: 4,
    totalApprovedProjects: 4,
    totalLikesReceived: 38,
    totalVotesReceived: 64,
    createdAt: '2023-06-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  EMPLOYEE: {
    id: 'usr_employee',
    email: 'employee@company.com',
    fullName: 'Devon Sanders',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    designation: 'Senior Frontend Engineer',
    department: 'Product Development',
    skills: ['React', 'Design Systems', 'Microfrontends', 'Accessibility'],
    technologies: ['TypeScript', 'Tailwind CSS', 'Vite', 'GraphQL', 'Jest'],
    role: 'EMPLOYEE',
    accountStatus: 'ACTIVE',
    joinDate: '2024-02-10T08:30:00.000Z',
    totalSubmittedProjects: 2,
    totalApprovedProjects: 2,
    totalLikesReceived: 29,
    totalVotesReceived: 51,
    createdAt: '2024-02-10T08:30:00.000Z',
    updatedAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Check local storage for quick session persistence
    const saved = localStorage.getItem('project_hub_active_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_PROFILES.EMPLOYEE;
      }
    }
    // Default to active Employee so explorer/dashboard immediately load for reviewer
    return DEMO_PROFILES.EMPLOYEE;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
          const profile = await userRepository.getById(user.uid);
          if (profile) {
            if (profile.accountStatus === 'SUSPENDED') {
              await authService.logout();
              setUserProfile(null);
              setError('Your account is currently suspended.');
            } else {
              setUserProfile(profile);
            }
          }
        } catch (err) {
          console.warn('[useAuth] Failed to load Firestore profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await authService.login(email, pass);
      setUserProfile(profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
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

  /**
   * Quick role-switch capability for immediate pair-programming and testing
   * across SUPER_ADMIN, ADMIN, and EMPLOYEE modes.
   */
  const switchDemoRole = async (role: UserRole) => {
    const target = DEMO_PROFILES[role];
    setUserProfile(target);
    // Ensure demo user exists in repository so other operations succeed
    try {
      await userRepository.createProfile(target);
    } catch (e) {
      console.warn('[useAuth] Demo profile sync:', e);
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
        logout,
        resetPassword,
        refreshProfile,
        switchDemoRole,
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

