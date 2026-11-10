import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  FolderGit2, 
  Settings, 
  FileText, 
  Lock, 
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { PreviewModeBanner } from '../components/common/PreviewModeBanner';

export const SuperAdminLayout: React.FC = () => {
  const { userProfile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Route protection: If user is not a real Super Admin, kick back to explore
  if (!isSuperAdmin) {
    return <Navigate to="/explore" replace />;
  }

  const superAdminNav = [
    { title: 'Overview', path: '/super-admin', icon: <ShieldAlert className="w-4 h-4" /> },
    { title: 'Manage Admins', path: '/super-admin/admins', icon: <UserCheck className="w-4 h-4" /> },
    { title: 'Employees', path: '/super-admin/employees', icon: <Users className="w-4 h-4" /> },
    { title: 'Project Moderation', path: '/super-admin/projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { title: 'Platform Settings', path: '/super-admin/settings', icon: <Settings className="w-4 h-4" /> },
    { title: 'Audit Logs', path: '/super-admin/audit-logs', icon: <FileText className="w-4 h-4" /> },
    { title: 'Security Controls', path: '/super-admin/security', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Role Preview Banner */}
      <PreviewModeBanner />

      {/* Super Admin Executive Top Header */}
      <header className="bg-[#0F1B3D] text-white border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl text-white shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base sm:text-lg tracking-tight">
                Super Admin Command Center
              </h2>
              <RoleBadge role="SUPER_ADMIN" />
            </div>
            <p className="text-xs text-white/60 font-sans">
              Master Governance, Administrator Access & System Security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Integrated Role Switcher */}
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

      {/* Sub-navigation tabs */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max py-2">
          {superAdminNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/super-admin'}
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

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

