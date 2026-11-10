import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Main App Pages
import { ExplorePage } from '../pages/ExplorePage';
import { ArenaPage } from '../pages/ArenaPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MyProjectsPage } from '../pages/MyProjectsPage';
import { SavedProjectsPage } from '../pages/SavedProjectsPage';
import { DirectoryPage } from '../pages/DirectoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SubmitProjectPage } from '../pages/SubmitProjectPage';
import { ProjectDetailsPage } from '../features/projects/ProjectDetailsPage';

// Admin Pages
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminReviewQueuePage } from '../pages/admin/AdminReviewQueuePage';
import { AdminEmployeesPage } from '../pages/admin/AdminEmployeesPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Route Guards
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

const RoleGuard: React.FC<{
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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Main App Routes (Public Browse Mode + Protected Private Pages) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<ExplorePage />} />
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
        <Route
          path="audit-logs"
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <AdminAuditLogsPage />
            </RoleGuard>
          }
        />
        <Route
          path="settings"
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <AdminSettingsPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/explore" replace />} />
    </Routes>
  );
};

