import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interactionService } from '../src/services/interactionService';
import { interactionRepository } from '../src/repositories/interactionRepository';
import { projectRepository } from '../src/repositories/projectRepository';
import { userRepository } from '../src/repositories/userRepository';
import { notificationRepository } from '../src/repositories/notificationRepository';
import { getUserDisplayName } from '../src/utils/userDisplay';
import { Project, UserProfile } from '../src/types';

describe('Project Like Notifications & Media Review System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Actor Name Resolution & Privacy for Notifications', () => {
    it('Priority 1: Uses custom displayName when available', () => {
      const user: Partial<UserProfile> = {
        displayName: 'Ammar Lead',
        fullName: 'Ammar Shaikh',
        email: 'ammar.shaikh@techyboy.com',
      };
      expect(getUserDisplayName(user)).toBe('Ammar Lead');
    });

    it('Priority 2: Uses collected fullName when displayName is unset', () => {
      const user: Partial<UserProfile> = {
        fullName: 'Jane Doe',
        email: 'jane.doe@techyboy.com',
      };
      expect(getUserDisplayName(user)).toBe('Jane Doe');
    });

    it('Priority 3: Uses email local prefix max 6 chars with ellipsis, NEVER full email', () => {
      const user: Partial<UserProfile> = {
        email: 'developer12345@company.com',
      };
      const name = getUserDisplayName(user);
      expect(name).toBe('develo...');
      expect(name).not.toContain('@company.com');
      expect(name).not.toContain('developer12345');
    });

    it('Priority 3: Uses full local part without ellipsis if <= 6 chars', () => {
      const user: Partial<UserProfile> = {
        email: 'rahul@company.com',
      };
      expect(getUserDisplayName(user)).toBe('rahul');
    });

    it('Falls back safely to "Team Member" when actor object is empty or null', () => {
      expect(getUserDisplayName(null)).toBe('Team Member');
      expect(getUserDisplayName(undefined)).toBe('Team Member');
      expect(getUserDisplayName({})).toBe('Team Member');
    });
  });

  describe('Real-Time Project Like Notification Dispatch', () => {
    const mockProject: Partial<Project> = {
      id: 'proj_100',
      title: 'Neural Engine CLI',
      creatorId: 'user_owner',
      likeCount: 4,
      totalValidVotes: 2,
      goodVoteCount: 2,
      createdAt: '2026-11-01T00:00:00Z',
    };

    const mockActor: Partial<UserProfile> = {
      id: 'user_liker',
      fullName: 'Ammar Shaikh',
      email: 'ammar@techyboy.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('dispatches PROJECT_LIKED notification with deterministic ID when user likes another user project', async () => {
      vi.spyOn(interactionRepository, 'toggleLike').mockResolvedValue({ isLiked: true, newCount: 5 });
      vi.spyOn(projectRepository, 'getById').mockResolvedValue(mockProject as Project);
      vi.spyOn(projectRepository, 'update').mockResolvedValue();
      vi.spyOn(userRepository, 'getById').mockImplementation(async (id: string) => {
        if (id === 'user_liker') return mockActor as UserProfile;
        if (id === 'user_owner') return { id: 'user_owner', totalLikesReceived: 10 } as UserProfile;
        return null;
      });
      vi.spyOn(userRepository, 'updateProfile').mockResolvedValue();

      const notifCreateSpy = vi.spyOn(notificationRepository, 'create').mockResolvedValue('notif_1');

      await interactionService.toggleLike('proj_100', 'user_liker');

      expect(notifCreateSpy).toHaveBeenCalled();
      const likeNotifCall = notifCreateSpy.mock.calls.find(call => call[0].type === 'PROJECT_LIKED');
      expect(likeNotifCall).toBeDefined();

      const payload = likeNotifCall![0];
      // Deterministic ID preventing duplicate spam
      expect(payload.id).toBe('notif_like_proj_100_user_liker');
      expect(payload.recipientId).toBe('user_owner');
      expect(payload.actorId).toBe('user_liker');
      expect(payload.actorName).toBe('Ammar Shaikh');
      expect(payload.actorAvatarUrl).toBe('https://example.com/avatar.jpg');
      expect(payload.projectId).toBe('proj_100');
      expect(payload.projectTitle).toBe('Neural Engine CLI');
      expect(payload.title).toBe('Ammar Shaikh liked your project');
      expect(payload.message).toBe('Ammar Shaikh liked your project "Neural Engine CLI".');
      expect(payload.targetUrl).toBe('/projects/proj_100');
      expect(payload.isRead).toBe(false);
    });

    it('does NOT dispatch PROJECT_LIKED notification when user unlikes a project', async () => {
      vi.spyOn(interactionRepository, 'toggleLike').mockResolvedValue({ isLiked: false, newCount: 4 });
      vi.spyOn(projectRepository, 'getById').mockResolvedValue(mockProject as Project);
      vi.spyOn(projectRepository, 'update').mockResolvedValue();
      vi.spyOn(userRepository, 'getById').mockResolvedValue({ id: 'user_owner', totalLikesReceived: 10 } as UserProfile);
      vi.spyOn(userRepository, 'updateProfile').mockResolvedValue();

      const notifCreateSpy = vi.spyOn(notificationRepository, 'create').mockResolvedValue('notif_1');

      await interactionService.toggleLike('proj_100', 'user_liker');

      const likeNotifCall = notifCreateSpy.mock.calls.find(call => call[0].type === 'PROJECT_LIKED');
      expect(likeNotifCall).toBeUndefined();
    });

    it('does NOT dispatch notification when a user likes their own project (self-like protection)', async () => {
      vi.spyOn(interactionRepository, 'toggleLike').mockResolvedValue({ isLiked: true, newCount: 5 });
      vi.spyOn(projectRepository, 'getById').mockResolvedValue(mockProject as Project);
      vi.spyOn(projectRepository, 'update').mockResolvedValue();
      vi.spyOn(userRepository, 'getById').mockResolvedValue({ id: 'user_owner', totalLikesReceived: 10 } as UserProfile);
      vi.spyOn(userRepository, 'updateProfile').mockResolvedValue();

      const notifCreateSpy = vi.spyOn(notificationRepository, 'create').mockResolvedValue('notif_1');

      // Owner likes own project
      await interactionService.toggleLike('proj_100', 'user_owner');

      const likeNotifCall = notifCreateSpy.mock.calls.find(call => call[0].type === 'PROJECT_LIKED');
      expect(likeNotifCall).toBeUndefined();
    });

    it('does not crash toggleLike when notification creation fails', async () => {
      vi.spyOn(interactionRepository, 'toggleLike').mockResolvedValue({ isLiked: true, newCount: 5 });
      vi.spyOn(projectRepository, 'getById').mockResolvedValue(mockProject as Project);
      vi.spyOn(projectRepository, 'update').mockResolvedValue();
      vi.spyOn(userRepository, 'getById').mockResolvedValue(mockActor as UserProfile);
      vi.spyOn(userRepository, 'updateProfile').mockResolvedValue();

      vi.spyOn(notificationRepository, 'create').mockRejectedValue(new Error('Network error'));

      const result = await interactionService.toggleLike('proj_100', 'user_liker');
      expect(result).toEqual({ isLiked: true, newCount: 5 });
    });
  });

  describe('Admin Media Gallery Item Assembly & Classification', () => {
    // Pure logic simulation of ProjectMediaGalleryModal media builder
    function buildMediaList(coverImageUrl?: string, screenshots: string[] = []) {
      const items: { id: string; url: string; type: 'COVER' | 'SCREENSHOT' | 'VIDEO'; label: string }[] = [];
      if (coverImageUrl && coverImageUrl.trim()) {
        items.push({
          id: 'cover',
          url: coverImageUrl.trim(),
          type: 'COVER',
          label: 'Main Cover Image',
        });
      }
      screenshots.forEach((shot, idx) => {
        if (shot && shot.trim()) {
          const isVideo = Boolean(
            shot.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ||
            shot.startsWith('data:video/')
          );
          items.push({
            id: `screenshot_${idx}`,
            url: shot.trim(),
            type: isVideo ? 'VIDEO' : 'SCREENSHOT',
            label: isVideo ? `Video Clip #${idx + 1}` : `Screenshot #${idx + 1}`,
          });
        }
      });
      return items;
    }

    it('assembles cover image with proper label and type', () => {
      const items = buildMediaList('https://example.com/cover.png', []);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        id: 'cover',
        url: 'https://example.com/cover.png',
        type: 'COVER',
        label: 'Main Cover Image',
      });
    });

    it('classifies screenshots and detects video URLs properly', () => {
      const screenshots = [
        'https://example.com/shot1.png',
        'https://example.com/demo.mp4',
        'data:video/webm;base64,AAAA',
        '   ', // empty whitespace should be ignored
      ];
      const items = buildMediaList('https://example.com/cover.png', screenshots);

      expect(items).toHaveLength(4); // 1 cover + 3 valid screenshots
      expect(items[0].type).toBe('COVER');
      expect(items[1].type).toBe('SCREENSHOT');
      expect(items[1].label).toBe('Screenshot #1');
      expect(items[2].type).toBe('VIDEO');
      expect(items[2].label).toBe('Video Clip #2');
      expect(items[3].type).toBe('VIDEO');
      expect(items[3].label).toBe('Video Clip #3');
    });

    it('handles projects with no cover or screenshots cleanly', () => {
      const items = buildMediaList('', []);
      expect(items).toEqual([]);
    });
  });
});

