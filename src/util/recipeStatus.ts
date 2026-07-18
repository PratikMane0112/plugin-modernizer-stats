export type RateTier = 'high' | 'medium' | 'low' | 'none';

/**
 * Classify a recipe's success rate percentage into a tier.
 *
 *  - 'high'   : >= 80%  — recipe applies successfully to most plugins
 *  - 'medium' : 50–79%  — mixed results, needs investigation
 *  - 'low'    : > 0%    — recipe fails on the majority of plugins
 *  - 'none'   : 0%      — no successful applications recorded
 */
export function getRateTier(rate: number): RateTier {
  if (rate >= 80) return 'high';
  if (rate >= 50) return 'medium';
  if (rate > 0) return 'low';
  return 'none';
}
