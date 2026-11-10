import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Trophy, 
  LayoutDashboard, 
  FolderGit2, 
  Bookmark, 
  Users, 
  UserCircle, 
  Bell, 
  ShieldAlert, 
  Plus, 
  LogOut, 
  Menu, 
  X,
  Layers,
  Sparkles,
  ExternalLink,
  LogIn
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MAIN_NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants/navigation';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { PreviewModeBanner } from '../components/common/PreviewModeBanner';
import { UserAvatar } from '../components/common/UserAvatar';
import { useRolePreview } from '../contexts/RolePreviewContext';
import { notificationRepository } from '../repositories/notificationRepository';

export const AppLayout: React.FC = () => {
  const { userProfile, isAuthenticated, logout, isAdmin, isSuperAdmin, openAuthModal } = useAuth();
  const { effectiveRole } = useRolePreview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Real-time unread notification count
  useEffect(() => {
    if (!userProfile?.id) {
      setUnreadNotifications(0);
      return;
    }
    const unsubscribe = notificationRepository.subscribeToUserNotifications(
      userProfile.id,
      (items) => {
        setUnreadNotifications(items.filter((n) => !n.isRead).length);
      },
      (err) => {
        console.warn('Real-time notification listener error:', err);
        notificationRepository
          .listUserNotifications(userProfile.id)
          .then((items) => {
            setUnreadNotifications(items.filter((n) => !n.isRead).length);
          })
          .catch(console.warn);
      }
    );
    return () => unsubscribe();
  }, [userProfile?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-5 h-5 shrink-0" />;
      case 'Trophy': return <Trophy className="w-5 h-5 shrink-0" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5 shrink-0" />;
      case 'FolderGit2': return <FolderGit2 className="w-5 h-5 shrink-0" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5 shrink-0" />;
      case 'Users': return <Users className="w-5 h-5 shrink-0" />;
      case 'UserCircle': return <UserCircle className="w-5 h-5 shrink-0" />;
      case 'Bell': return <Bell className="w-5 h-5 shrink-0" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 shrink-0" />;
      default: return <Layers className="w-5 h-5 shrink-0" />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F1B3D] text-white">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <NavLink to="/explore" className="flex items-center gap-3 group">
          <img
            src="/android-chrome-192x192.png"
            alt="ProjectHub Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-pinkGlow group-hover:scale-105 transition-transform border border-[#FF3D88]/30 shrink-0"
          />
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight text-white flex items-center">
              <span>Project</span><span className="text-[#FF3D88]">Hub</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-decorative tracking-wider uppercase">Team Project Arena</p>
          </div>
        </NavLink>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {/* Main Section */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-decorative uppercase tracking-wider text-white/40">Navigation</p>
          <nav className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const isAuthRequired = !['/explore', '/arena', '/directory'].includes(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (!isAuthenticated && isAuthRequired) {
                      e.preventDefault();
                      openAuthModal(`Sign in to access ${item.title}.`);
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm font-sans transition-all duration-150 ${
                      isActive && (isAuthenticated || !isAuthRequired)
                        ? 'bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white shadow-md'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    {getIcon(item.iconName)}
                    <span>{item.title}</span>
                  </div>
                  {item.title === 'Notifications' && unreadNotifications > 0 && isAuthenticated && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#FF3D88] text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Section (Hidden in Employee Preview) */}
        {effectiveRole !== 'EMPLOYEE' && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-decorative uppercase tracking-wider text-[#FF3D88] font-bold">
                Admin Center
              </p>
              <RoleBadge role={effectiveRole} />
            </div>
            <nav className="space-y-1">
              {effectiveRole === 'SUPER_ADMIN' && (
                <NavLink
                  to="/super-admin"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm font-sans transition-all ${
                      isActive
                        ? 'bg-purple-600/30 text-white border-l-4 border-purple-400'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  <span>Super Admin</span>
                </NavLink>
              )}
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm font-sans transition-all ${
                    isActive
                      ? 'bg-white/20 text-white border-l-4 border-[#FF3D88]'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <ShieldAlert className="w-5 h-5 text-[#FF3D88]" />
                <span>Control Center</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* User Profile Footer or Guest Sign In */}
      {isAuthenticated ? (
        <div className="p-4 border-t border-white/10 bg-[#0A1229]">
          <div className="flex items-center gap-3">
            <UserAvatar
              user={userProfile}
              size="md"
              className="ring-2 ring-[#FF3D88]/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate font-sans">{userProfile?.fullName || 'Authenticated User'}</p>
              <p className="text-xs text-white/50 truncate font-sans">{userProfile?.designation || 'Employee'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out of ProjectHub"
              className="p-2 text-white/60 hover:text-[#FF3D88] hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-white/10 bg-[#0A1229]">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#FF3D88]" />
              <span className="text-xs font-heading font-bold text-white">Join ProjectHub</span>
            </div>
            <p className="text-[11px] text-white/60 font-sans leading-relaxed">
              Sign in to vote in the Arena, like peer innovations, and submit projects.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full mt-3 font-semibold text-xs"
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              onClick={() => openAuthModal('Sign in to unlock all ProjectHub features.')}
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Role Preview Banner */}
      <PreviewModeBanner />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 shadow-sm fixed inset-y-0 left-0 z-30">
          {sidebarContent}
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-[#0F1B3D]/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-80 max-w-[85%] bg-[#0F1B3D] h-full shadow-2xl z-10 flex flex-col">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          {/* Top Navbar */}
          <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-600 hover:text-[#0F1B3D] hover:bg-slate-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-heading font-semibold text-base sm:text-lg text-[#0F1B3D] capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Explore'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Switcher for Super Admin */}
              <RoleSwitcher />

              {/* Quick Submit Project Action */}
              <Button
                variant={isAuthenticated ? 'primary' : 'outline'}
                size="sm"
                leftIcon={<Plus className={`w-4 h-4 ${!isAuthenticated ? 'text-[#FF3D88]' : ''}`} />}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('Sign in to submit your project for review.');
                    return;
                  }
                  navigate('/submit');
                }}
              >
                <span className="hidden sm:inline">Submit Project</span>
                <span className="sm:hidden">Submit</span>
              </Button>

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <NavLink
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-600 hover:text-[#0F1B3D] hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3D88] ring-2 ring-white" />
                  )}
                </NavLink>

                {/* Profile mini avatar */}
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 pl-2 border-l border-slate-200"
                  title="View Profile"
                  aria-label="View Profile"
                >
                  <UserAvatar
                    user={userProfile}
                    size="sm"
                    className="ring-1 ring-[#FF3D88]/30 hover:ring-[#FF3D88] transition-all"
                  />
                </NavLink>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={() => openAuthModal('Sign in to your ProjectHub account.')}
              >
                <span>Log In</span>
              </Button>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
  );
};

