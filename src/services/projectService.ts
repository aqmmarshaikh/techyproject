import { projectRepository } from '../repositories/projectRepository';
import { revisionRepository } from '../repositories/revisionRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { adminRepository } from '../repositories/adminRepository';
import { userRepository } from '../repositories/userRepository';
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
};

