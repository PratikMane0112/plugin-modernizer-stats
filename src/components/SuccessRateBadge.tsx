import type { RateTier } from '../lib/rateTier';
import { getRateTier } from '../lib/rateTier';

const TIER_CONFIG: Record<RateTier, { label: string; bg: string; color: string; border: string }> = {
    high: {
        label: '● High',
        bg: 'rgba(34,197,94,0.1)',
        color: '#4ade80',
        border: 'rgba(34,197,94,0.2)',
    },
    medium: {
        label: '◑ Medium',
        bg: 'rgba(234,179,8,0.1)',
        color: '#fbbf24',
        border: 'rgba(234,179,8,0.2)',
    },
    low: {
        label: '○ Low',
        bg: 'rgba(239,68,68,0.1)',
        color: '#f87171',
        border: 'rgba(239,68,68,0.2)',
    },
    none: {
        label: '— No data',
        bg: 'rgba(100,116,139,0.1)',
        color: '#94a3b8',
        border: 'rgba(100,116,139,0.2)',
    },
};

export function SuccessRateBadge({ rate }: { rate: number }) {
    const tier = getRateTier(rate);
    const { label, bg, color, border } = TIER_CONFIG[tier];
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: bg,
            color,
            border: `1px solid ${border}`,
        }}>
            {label} ({rate.toFixed(1)}%)
        </span>
    );
}
