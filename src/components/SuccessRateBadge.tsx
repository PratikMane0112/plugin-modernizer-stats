export type RateTier = 'high' | 'medium' | 'low' | 'none';

export function getRateTier(rate: number): RateTier {
    if (rate >= 80) return 'high';
    if (rate >= 50) return 'medium';
    if (rate > 0) return 'low';
    return 'none';
}

const TIER_CONFIG: Record<RateTier, { label: string; className: string }> = {
    high: {
        label: '● High',
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    medium: {
        label: '◑ Medium',
        className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    low: {
        label: '○ Low',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    none: {
        label: '— No data',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
};

export function SuccessRateBadge({ rate }: { rate: number }) {
    const tier = getRateTier(rate);
    const { label, className } = TIER_CONFIG[tier];
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
        >
            {label} ({rate.toFixed(1)}%)
        </span>
    );
}
