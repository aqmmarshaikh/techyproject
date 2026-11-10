import { projectRepository } from '../repositories/projectRepository';
import { revisionRepository } from '../repositories/revisionRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { adminRepository } from '../repositories/adminRepository';
import { userRepository } from '../repositories/userRepository';
import { interactionRepository } from '../repositories/interactionRepository';
import { reportRepository } from '../repositories/reportRepository';
import { imageUploadService } from './imageUploadService';
import { 
  Project, 
  ProjectSubmissionInput, 
  UserProfile, 
  ProjectRevision, 
  ApprovalStatus 
} from '../types';

export const projectService = {
  async submitNewProject(
    input: ProjectSubmissionInput,
    creator: UserProfile
  ): Promise<Project> {
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newProject: Project = {
      id: projectId,
      title: input.title,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      screenshots: input.screenshots || [],
      category: input.category,
      technologies: input.technologies,
      projectStatus: input.projectStatus,
      approvalStatus: 'PENDING_REVIEW',
      isArchived: false,
      isFeatured: false,
      liveWebsiteUrl: input.liveWebsiteUrl || undefined,
      githubRepoUrl: input.githubRepoUrl || undefined,

      creatorId: creator.id,
      creatorName: creator.fullName,
      creatorAvatarUrl: creator.avatarUrl,
      creatorDepartment: creator.department,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      likeCount: 0,
      goodVoteCount: 0,
      needsImprovementVoteCount: 0,
      totalValidVotes: 0,
      goodPercentage: 0,
      trendingScore: 0,
    };

    await projectRepository.create(newProject);

    // Update creator submitted project aggregate count
    try {
      await userRepository.updateProfile(creator.id, {
        totalSubmittedProjects: (creator.totalSubmittedProjects || 0) + 1,
      });
    } catch (err) {
      console.warn('[projectService] Creator counter update non-fatal error:', err);
    }

    // Dispatch submission notification to employee
    try {
      await notificationRepository.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        recipientId: creator.id,
        title: 'Project Submitted for Review',
        message: `Your project "${newProject.title}" has been submitted and is currently Pending Review.`,
        type: 'SYSTEM',
        targetUrl: `/my-projects?tab=pending`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[projectService] Submission notification warning:', err);
    }

    return newProject;
  },

  async submitRevision(
    projectId: string,
    proposedInput: ProjectSubmissionInput,
    changeSummary: string,
    creator: UserProfile
  ): Promise<ProjectRevision> {
    const project = await projectRepository.getById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.creatorId !== creator.id) {
      throw new Error('Only the project creator can submit a revision');
    }

    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const revision: ProjectRevision = {
      id: revisionId,
      projectId,
      creatorId: creator.id,
      revisionStatus: 'PENDING_REVIEW',
      proposedChanges: {
        title: proposedInput.title,
        description: proposedInput.description,
        coverImageUrl: proposedInput.coverImageUrl,
        screenshots: proposedInput.screenshots,
        category: proposedInput.category,
        technologies: proposedInput.technologies,
        projectStatus: proposedInput.projectStatus,
        liveWebsiteUrl: proposedInput.liveWebsiteUrl,
        githubRepoUrl: proposedInput.githubRepoUrl,
      },
      previousSnapshot: {
        title: project.title,
        description: project.description,
        coverImageUrl: project.coverImageUrl,
        screenshots: project.screenshots,
        category: project.category,
        technologies: project.technologies,
        projectStatus: project.projectStatus,
        liveWebsiteUrl: project.liveWebsiteUrl,
        githubRepoUrl: project.githubRepoUrl,
      },
      changeSummary,
      createdAt: new Date().toISOString(),
    };

    await revisionRepository.create(revision);

    // Link revision to project
    await projectRepository.update(projectId, {
      activeRevisionId: revisionId,
    });

    // Dispatch revision submission notification
    try {
      await notificationRepository.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        recipientId: creator.id,
        title: 'Project Revision Submitted',
        message: `Your revision for "${project.title}" was submitted and is pending administrator review.`,
        type: 'REVISION_STATUS',
        targetUrl: `/projects/${project.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[projectService] Revision notification warning:', err);
    }

    return revision;
  },

  async reviewProject(params: {
    projectId: string;
    decision: 'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED';
    reason?: string;
    feedback?: string;
    adminUser: UserProfile;
  }): Promise<void> {
    const { projectId, decision, reason, feedback, adminUser } = params;
    const project = await projectRepository.getById(projectId);
    if (!project) throw new Error('Project not found');

    let newStatus: ApprovalStatus = 'APPROVED';
    if (decision === 'REJECT') newStatus = 'REJECTED';
    if (decision === 'CHANGES_REQUESTED') newStatus = 'CHANGES_REQUESTED';

    const updates: Partial<Project> = {
      approvalStatus: newStatus,
      reviewedBy: adminUser.id,
      rejectionReason: decision === 'REJECT' ? reason : undefined,
      adminFeedback: decision === 'CHANGES_REQUESTED' ? feedback : undefined,
    };

    if (decision === 'APPROVE') {
      updates.approvedAt = new Date().toISOString();
      // Increment creator's approved projects counter
      const creator = await userRepository.getById(project.creatorId);
      if (creator) {
        await userRepository.updateProfile(creator.id, {
          totalApprovedProjects: (creator.totalApprovedProjects || 0) + 1,
        });
      }
    }

    await projectRepository.update(projectId, updates);

    // Dispatch notification to project creator
    let notifTitle = 'Project Approved!';
    let notifMsg = `Congratulations! Your project "${project.title}" has been approved and is now live on Explore and Arena.`;
    let notifType: 'APPROVAL' | 'REJECTION' | 'CHANGES_REQUESTED' = 'APPROVAL';

    if (decision === 'REJECT') {
      notifTitle = 'Project Submission Rejected';
      notifMsg = `Your project submission "${project.title}" was not approved. Reason: ${reason}`;
      notifType = 'REJECTION';
    } else if (decision === 'CHANGES_REQUESTED') {
      notifTitle = 'Changes Requested on Project';
      notifMsg = `Admin has requested changes on "${project.title}": ${feedback}`;
      notifType = 'CHANGES_REQUESTED';
    }

    await notificationRepository.create({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipientId: project.creatorId,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      targetUrl: `/projects/${project.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Immutable Audit Log
    await adminRepository.createAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: `PROJECT_${decision}`,
      targetEntity: 'projects',
      targetId: projectId,
      metadata: {
        title: project.title,
        decision,
        reason: reason || null,
        feedback: feedback || null,
      },
    });
  },

  async reviewRevision(params: {
    revisionId: string;
    decision: 'APPROVE' | 'REJECT';
    feedback?: string;
    adminUser: UserProfile;
  }): Promise<void> {
    const { revisionId, decision, feedback, adminUser } = params;
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) throw new Error('Revision record not found');

    const project = await projectRepository.getById(revision.projectId);
    if (!project) throw new Error('Target project not found');

    if (decision === 'APPROVE') {
      // Merge proposed changes atomically into the live project
      const mergedUpdates: Partial<Project> = {
        ...revision.proposedChanges,
        activeRevisionId: undefined,
        updatedAt: new Date().toISOString(),
      };
      await projectRepository.update(project.id, mergedUpdates);
      await revisionRepository.updateStatus(revisionId, 'APPROVED', feedback, adminUser.id);

      await notificationRepository.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        recipientId: revision.creatorId,
        title: 'Project Revision Approved',
        message: `Your updates for "${project.title}" have been approved and published.`,
        type: 'APPROVAL',
        targetUrl: `/projects/${project.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      await revisionRepository.updateStatus(revisionId, 'REJECTED', feedback, adminUser.id);
      await projectRepository.update(project.id, {
        activeRevisionId: undefined,
      });

      await notificationRepository.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        recipientId: revision.creatorId,
        title: 'Project Revision Rejected',
        message: `Your revision for "${project.title}" was not approved. Feedback: ${feedback || 'None provided'}`,
        type: 'REJECTION',
        targetUrl: `/projects/${project.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Immutable Audit Log
    await adminRepository.createAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: `REVISION_${decision}`,
      targetEntity: 'projectRevisions',
      targetId: revisionId,
      metadata: {
        projectId: project.id,
        decision,
        feedback: feedback || null,
      },
    });
  },

  async toggleArchive(projectId: string, isArchived: boolean, adminUser: UserProfile): Promise<void> {
    await projectRepository.update(projectId, { isArchived });
    await adminRepository.createAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: isArchived ? 'PROJECT_ARCHIVED' : 'PROJECT_RESTORED',
      targetEntity: 'projects',
      targetId: projectId,
      metadata: { isArchived },
    });
  },

  async toggleFeatured(projectId: string, isFeatured: boolean, adminUser: UserProfile): Promise<void> {
    await projectRepository.update(projectId, { isFeatured });
    await adminRepository.createAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: isFeatured ? 'PROJECT_FEATURED' : 'PROJECT_UNFEATURED',
      targetEntity: 'projects',
      targetId: projectId,
      metadata: { isFeatured },
    });
  },

  /**
   * Complete, secure project deletion system.
   * - Allows creator to delete their own project (at any lifecycle stage: DRAFT, PENDING, APPROVED, REJECTED, ARCHIVED)
   * - Allows Admins/Super Admins to delete any project (requires documented reason)
   * - Completely cleans up interactions, revisions, reports, creator aggregate stats, and media assets
   * - Dispatches appropriate notifications & records immutable audit log
   */
  async deleteProject(params: {
    projectId: string;
    requestor: UserProfile;
    reason?: string;
  }): Promise<void> {
    const { projectId, requestor, reason } = params;
    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const isOwner = project.creatorId === requestor.id;
    const isAdmin = requestor.role === 'ADMIN' || requestor.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized to delete this project. Only the project owner or administrators can perform this action.');
    }

    if (isAdmin && !isOwner) {
      if (!reason || reason.trim().length < 5) {
        throw new Error('A detailed reason (at least 5 characters) is required when an administrator removes an employee project.');
      }
    }

    // 1. Delete primary project document from Firestore
    await projectRepository.delete(projectId);

    // 2. Parallel cleanup tasks
    const cleanupTasks: Promise<unknown>[] = [
      // Clean up interactions (likes, votes, bookmarks)
      interactionRepository.deleteProjectInteractions(projectId),

      // Clean up revisions
      revisionRepository.deleteByProject(projectId),

      // Clean up reports
      reportRepository.deleteByProject(projectId),

      // Safely delete storage media assets
      imageUploadService.deleteProjectAssets([
        project.coverImageUrl,
        ...(project.screenshots || []),
      ]),
    ];

    // 3. Decrement creator counters appropriately
    cleanupTasks.push(
      (async () => {
        try {
          const creator = await userRepository.getById(project.creatorId);
          if (creator) {
            const updates: Partial<UserProfile> = {
              totalSubmittedProjects: Math.max(0, (creator.totalSubmittedProjects || 1) - 1),
            };
            if (project.approvalStatus === 'APPROVED') {
              updates.totalApprovedProjects = Math.max(0, (creator.totalApprovedProjects || 1) - 1);
              updates.totalLikesReceived = Math.max(0, (creator.totalLikesReceived || 0) - (project.likeCount || 0));
              updates.totalVotesReceived = Math.max(0, (creator.totalVotesReceived || 0) - (project.totalValidVotes || 0));
            }
            await userRepository.updateProfile(creator.id, updates);
          }
        } catch (err) {
          console.warn('[projectService] Creator counters decrement warning:', err);
        }
      })()
    );

    // 4. Notifications
    cleanupTasks.push(
      (async () => {
        try {
          if (isOwner) {
            await notificationRepository.create({
              id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              recipientId: requestor.id,
              title: 'Project Deleted',
              message: `Your project "${project.title}" has been permanently deleted from ProjectHub.`,
              type: 'SYSTEM',
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          } else {
            // Admin removed project - send detailed notice with documented reason
            await notificationRepository.create({
              id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              recipientId: project.creatorId,
              title: 'Project Removed by Administration',
              message: `Your project "${project.title}" was removed by an administrator. Reason: ${reason}`,
              type: 'REJECTION',
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('[projectService] Deletion notification warning:', err);
        }
      })()
    );

    // 5. Immutable Audit Log
    cleanupTasks.push(
      adminRepository.createAuditLog({
        actorId: requestor.id,
        actorEmail: requestor.email,
        action: 'PROJECT_DELETED',
        targetEntity: 'projects',
        targetId: projectId,
        metadata: {
          title: project.title,
          creatorId: project.creatorId,
          deletedBy: requestor.role,
          isSelfDelete: isOwner,
          reason: reason || 'Self deletion by creator',
        },
      })
    );

    await Promise.allSettled(cleanupTasks);
  },
};

