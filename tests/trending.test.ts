import { describe, it, expect } from 'vitest';
import { calculateTrendingScore } from '../src/utils/trending';

describe('Project Arena Trending Algorithm', () => {
  it('awards higher score to recent projects with high engagement vs older projects with identical stats', () => {
    const now = Date.now();
    const freshTimestamp = new Date(now - 1 * 24 * 3600 * 1000).toISOString(); // 1 day old
    const oldTimestamp = new Date(now - 14 * 24 * 3600 * 1000).toISOString(); // 14 days old

    const freshScore = calculateTrendingScore({
      likeCount: 20,
      totalValidVotes: 15,
      goodVoteCount: 12,
      approvedAtOrCreatedAt: freshTimestamp,
    });

    const oldScore = calculateTrendingScore({
      likeCount: 20,
      totalValidVotes: 15,
      goodVoteCount: 12,
      approvedAtOrCreatedAt: oldTimestamp,
    });

    expect(freshScore).toBeGreaterThan(oldScore);
  });

  it('weights peer votes more heavily than likes (3x for votes vs 2x for likes)', () => {
    const timestamp = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();

    const highVotesScore = calculateTrendingScore({
      likeCount: 0,
      totalValidVotes: 10,
      goodVoteCount: 5,
      approvedAtOrCreatedAt: timestamp,
    });

    const highLikesScore = calculateTrendingScore({
      likeCount: 10,
      totalValidVotes: 0,
      goodVoteCount: 0,
      approvedAtOrCreatedAt: timestamp,
    });

    // 10 votes (30 pts + 7.5 good pts = 37.5) > 10 likes (20 pts)
    expect(highVotesScore).toBeGreaterThan(highLikesScore);
  });
});

