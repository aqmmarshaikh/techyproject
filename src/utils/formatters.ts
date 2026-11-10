/**
 * Safely computes Good & Needs Improvement percentages with consistent rounding.
 */
export function calculateVotePercentages(
  goodVotes: number,
  needsImprovementVotes: number
): {
  totalVotes: number;
  goodPercentage: number;
  needsImprovementPercentage: number;
} {
  const total = Math.max(0, goodVotes + needsImprovementVotes);
  if (total === 0) {
    return { totalVotes: 0, goodPercentage: 0, needsImprovementPercentage: 0 };
  }

  // Consistent 1-decimal rounding
  const rawGood = (goodVotes / total) * 100;
  const goodPct = Math.round(rawGood * 10) / 10;
  const needsImprovementPct = Math.round((100 - goodPct) * 10) / 10;

  return {
    totalVotes: total,
    goodPercentage: goodPct,
    needsImprovementPercentage: needsImprovementPct,
  };
}

/**
 * Formats an ISO date string or timestamp into a readable date.
 */
export function formatDate(dateStringOrTimestamp?: string | number | Date | null): string {
  if (!dateStringOrTimestamp) return 'N/A';
  try {
    const date = dateStringOrTimestamp instanceof Date ? dateStringOrTimestamp : new Date(dateStringOrTimestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'N/A';
  }
}

/**
 * Relative time description (e.g. "2 hours ago", "yesterday", "3 days ago")
 */
export function formatRelativeTime(dateStringOrTimestamp?: string | number | Date | null): string {
  if (!dateStringOrTimestamp) return 'Just now';
  try {
    const date = dateStringOrTimestamp instanceof Date ? dateStringOrTimestamp : new Date(dateStringOrTimestamp);
    if (isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDate(date);
  } catch {
    return 'Recently';
  }
}

/**
 * Formats large integers into compact notation (e.g., 1.2k, 25k).
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}
