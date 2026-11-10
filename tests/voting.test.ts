import { describe, it, expect } from 'vitest';
import { calculateVotePercentages } from '../src/utils/formatters';

describe('Voting Engine & Percentage Calculations', () => {
  it('correctly handles 0 total votes with zeroed percentages', () => {
    const res = calculateVotePercentages(0, 0);
    expect(res.totalVotes).toBe(0);
    expect(res.goodPercentage).toBe(0);
    expect(res.needsImprovementPercentage).toBe(0);
  });

  it('calculates exact 60% Good and 40% Needs Improvement on 100 votes (spec example)', () => {
    const res = calculateVotePercentages(60, 40);
    expect(res.totalVotes).toBe(100);
    expect(res.goodPercentage).toBe(60.0);
    expect(res.needsImprovementPercentage).toBe(40.0);
  });

  it('handles consistent 1-decimal rounding on odd fractions', () => {
    // 2 Good out of 3 total = 66.666...%
    const res = calculateVotePercentages(2, 1);
    expect(res.totalVotes).toBe(3);
    expect(res.goodPercentage).toBe(66.7);
    expect(res.needsImprovementPercentage).toBe(33.3);
    expect(res.goodPercentage + res.needsImprovementPercentage).toBe(100);
  });

  it('handles 100% Good votes correctly', () => {
    const res = calculateVotePercentages(15, 0);
    expect(res.totalVotes).toBe(15);
    expect(res.goodPercentage).toBe(100);
    expect(res.needsImprovementPercentage).toBe(0);
  });

  it('handles 100% Needs Improvement votes correctly', () => {
    const res = calculateVotePercentages(0, 10);
    expect(res.totalVotes).toBe(10);
    expect(res.goodPercentage).toBe(0);
    expect(res.needsImprovementPercentage).toBe(100);
  });
});

