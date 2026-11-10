import { describe, it, expect, vi } from 'vitest';
import { getUserDisplayName, getUserInitials, resolveUserAvatarUrl } from '../src/utils/userDisplay';
import { leaderboardService } from '../src/services/leaderboardService';
import { projectRepository } from '../src/repositories/projectRepository';
import { userRepository } from '../src/repositories/userRepository';
import { Project, UserProfile } from '../src/types';

describe('User Display & Avatar Priority Logic', () => {
  describe('getUserDisplayName', () => {
    it('Priority 1: Uses user-edited displayName when provided', () => {
      const name = getUserDisplayName({
        displayName: 'Hawk Master',
        fullName: 'Johnathan Doe',
        email: 'johnathan.doe@company.com',
      });
      expect(name).toBe('Hawk Master');
    });

    it('Priority 2: Uses collected fullName when displayName is absent', () => {
      const name = getUserDisplayName({
        fullName: 'Jane Smith',
        email: 'jane.smith@company.com',
      });
      expect(name).toBe('Jane Smith');
    });

    it('Priority 3: Uses email local-part (max 6 chars + ellipsis) when no name exists', () => {
      const name = getUserDisplayName({
        email: 'ammarshaikh@gmail.com',
      });
      expect(name).toBe('ammars...');
    });

    it('Priority 3: Uses short email local-part without ellipsis if <= 6 chars', () => {
      const name = getUserDisplayName({
        email: 'alex@company.com',
      });
      expect(name).toBe('alex');
    });

    it('Never returns null, undefined, or empty string', () => {
      expect(getUserDisplayName(null)).toBe('Team Member');
      expect(getUserDisplayName(undefined)).toBe('Team Member');
      expect(getUserDisplayName({})).toBe('Team Member');
    });
  });

  describe('getUserInitials', () => {
    it('generates two-letter uppercase initials for two-word names', () => {
      expect(getUserInitials('Ammar Shaikh')).toBe('AS');
      expect(getUserInitials('Jane Doe')).toBe('JD');
    });

    it('generates two letters from single word or handles fallback', () => {
      expect(getUserInitials('Innovator')).toBe('IN');
      expect(getUserInitials('')).toBe('PH');
      expect(getUserInitials(undefined)).toBe('PH');
    });
  });

  describe('resolveUserAvatarUrl', () => {
    it('Priority 1: Prefers custom uploaded profile photo', () => {
      const avatar = resolveUserAvatarUrl({
        customAvatarUrl: 'https://images.unsplash.com/custom-photo.jpg',
        avatarUrl: 'https://google.com/google-photo.jpg',
        googlePhotoUrl: 'https://google.com/google-photo.jpg',
      });
      expect(avatar).toBe('https://images.unsplash.com/custom-photo.jpg');
    });

    it('Priority 2: Uses existing Google photo when custom is absent', () => {
      const avatar = resolveUserAvatarUrl({
        avatarUrl: 'https://lh3.googleusercontent.com/google-user.jpg',
        googlePhotoUrl: 'https://lh3.googleusercontent.com/google-user.jpg',
      });
      expect(avatar).toBe('https://lh3.googleusercontent.com/google-user.jpg');
    });

    it('Priority 3: Returns undefined when no image exists (triggering branded initials fallback)', () => {
      const avatar = resolveUserAvatarUrl({
        fullName: 'Alex Walker',
      });
      expect(avatar).toBeUndefined();
    });
  });
});

