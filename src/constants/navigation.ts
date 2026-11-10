import { UserRole } from '../types';

export interface NavItem {
  title: string;
  path: string;
  iconName: string;
  requiredRoles?: UserRole[];
  badgeCount?: number;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Explore',
    path: '/explore',
    iconName: 'Compass',
  },
  {
    title: 'Project Arena',
    path: '/arena',
    iconName: 'Trophy',
  },
  {
    title: 'My Dashboard',
    path: '/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    title: 'My Projects',
    path: '/my-projects',
    iconName: 'FolderGit2',
  },
  {
    title: 'Saved Projects',
    path: '/saved',
    iconName: 'Bookmark',
  },
  {
    title: 'Employee Directory',
    path: '/directory',
    iconName: 'Users',
  },
  {
    title: 'My Profile',
    path: '/profile',
    iconName: 'UserCircle',
  },
  {
    title: 'Notifications',
    path: '/notifications',
    iconName: 'Bell',
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Admin Overview',
    path: '/admin',
    iconName: 'ShieldAlert',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Review Queue',
    path: '/admin/review-queue',
    iconName: 'CheckSquare',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Employee Management',
    path: '/admin/employees',
    iconName: 'UserCog',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Categories',
    path: '/admin/categories',
    iconName: 'Tag',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Reports & Moderation',
    path: '/admin/reports',
    iconName: 'Flag',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Audit Logs',
    path: '/admin/audit-logs',
    iconName: 'FileText',
    requiredRoles: ['SUPER_ADMIN'],
  },
  {
    title: 'Platform Settings',
    path: '/admin/settings',
    iconName: 'Settings',
    requiredRoles: ['SUPER_ADMIN'],
  },
];

