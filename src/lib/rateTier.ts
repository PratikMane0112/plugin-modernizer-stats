export type RateTier = 'high' | 'medium' | 'low' | 'none';

export function getRateTier(rate: number): RateTier {
    if (rate >= 80) return 'high';
    if (rate >= 50) return 'medium';
    if (rate > 0) return 'low';
    return 'none';
}
