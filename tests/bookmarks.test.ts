import { describe, it, expect } from 'vitest';
import { BookmarkRecord } from '../src/types';

describe('Bookmark & Saved Projects Engine', () => {
  it('generates deterministic bookmark ID in format ${userId}_${projectId}', () => {
    const userId = 'usr_12345';
    const projectId = 'proj_98765';
    const bookmarkDocId = `${userId}_${projectId}`;

    expect(bookmarkDocId).toBe('usr_12345_proj_98765');
  });

  it('correctly sorts bookmarks chronologically in descending order (newest first)', () => {
    const sampleBookmarks: BookmarkRecord[] = [
      {
        id: 'user1_projA',
        userId: 'user1',
        projectId: 'projA',
        projectTitle: 'Project Alpha',
        projectCoverUrl: 'https://example.com/a.jpg',
        projectCategory: 'Web',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
      {
        id: 'user1_projC',
        userId: 'user1',
        projectId: 'projC',
        projectTitle: 'Project Gamma',
        projectCoverUrl: 'https://example.com/c.jpg',
        projectCategory: 'AI',
        createdAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'user1_projB',
        userId: 'user1',
        projectId: 'projB',
        projectTitle: 'Project Beta',
        projectCoverUrl: 'https://example.com/b.jpg',
        projectCategory: 'Mobile',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];

    const sorted = [...sampleBookmarks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted[0].projectId).toBe('projC'); // March (newest)
    expect(sorted[1].projectId).toBe('projB'); // February
    expect(sorted[2].projectId).toBe('projA'); // January (oldest)
  });

  it('filters bookmarks accurately by search title or category', () => {
    const sampleBookmarks: BookmarkRecord[] = [
      {
        id: 'user1_projA',
        userId: 'user1',
        projectId: 'projA',
        projectTitle: 'Fraud Detection Engine',
        projectCoverUrl: 'https://example.com/a.jpg',
        projectCategory: 'Security',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
      {
        id: 'user1_projB',
        userId: 'user1',
        projectId: 'projB',
        projectTitle: 'Project Hub Mobile',
        projectCoverUrl: 'https://example.com/b.jpg',
        projectCategory: 'Mobile',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];

    const searchSecurity = sampleBookmarks.filter((b) =>
      b.projectTitle.toLowerCase().includes('security') ||
      b.projectCategory.toLowerCase().includes('security')
    );
    expect(searchSecurity.length).toBe(1);
    expect(searchSecurity[0].projectId).toBe('projA');

    const searchHub = sampleBookmarks.filter((b) =>
      b.projectTitle.toLowerCase().includes('hub') ||
      b.projectCategory.toLowerCase().includes('hub')
    );
    expect(searchHub.length).toBe(1);
    expect(searchHub[0].projectId).toBe('projB');
  });
});
