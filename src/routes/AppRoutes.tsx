import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Eagerly Loaded Public & Fast Primary Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { LandingPage, SESSION_ENTRY_KEY, INTENDED_DESTINATION_KEY } from '../pages/LandingPage';
import { ExplorePage } from '../pages/ExplorePage';
import { ArenaPage } from '../pages/ArenaPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MyProjectsPage } from '../pages/MyProjectsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Lazy-Loaded Secondary Pages & Heavy Workflows (Optimizes Initial Bundle Size)
const ResetPasswordPage = React.lazy(() =>
  import('../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const SavedProjectsPage = React.lazy(() =>
  import('../pages/SavedProjectsPage').then((m) => ({ default: m.SavedProjectsPage }))
);
const DirectoryPage = React.lazy(() =>
  import('../pages/DirectoryPage').then((m) => ({ default: m.DirectoryPage }))
);
const ProfilePage = React.lazy(() =>
  import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const NotificationsPage = React.lazy(() =>
  import('../pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const SubmitProjectPage = React.lazy(() =>
  import('../pages/SubmitProjectPage').then((m) => ({ default: m.SubmitProjectPage }))
);
const ProjectDetailsPage = React.lazy(() =>
  import('../features/projects/ProjectDetailsPage').then((m) => ({ default: m.ProjectDetailsPage }))
);

// Lazy-Loaded Admin Pages
const AdminOverviewPage = React.lazy(() =>
  import('../pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage }))
);
const AdminReviewQueuePage = React.lazy(() =>
  import('../pages/admin/AdminReviewQueuePage').then((m) => ({ default: m.AdminReviewQueuePage }))
);
const AdminEmployeesPage = React.lazy(() =>
  import('../pages/admin/AdminEmployeesPage').then((m) => ({ default: m.AdminEmployeesPage }))
);
const AdminCategoriesPage = React.lazy(() =>
  import('../pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminReportsPage = React.lazy(() =>
  import('../pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage }))
);
const AdminAuditLogsPage = React.lazy(() =>
  import('../pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage }))
);
const AdminSettingsPage = React.lazy(() =>
  import('../pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

// Lazy-Loaded Super Admin Pages
const SuperAdminOverviewPage = React.lazy(() =>
  import('../pages/super-admin/SuperAdminOverviewPage').then((m) => ({ default: m.SuperAdminOverviewPage }))
);
const SuperAdminAdminsPage = React.lazy(() =>
  import('../pages/super-admin/SuperAdminAdminsPage').then((m) => ({ default: m.SuperAdminAdminsPage }))
);
const SuperAdminProjectsPage = React.lazy(() =>
  import('../pages/super-admin/SuperAdminProjectsPage').then((m) => ({ default: m.SuperAdminProjectsPage }))
);
const SuperAdminSecurityPage = React.lazy(() =>
  import('../pages/super-admin/SuperAdminSecurityPage').then((m) => ({ default: m.SuperAdminSecurityPage }))
);

export const RouteFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="w-8 h-8 rounded-full border-2 border-[#FF3D88] border-t-transparent animate-spin" />
  </div>
);

// Route Guards
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userProfile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF3D88] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userProfile.accountStatus === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F1B3D]">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <h2 className="text-xl font-heading font-bold text-rose-600 mb-2">Account Suspended</h2>
          <p className="text-sm text-slate-600 mb-6 font-sans">
            Your company account has been suspended by an administrator. Please contact IT or People Operations.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const RoleGuard: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'SUPER_ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { userProfile, isLoading } = useAuth();

  if (isLoading) return null;

  if (!userProfile || !allowedRoles.includes(userProfile.role as any)) {
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
};

/**
 * Session Entry Gate
 * Ensures visitors experience the public Landing Page once per new browser tab/session on the root path.
 * Direct visits to internal routes (e.g. /explore, /projects/:id) immediately load without hijacking.
 * Refreshing any active route keeps the user exactly on that page.
 */
export const SessionEntryGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hasEntered = typeof window !== 'undefined' && sessionStorage.getItem(SESSION_ENTRY_KEY) === 'true';

  // Mark session as entered whenever navigating to any application sub-route
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/welcome') {
      try {
        sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
      } catch {
        // safe fallback
      }
    }
  }, [location.pathname]);

  // If user explicitly visits '/welcome', always show the landing page
  if (location.pathname === '/welcome') {
    return <LandingPage />;
  }

  // On root '/', if user has not completed entry in this session, show LandingPage
  if (location.pathname === '/' && !hasEntered) {
    return <LandingPage />;
  }

  // Otherwise, user has completed entry or is visiting a valid internal route directly
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, userProfile, isLoading } = useAuth();

  return (
    <SessionEntryGate>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Public Welcome / Landing Route */}
          <Route path="/welcome" element={<LandingPage />} />

          {/* Main App Routes (Public Browse Mode + Protected Private Pages) */}
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                isLoading ? (
                  <RouteFallback />
                ) : isAuthenticated && userProfile ? (
                  userProfile.role === 'SUPER_ADMIN' ? (
                    <Navigate to="/super-admin" replace />
                  ) : userProfile.role === 'ADMIN' ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/explore" replace />
                )
              }
            />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/projects" element={<Navigate to="/explore" replace />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />

            {/* Authenticated-only Employee Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <DashboardPage />
                </AuthGuard>
              }
            />
            <Route
              path="/my-projects"
              element={
                <AuthGuard>
                  <MyProjectsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/saved"
              element={
                <AuthGuard>
                  <SavedProjectsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
            <Route
              path="/notifications"
              element={
                <AuthGuard>
                  <NotificationsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/submit"
              element={
                <AuthGuard>
                  <SubmitProjectPage />
                </AuthGuard>
              }
            />

            {/* Catch-all fallback inside AppLayout: branded 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminLayout />
                </RoleGuard>
              </AuthGuard>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="review-queue" element={<AdminReviewQueuePage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>

          {/* Super Admin Protected Routes */}
          <Route
            path="/super-admin"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                  <SuperAdminLayout />
                </RoleGuard>
              </AuthGuard>
            }
          >
            <Route index element={<SuperAdminOverviewPage />} />
            <Route path="admins" element={<SuperAdminAdminsPage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="projects" element={<SuperAdminProjectsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="security" element={<SuperAdminSecurityPage />} />
          </Route>
        </Routes>
      </Suspense>
    </SessionEntryGate>
  );
};
