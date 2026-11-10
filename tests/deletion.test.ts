import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../src/services/projectService';
import { projectRepository } from '../src/repositories/projectRepository';
import { revisionRepository } from '../src/repositories/revisionRepository';
import { interactionRepository } from '../src/repositories/interactionRepository';
import { reportRepository } from '../src/repositories/reportRepository';
import { adminRepository } from '../src/repositories/adminRepository';
import { userRepository } from '../src/repositories/userRepository';
import { imageUploadService } from '../src/services/imageUploadService';
import { Project, UserProfile } from '../src/types';

vi.mock('../src/repositories/projectRepository', () => ({
  projectRepository: {
    getById: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../src/repositories/revisionRepository', () => ({
  revisionRepository: {
    deleteByProject: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/repositories/interactionRepository', () => ({
  interactionRepository: {
    deleteProjectInteractions: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/repositories/reportRepository', () => ({
  reportRepository: {
    deleteByProject: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/repositories/adminRepository', () => ({
  adminRepository: {
    createAuditLog: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/repositories/userRepository', () => ({
  userRepository: {
    getById: vi.fn(),
    updateProfile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/repositories/notificationRepository', () => ({
  notificationRepository: {
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/services/imageUploadService', () => ({
  imageUploadService: {
    deleteProjectAssets: vi.fn().mockResolvedValue({ cleanedCount: 2 }),
  },
}));

describe('Project Deletion & Notification System', () => {
  const mockOwner: UserProfile = {
    id: 'emp_123',
    email: 'employee@company.com',
    fullName: 'Jane Developer',
    role: 'EMPLOYEE',
    totalSubmittedProjects: 3,
    totalApprovedProjects: 2,
    totalLikesReceived: 15,
    totalVotesReceived: 20,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockAdmin: UserProfile = {
    id: 'admin_456',
    email: 'admin@company.com',
    fullName: 'Admin Supervisor',
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockSuperAdmin: UserProfile = {
    id: 'super_789',
    email: 'ammarshaikh6100@gmail.com',
    fullName: 'Ammar Shaikh',
    role: 'SUPER_ADMIN',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockOtherEmployee: UserProfile = {
    id: 'emp_999',
    email: 'stranger@company.com',
    fullName: 'Stranger Employee',
    role: 'EMPLOYEE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const sampleApprovedProject: Project = {
    id: 'proj_alpha',
    title: 'Cloud Optimizer AI',
    description: 'Autonomous cost reduction tool for cloud workloads',
    coverImageUrl: 'https://storage.googleapis.com/test-bucket/cover.jpg',
    screenshots: ['https://storage.googleapis.com/test-bucket/shot1.jpg'],
    category: 'Cloud',
    technologies: ['TypeScript', 'Node.js'],
    projectStatus: 'LIVE',
    approvalStatus: 'APPROVED',
    isArchived: false,
    isFeatured: true,
    creatorId: 'emp_123',
    creatorName: 'Jane Developer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    likeCount: 10,
    goodVoteCount: 8,
    needsImprovementVoteCount: 2,
    totalValidVotes: 10,
    goodPercentage: 80,
    trendingScore: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows an employee to delete their own project regardless of status', async () => {
    vi.mocked(projectRepository.getById).mockResolvedValue(sampleApprovedProject);
    vi.mocked(userRepository.getById).mockResolvedValue(mockOwner);

    await projectService.deleteProject({
      projectId: 'proj_alpha',
      requestor: mockOwner,
    });

    expect(projectRepository.delete).toHaveBeenCalledWith('proj_alpha');
    expect(interactionRepository.deleteProjectInteractions).toHaveBeenCalledWith('proj_alpha');
    expect(revisionRepository.deleteByProject).toHaveBeenCalledWith('proj_alpha');
    expect(reportRepository.deleteByProject).toHaveBeenCalledWith('proj_alpha');
    expect(imageUploadService.deleteProjectAssets).toHaveBeenCalledWith([
      sampleApprovedProject.coverImageUrl,
      sampleApprovedProject.screenshots![0],
    ]);
  });

  it('rejects deletion if requestor is another regular employee', async () => {
    vi.mocked(projectRepository.getById).mockResolvedValue(sampleApprovedProject);

    await expect(
      projectService.deleteProject({
        projectId: 'proj_alpha',
        requestor: mockOtherEmployee,
      })
    ).rejects.toThrow(/Unauthorized/i);

    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('requires a documented reason when an admin deletes an employee project', async () => {
    vi.mocked(projectRepository.getById).mockResolvedValue(sampleApprovedProject);

    await expect(
      projectService.deleteProject({
        projectId: 'proj_alpha',
        requestor: mockAdmin,
        reason: '   ',
      })
    ).rejects.toThrow(/detailed reason/i);

    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('allows admin to delete employee project with valid reason and decrements stats', async () => {
    vi.mocked(projectRepository.getById).mockResolvedValue(sampleApprovedProject);
    vi.mocked(userRepository.getById).mockResolvedValue(mockOwner);

    await projectService.deleteProject({
      projectId: 'proj_alpha',
      requestor: mockAdmin,
      reason: 'Duplicate submission and violation of platform code standards.',
    });

    expect(projectRepository.delete).toHaveBeenCalledWith('proj_alpha');
    expect(userRepository.updateProfile).toHaveBeenCalledWith(
      'emp_123',
      expect.objectContaining({
        totalSubmittedProjects: 2,
        totalApprovedProjects: 1,
        totalLikesReceived: 5,
        totalVotesReceived: 10,
      })
    );
    expect(adminRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PROJECT_DELETED',
        targetId: 'proj_alpha',
      })
    );
  });

  it('allows Super Admin to delete project with documented reason', async () => {
    vi.mocked(projectRepository.getById).mockResolvedValue(sampleApprovedProject);
    vi.mocked(userRepository.getById).mockResolvedValue(mockOwner);

    await projectService.deleteProject({
      projectId: 'proj_alpha',
      requestor: mockSuperAdmin,
      reason: 'Platform hygiene cleanup of discontinued internal initiative.',
    });

    expect(projectRepository.delete).toHaveBeenCalledWith('proj_alpha');
  });

  it('handles pending review or draft project deletion properly without over-decrementing approved count', async () => {
    const draftProject: Project = {
      ...sampleApprovedProject,
      id: 'proj_draft_1',
      approvalStatus: 'PENDING_REVIEW',
      likeCount: 0,
      totalValidVotes: 0,
    };

    vi.mocked(projectRepository.getById).mockResolvedValue(draftProject);
    vi.mocked(userRepository.getById).mockResolvedValue(mockOwner);

    await projectService.deleteProject({
      projectId: 'proj_draft_1',
      requestor: mockOwner,
    });

    expect(projectRepository.delete).toHaveBeenCalledWith('proj_draft_1');
    expect(userRepository.updateProfile).toHaveBeenCalledWith('emp_123', {
      totalSubmittedProjects: 2,
    });
  });
});
