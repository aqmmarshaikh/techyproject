import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { Project, UserProfile } from '../types';
import { getUserDisplayName, getUserInitials, resolveUserAvatarUrl } from '../utils/userDisplay';

export interface LeaderboardUser {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  customAvatarUrl?: string;
  googlePhotoUrl?: string;
  initials: string;
  department?: string;
  designation?: string;
  totalLikes: number;
  approvedProjectsCount: number;
  projectsWithLikesCount: number;
  rank: number;
}

export const leaderboardService = {
  /**
   * Computes the real Top 3 User Leaderboard based strictly on valid likes
   * received across approved, non-deleted projects.
   */
  async getTopUsers(limitCount: number = 3): Promise<LeaderboardUser[]> {
    try {
      // 1. Fetch approved projects (strictly excludes pending, rejected, and deleted projects)
      const approvedProjects = await projectRepository.listApproved(undefined, 250);

      // 2. Fetch all active employees
      const employees = await userRepository.listEmployees({
        accountStatus: 'ACTIVE',
        maxResults: 200,
      });

      // Map users by id for quick lookup
      const userMap = new Map<string, UserProfile>();
      for (const emp of employees) {
        userMap.set(emp.id, emp);
      }

      // Map to aggregate stats per creator
      interface UserStats {
        totalLikes: number;
        approvedProjectsCount: number;
        projectsWithLikesCount: number;
        sampleProject?: Project;
      }
      const statsMap = new Map<string, UserStats>();

      for (const project of approvedProjects) {
        // Strictly ensure only APPROVED projects are included
        if (project.approvalStatus && project.approvalStatus !== 'APPROVED') {
          continue;
        }

        const creatorId = project.creatorId;
        if (!creatorId) continue;

        const current = statsMap.get(creatorId) || {
          totalLikes: 0,
          approvedProjectsCount: 0,
          projectsWithLikesCount: 0,
          sampleProject: project,
        };

        const likes = Number(project.likeCount) || 0;
        current.totalLikes += likes;
        current.approvedProjectsCount += 1;
        if (likes > 0) {
          current.projectsWithLikesCount += 1;
        }
        current.sampleProject = project;

        statsMap.set(creatorId, current);
      }

      // Build eligible leaderboard candidates
      const candidates: LeaderboardUser[] = [];

      statsMap.forEach((stats, creatorId) => {
        const profile = userMap.get(creatorId);

        // Derive user display attributes adhering to strict priority rules
        const displayName = getUserDisplayName(
          profile || {
            fullName: stats.sampleProject?.creatorName,
            creatorName: stats.sampleProject?.creatorName,
          }
        );

        const avatarUrl = resolveUserAvatarUrl(
          profile || {
            creatorAvatarUrl: stats.sampleProject?.creatorAvatarUrl,
          }
        );

        const initials = getUserInitials(displayName);

        candidates.push({
          userId: creatorId,
          displayName,
          email: profile?.email || '',
          avatarUrl,
          customAvatarUrl: profile?.customAvatarUrl,
          googlePhotoUrl: profile?.googlePhotoUrl,
          initials,
          department: profile?.department || stats.sampleProject?.creatorDepartment,
          designation: profile?.designation,
          totalLikes: stats.totalLikes,
          approvedProjectsCount: stats.approvedProjectsCount,
          projectsWithLikesCount: stats.projectsWithLikesCount,
          rank: 1, // calculated after sorting
        });
      });

      // 3. Deterministic Sorting
      // Primary: totalLikes descending
      // Tie-breaker 1: projectsWithLikesCount descending
      // Tie-breaker 2: approvedProjectsCount descending
      // Tie-breaker 3: stable userId ascending
      candidates.sort((a, b) => {
        if (b.totalLikes !== a.totalLikes) {
          return b.totalLikes - a.totalLikes;
        }
        if (b.projectsWithLikesCount !== a.projectsWithLikesCount) {
          return b.projectsWithLikesCount - a.projectsWithLikesCount;
        }
        if (b.approvedProjectsCount !== a.approvedProjectsCount) {
          return b.approvedProjectsCount - a.approvedProjectsCount;
        }
        return a.userId.localeCompare(b.userId);
      });

      // Assign official ranks (1-indexed)
      candidates.forEach((cand, idx) => {
        cand.rank = idx + 1;
      });

      return candidates.slice(0, limitCount);
    } catch (err) {
      console.warn('[leaderboardService] Error computing top users:', err);
      return [];
    }
  },
};
