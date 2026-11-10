import { describe, it, expect, beforeEach } from 'vitest';
import { UserRole, UserProfile } from '../src/types';

/**
 * Pure simulation of RolePreview logic matching RolePreviewContext
 */
class RolePreviewSimulator {
  private userProfile: UserProfile | null = null;
  private previewRole: UserRole | null = null;

  setUser(profile: UserProfile | null) {
    this.userProfile = profile;
    // Security check: non-superadmins are wiped
    if (!this.isRealSuperAdmin()) {
      this.previewRole = null;
    }
  }

  isRealSuperAdmin(): boolean {
    return Boolean(this.userProfile && this.userProfile.role === 'SUPER_ADMIN');
  }

  get effectiveRole(): UserRole {
    if (this.isRealSuperAdmin() && this.previewRole) {
      return this.previewRole;
    }
    return this.userProfile?.role || 'EMPLOYEE';
  }

  get isPreviewActive(): boolean {
    return Boolean(
      this.isRealSuperAdmin() && this.previewRole && this.previewRole !== 'SUPER_ADMIN'
    );
  }

  switchPreviewRole(targetRole: UserRole): boolean {
    if (!this.isRealSuperAdmin()) {
      // Deny role preview switch to non-superadmins
      return false;
    }
    this.previewRole = targetRole;
    return true;
  }

  exitPreview() {
    this.previewRole = null;
  }
}

describe('Role Preview Security & Behavior Simulator', () => {
  let sim: RolePreviewSimulator;

  const superAdminProfile: UserProfile = {
    id: 'usr_super',
    email: 'ammarshaikh6100@gmail.com',
    fullName: 'Master Super Admin',
    designation: 'Platform Director',
    department: 'Executive',
    skills: ['Security', 'Cloud'],
    technologies: ['React', 'Firebase'],
    role: 'SUPER_ADMIN',
    accountStatus: 'ACTIVE',
    joinDate: new Date().toISOString(),
    totalSubmittedProjects: 0,
    totalApprovedProjects: 0,
    totalLikesReceived: 0,
    totalVotesReceived: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const employeeProfile: UserProfile = {
    id: 'usr_emp',
    email: 'employee@company.com',
    fullName: 'Regular Colleague',
    designation: 'Frontend Engineer',
    department: 'Engineering',
    skills: ['CSS'],
    technologies: ['React'],
    role: 'EMPLOYEE',
    accountStatus: 'ACTIVE',
    joinDate: new Date().toISOString(),
    totalSubmittedProjects: 1,
    totalApprovedProjects: 1,
    totalLikesReceived: 5,
    totalVotesReceived: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    sim = new RolePreviewSimulator();
  });

  it('defaults to SUPER_ADMIN view for authenticated Super Admin', () => {
    sim.setUser(superAdminProfile);
    expect(sim.isRealSuperAdmin()).toBe(true);
    expect(sim.effectiveRole).toBe('SUPER_ADMIN');
    expect(sim.isPreviewActive).toBe(false);
  });

  it('allows Super Admin to switch preview to ADMIN', () => {
    sim.setUser(superAdminProfile);
    const switched = sim.switchPreviewRole('ADMIN');
    expect(switched).toBe(true);
    expect(sim.effectiveRole).toBe('ADMIN');
    expect(sim.isPreviewActive).toBe(true);
    // Real authenticated user remains SUPER_ADMIN
    expect(sim.isRealSuperAdmin()).toBe(true);
  });

  it('allows Super Admin to switch preview to EMPLOYEE', () => {
    sim.setUser(superAdminProfile);
    const switched = sim.switchPreviewRole('EMPLOYEE');
    expect(switched).toBe(true);
    expect(sim.effectiveRole).toBe('EMPLOYEE');
    expect(sim.isPreviewActive).toBe(true);
    expect(sim.isRealSuperAdmin()).toBe(true);
  });

  it('resets preview back to SUPER_ADMIN on exitPreview()', () => {
    sim.setUser(superAdminProfile);
    sim.switchPreviewRole('EMPLOYEE');
    expect(sim.effectiveRole).toBe('EMPLOYEE');
    sim.exitPreview();
    expect(sim.effectiveRole).toBe('SUPER_ADMIN');
    expect(sim.isPreviewActive).toBe(false);
  });

  it('blocks non-superadmin from activating role preview', () => {
    sim.setUser(employeeProfile);
    expect(sim.isRealSuperAdmin()).toBe(false);
    expect(sim.effectiveRole).toBe('EMPLOYEE');

    // Attempting to switch preview as employee must fail
    const switched = sim.switchPreviewRole('SUPER_ADMIN');
    expect(switched).toBe(false);
    expect(sim.effectiveRole).toBe('EMPLOYEE');
    expect(sim.isPreviewActive).toBe(false);
  });

  it('wipes any residual preview role if session switches to a normal employee', () => {
    sim.setUser(superAdminProfile);
    sim.switchPreviewRole('ADMIN');
    expect(sim.effectiveRole).toBe('ADMIN');

    // User switches or logs in as employee
    sim.setUser(employeeProfile);
    expect(sim.isRealSuperAdmin()).toBe(false);
    expect(sim.effectiveRole).toBe('EMPLOYEE');
    expect(sim.isPreviewActive).toBe(false);
  });
});