describe('Leaderboard Ranking Service', () => {
  it('correctly aggregates likes only on approved projects and sorts users descending', async () => {
    const mockProjects: Partial<Project>[] = [
      {
        id: 'p1',
        title: 'Project Alpha',
        creatorId: 'user_1',
        creatorName: 'User One',
        likeCount: 15,
        approvalStatus: 'APPROVED',
      },
      {
        id: 'p2',
        title: 'Project Beta',
        creatorId: 'user_1',
        creatorName: 'User One',
        likeCount: 10,
        approvalStatus: 'APPROVED',
      },
      {
        id: 'p3',
        title: 'Project Gamma',
        creatorId: 'user_2',
        creatorName: 'User Two',
        likeCount: 40,
        approvalStatus: 'APPROVED',
      },
      {
        id: 'p4',
        title: 'Project Delta',
        creatorId: 'user_3',
        creatorName: 'User Three',
        likeCount: 5,
        approvalStatus: 'APPROVED',
      },
      {
        id: 'p5',
        title: 'Project Epsilon',
        creatorId: 'user_4',
        creatorName: 'User Four',
        likeCount: 99,
        approvalStatus: 'REJECTED', // strictly excluded
      },
    ];

    const mockEmployees: Partial<UserProfile>[] = [
      { id: 'user_1', fullName: 'User One', email: 'user1@company.com', accountStatus: 'ACTIVE' },
      { id: 'user_2', fullName: 'User Two', email: 'user2@company.com', accountStatus: 'ACTIVE' },
      { id: 'user_3', fullName: 'User Three', email: 'user3@company.com', accountStatus: 'ACTIVE' },
      { id: 'user_4', fullName: 'User Four', email: 'user4@company.com', accountStatus: 'ACTIVE' },
    ];

    vi.spyOn(projectRepository, 'listApproved').mockResolvedValue(mockProjects as Project[]);
    vi.spyOn(userRepository, 'listEmployees').mockResolvedValue(mockEmployees as UserProfile[]);

    const topUsers = await leaderboardService.getTopUsers(3);

    expect(topUsers).toHaveLength(3);
    // Rank 1: User Two (40 likes)
    expect(topUsers[0].userId).toBe('user_2');
    expect(topUsers[0].totalLikes).toBe(40);
    expect(topUsers[0].rank).toBe(1);

    // Rank 2: User One (15 + 10 = 25 likes)
    expect(topUsers[1].userId).toBe('user_1');
    expect(topUsers[1].totalLikes).toBe(25);
    expect(topUsers[1].rank).toBe(2);

    // Rank 3: User Three (5 likes)
    expect(topUsers[2].userId).toBe('user_3');
    expect(topUsers[2].totalLikes).toBe(5);
    expect(topUsers[2].rank).toBe(3);
  });

  it('handles deterministic tie-breaking by projectsWithLikesCount and userId', async () => {
    const mockProjects: Partial<Project>[] = [
      {
        id: 'p_a1',
        title: 'A1',
        creatorId: 'user_alpha',
        creatorName: 'Alpha',
        likeCount: 10,
        approvalStatus: 'APPROVED',
      },
      {
        id: 'p_a2',
        title: 'A2',
        creatorId: 'user_alpha',
        creatorName: 'Alpha',
        likeCount: 10,
        approvalStatus: 'APPROVED',
      },
      {
        id: 'p_b1',
        title: 'B1',
        creatorId: 'user_beta',
        creatorName: 'Beta',
        likeCount: 20, // total 20 likes in 1 project vs Alpha's 20 likes in 2 projects
        approvalStatus: 'APPROVED',
      },
    ];

    const mockEmployees: Partial<UserProfile>[] = [
      { id: 'user_alpha', fullName: 'Alpha', email: 'alpha@company.com', accountStatus: 'ACTIVE' },
      { id: 'user_beta', fullName: 'Beta', email: 'beta@company.com', accountStatus: 'ACTIVE' },
    ];

    vi.spyOn(projectRepository, 'listApproved').mockResolvedValue(mockProjects as Project[]);
    vi.spyOn(userRepository, 'listEmployees').mockResolvedValue(mockEmployees as UserProfile[]);

    const topUsers = await leaderboardService.getTopUsers(2);

    expect(topUsers).toHaveLength(2);
    // Alpha has 2 projects with likes vs Beta's 1 project with likes
    expect(topUsers[0].userId).toBe('user_alpha');
    expect(topUsers[0].rank).toBe(1);
    expect(topUsers[1].userId).toBe('user_beta');
    expect(topUsers[1].rank).toBe(2);
  });

  it('handles zero eligible users gracefully by returning an empty array', async () => {
    vi.spyOn(projectRepository, 'listApproved').mockResolvedValue([]);
    vi.spyOn(userRepository, 'listEmployees').mockResolvedValue([]);

    const topUsers = await leaderboardService.getTopUsers(3);
    expect(topUsers).toEqual([]);
  });
});

