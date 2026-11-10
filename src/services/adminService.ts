import { userRepository } from '../repositories/userRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { reportRepository } from '../repositories/reportRepository';
import { adminRepository } from '../repositories/adminRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { 
  UserProfile, 
  AccountStatus, 
  UserRole, 
  Category, 
  ReportStatus, 
  SystemSettings 
} from '../types';

export const adminService = {
  async inviteEmployee(params: {
    email: string;
    fullName: string;
    department: string;
    designation: string;
    role: 'EMPLOYEE' | 'ADMIN';
    currentAdmin: UserProfile;
  }): Promise<UserProfile> {
    const { email, fullName, department, designation, role, currentAdmin } = params;

    // Check if domain policy allows this email
    const settings = await adminRepository.getSettings();
    if (settings.registrationPolicy === 'RESTRICTED_DOMAIN' && settings.companyDomain) {
      if (!email.toLowerCase().endsWith(`@${settings.companyDomain.toLowerCase()}`)) {
        throw new Error(`Email must belong to company domain: @${settings.companyDomain}`);
      }
    }

    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: UserProfile = {
      id: newUserId,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      designation: designation.trim(),
      department: department.trim(),
      skills: [],
      technologies: [],
      role: role,
      accountStatus: 'INVITED',
      joinDate: new Date().toISOString(),
      totalSubmittedProjects: 0,
      totalApprovedProjects: 0,
      totalLikesReceived: 0,
      totalVotesReceived: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRepository.createProfile(newProfile);

    // Immutable Audit Log
    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: 'EMPLOYEE_INVITED',
      targetEntity: 'users',
      targetId: newUserId,
      metadata: { email, role, department },
    });

    return newProfile;
  },

  async setUserAccountStatus(
    targetUid: string,
    status: AccountStatus,
    currentAdmin: UserProfile
  ): Promise<void> {
    const target = await userRepository.getById(targetUid);
    if (!target) throw new Error('User not found');

    if (target.role === 'SUPER_ADMIN') {
      throw new Error('Super Admin accounts cannot be suspended.');
    }

    if (currentAdmin.role === 'ADMIN' && target.role === 'ADMIN') {
      throw new Error('Administrators cannot suspend peer administrators. Only Super Admins can.');
    }

    await userRepository.setAccountStatus(targetUid, status);

    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetEntity: 'users',
      targetId: targetUid,
      metadata: { targetEmail: target.email, previousStatus: target.accountStatus, newStatus: status },
    });

    if (status === 'SUSPENDED') {
      await notificationRepository.create({
        id: `notif_${Date.now()}`,
        recipientId: targetUid,
        title: 'Account Suspended',
        message: 'Your account access has been suspended by an administrator.',
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  },

  async setUserRole(
    targetUid: string,
    newRole: UserRole,
    currentAdmin: UserProfile
  ): Promise<void> {
    if (currentAdmin.role !== 'SUPER_ADMIN') {
      throw new Error('Only Super Administrators are permitted to modify user roles.');
    }

    const target = await userRepository.getById(targetUid);
    if (!target) throw new Error('User not found');

    await userRepository.setUserRole(targetUid, newRole);

    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: 'ROLE_MODIFIED',
      targetEntity: 'users',
      targetId: targetUid,
      metadata: {
        targetEmail: target.email,
        previousRole: target.role,
        newRole,
      },
    });
  },

  async saveCategory(category: Category, currentAdmin: UserProfile): Promise<void> {
    const existing = await categoryRepository.getById(category.id);
    if (existing) {
      await categoryRepository.update(category.id, category);
    } else {
      await categoryRepository.create(category);
    }

    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: existing ? 'CATEGORY_UPDATED' : 'CATEGORY_CREATED',
      targetEntity: 'categories',
      targetId: category.id,
      metadata: { name: category.name },
    });
  },

  async deleteCategory(categoryId: string, currentAdmin: UserProfile): Promise<void> {
    await categoryRepository.delete(categoryId);
    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: 'CATEGORY_DELETED',
      targetEntity: 'categories',
      targetId: categoryId,
      metadata: { categoryId },
    });
  },

  async resolveReport(params: {
    reportId: string;
    status: ReportStatus;
    adminNotes?: string;
    actionTaken?: string;
    currentAdmin: UserProfile;
  }): Promise<void> {
    const { reportId, status, adminNotes, actionTaken, currentAdmin } = params;
    await reportRepository.updateStatus(reportId, status, adminNotes, actionTaken);

    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: `REPORT_${status}`,
      targetEntity: 'reports',
      targetId: reportId,
      metadata: { status, adminNotes, actionTaken },
    });
  },

  async updatePlatformSettings(
    settings: Partial<SystemSettings>,
    currentAdmin: UserProfile
  ): Promise<void> {
    if (currentAdmin.role !== 'SUPER_ADMIN') {
      throw new Error('Only Super Administrators are permitted to modify system settings.');
    }

    await adminRepository.updateSettings(settings, currentAdmin.id);

    await adminRepository.createAuditLog({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: 'SYSTEM_SETTINGS_UPDATED',
      targetEntity: 'systemSettings',
      targetId: 'global',
      metadata: settings,
    });
  },
};

