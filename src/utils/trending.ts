/**
 * Calculates time-decayed trending score for the Project Arena.
 * 
 * Formula:
 * Score = ((likes * 2) + (totalValidVotes * 3) + (goodVotes * 1.5)) / ((ageInDays + 2) ^ 1.5)
 * 
 * Principles:
 * 1. Votes have slightly higher weight (3x) than likes (2x) as they require deliberate evaluation.
 * 2. Good votes provide an additional positive boost (1.5x).
 * 3. Time decay ((ageInDays + 2)^1.5) ensures newly approved active projects can compete with historic giants.
 */
export function calculateTrendingScore(params: {
  likeCount: number;
  totalValidVotes: number;
  goodVoteCount: number;
  approvedAtOrCreatedAt: string | number;
}): number {
  const { likeCount, totalValidVotes, goodVoteCount, approvedAtOrCreatedAt } = params;

  const now = Date.now();
  const createdMs = new Date(approvedAtOrCreatedAt).getTime() || now;
  const ageMs = Math.max(0, now - createdMs);
  const ageInDays = ageMs / (1000 * 60 * 60 * 24);

  const engagementPoints = (likeCount * 2) + (totalValidVotes * 3) + (goodVoteCount * 1.5);
  const timeFactor = Math.pow(ageInDays + 2, 1.5);

  const rawScore = engagementPoints / timeFactor;
  return Math.round(rawScore * 100) / 100;
}

