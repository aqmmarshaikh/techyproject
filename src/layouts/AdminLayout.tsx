import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckSquare, 
  UserCog, 
  Tag, 
  Flag, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { PreviewModeBanner } from '../components/common/PreviewModeBanner';
import { useRolePreview } from '../contexts/RolePreviewContext';

export const AdminLayout: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const { effectiveRole } = useRolePreview();
  const navigate = useNavigate();

  // Route protection: If user is not an Admin or Super Admin, kick back to explore
  if (!isAdmin) {
    return <Navigate to="/explore" replace />;
  }

  const adminNav = [
    { title: 'Overview', path: '/admin', icon: <ShieldAlert className="w-4 h-4" /> },
    { title: 'Review Queue', path: '/admin/review-queue', icon: <CheckSquare className="w-4 h-4" /> },
    { title: 'Employees', path: '/admin/employees', icon: <UserCog className="w-4 h-4" /> },
    { title: 'Categories', path: '/admin/categories', icon: <Tag className="w-4 h-4" /> },
    { title: 'Reports & Flagged', path: '/admin/reports', icon: <Flag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Role Preview Banner */}
      <PreviewModeBanner />

      {/* Top Banner indicating administrator operations */}
      <header className="bg-[#0F1B3D] text-white border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF3D88] rounded-xl text-white shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base sm:text-lg tracking-tight">Admin Control Center</h2>
              <RoleBadge role="ADMIN" />
            </div>
            <p className="text-xs text-white/60 font-sans">Project Approvals, Moderation & Category Taxonomy</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Integrated Role Switcher for Super Admin */}
          <RoleSwitcher />

          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/explore')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Showcase
          </Button>
        </div>
      </header>

      {/* Admin Tab Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max py-2">
          {adminNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0F1B3D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0F1B3D] hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Admin Page Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

