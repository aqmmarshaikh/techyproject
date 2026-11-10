import { APP_CONFIG } from '../app/config';
import { UserRole } from '../types';

/**
 * Strictly resolves user role based on authenticated email.
 * ONLY designated admin emails receive SUPER_ADMIN or ADMIN privileges.
 * ALL other users default strictly to EMPLOYEE.
 */
export function resolveUserRoleByEmail(email: string | null | undefined): UserRole {
  if (!email) return 'EMPLOYEE';
  const normalized = email.trim().toLowerCase();

  const isSuperAdmin = APP_CONFIG.auth.superAdminEmails
    .map((e) => e.trim().toLowerCase())
    .includes(normalized);

  if (isSuperAdmin) {
    return 'SUPER_ADMIN';
  }

  const isAdmin = APP_CONFIG.auth.adminEmails
    .map((e) => e.trim().toLowerCase())
    .includes(normalized);

  if (isAdmin) {
    return 'ADMIN';
  }

  return 'EMPLOYEE';
}
