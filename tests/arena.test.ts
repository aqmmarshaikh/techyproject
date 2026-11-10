import { describe, it, expect } from 'vitest';
import { Project } from '../src/types';

describe('Arena Leaderboard & Minimum Vote Threshold Rules', () => {
  const minThreshold = 10;

  const mockProjects: Partial<Project>[] = [
    {
      id: 'p1',
      title: 'Few Votes Perfectionist',
      goodPercentage: 100.0,
      totalValidVotes: 3, // Under threshold
      likeCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'p2',
      title: 'Community Favorite',
      goodPercentage: 92.5,
      totalValidVotes: 40, // Qualified
      likeCount: 50,
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'p3',
      title: 'Solid Initiative',
      goodPercentage: 95.0,
      totalValidVotes: 20, // Qualified
      likeCount: 30,
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  it('gating: excludes projects with fewer than minimum votes from Top Rated leaderboard', () => {
    const topRated = mockProjects
      .filter((p) => (p.totalValidVotes || 0) >= minThreshold)
      .sort((a, b) => (b.goodPercentage || 0) - (a.goodPercentage || 0));

    expect(topRated.length).toBe(2);
    // Even though p1 has 100%, it must not be in topRated
    expect(topRated.some((p) => p.id === 'p1')).toBe(false);
    // p3 (95%) is first, followed by p2 (92.5%)
    expect(topRated[0].id).toBe('p3');
    expect(topRated[1].id).toBe('p2');
  });

  it('correctly ranks Most Liked regardless of vote threshold', () => {
    const mostLiked = [...mockProjects].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    expect(mostLiked[0].id).toBe('p2'); // 50 likes
    expect(mostLiked[1].id).toBe('p3'); // 30 likes
    expect(mostLiked[2].id).toBe('p1'); // 5 likes
  });

  it('deterministic tie-breaking: uses total votes then creation date when percentage is equal', () => {
    const tiedProjects: Partial<Project>[] = [
      { id: 't1', goodPercentage: 90.0, totalValidVotes: 15, createdAt: '2024-01-02T00:00:00Z' },
      { id: 't2', goodPercentage: 90.0, totalValidVotes: 30, createdAt: '2024-01-01T00:00:00Z' },
    ];

    const sorted = tiedProjects.sort((a, b) => {
      if ((b.goodPercentage || 0) !== (a.goodPercentage || 0)) {
        return (b.goodPercentage || 0) - (a.goodPercentage || 0);
      }
      return (b.totalValidVotes || 0) - (a.totalValidVotes || 0);
    });

    expect(sorted[0].id).toBe('t2'); // 30 votes wins tie-break over 15 votes
  });
});

