import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface RolePreviewContextType {
  previewRole: UserRole | null;
  effectiveRole: UserRole;
  isRealSuperAdmin: boolean;
  isPreviewActive: boolean;
  switchPreviewRole: (targetRole: UserRole) => void;
  exitPreview: () => void;
}

const RolePreviewContext = createContext<RolePreviewContextType | undefined>(undefined);

const PREVIEW_STORAGE_KEY = 'project_hub_role_preview';

export const RolePreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRealSuperAdmin = Boolean(userProfile && userProfile.role === 'SUPER_ADMIN');

  const [previewRole, setPreviewRole] = useState<UserRole | null>(() => {
    try {
      const stored = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
      if (stored === 'ADMIN' || stored === 'EMPLOYEE' || stored === 'SUPER_ADMIN') {
        return stored as UserRole;
      }
    } catch {
      // sessionStorage unavailable
    }
    return null;
  });

  // Strict security: If authenticated user is NOT a real Super Admin, wipe any preview role immediately
  useEffect(() => {
    if (userProfile && userProfile.role !== 'SUPER_ADMIN') {
      try {
        sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
      } catch {}
      setPreviewRole(null);
    }
  }, [userProfile]);

  // Synchronize previewRole with route when user explicitly navigates between sections
  useEffect(() => {
    if (!isRealSuperAdmin) return;

    if (location.pathname.startsWith('/super-admin')) {
      if (previewRole !== 'SUPER_ADMIN') {
        setPreviewRole('SUPER_ADMIN');
        try {
          sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'SUPER_ADMIN');
        } catch {}
      }
    } else if (location.pathname.startsWith('/admin')) {
      if (previewRole !== 'ADMIN') {
        setPreviewRole('ADMIN');
        try {
          sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'ADMIN');
        } catch {}
      }
    }
  }, [location.pathname, isRealSuperAdmin, previewRole]);

  const effectiveRole: UserRole = isRealSuperAdmin
    ? previewRole || 'SUPER_ADMIN'
    : userProfile?.role || 'EMPLOYEE';

  const isPreviewActive = Boolean(
    isRealSuperAdmin && previewRole && previewRole !== 'SUPER_ADMIN'
  );

  const switchPreviewRole = (targetRole: UserRole) => {
    if (!isRealSuperAdmin) {
      console.warn('Unauthorized role preview switch attempted.');
      return;
    }

    setPreviewRole(targetRole);
    try {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, targetRole);
    } catch {}

    if (targetRole === 'SUPER_ADMIN') {
      navigate('/super-admin');
    } else if (targetRole === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const exitPreview = () => {
    if (!isRealSuperAdmin) return;
    setPreviewRole('SUPER_ADMIN');
    try {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'SUPER_ADMIN');
    } catch {}
    navigate('/super-admin');
  };

  return (
    <RolePreviewContext.Provider
      value={{
        previewRole,
        effectiveRole,
        isRealSuperAdmin,
        isPreviewActive,
        switchPreviewRole,
        exitPreview,
      }}
    >
      {children}
    </RolePreviewContext.Provider>
  );
};

export const useRolePreview = () => {
  const context = useContext(RolePreviewContext);
  if (!context) {
    throw new Error('useRolePreview must be used within a RolePreviewProvider');
  }
  return context;
};

