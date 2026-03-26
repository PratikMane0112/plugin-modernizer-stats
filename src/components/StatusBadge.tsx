import type { Migration } from '../types';

export type PluginStatus = 'success' | 'partial' | 'failed' | 'pending';

export function deriveStatus(migrations: Migration[]): PluginStatus {
    if (migrations.length === 0) return 'pending';
    const hasFailure = migrations.some(
        m => m.migrationStatus === 'failure' || m.migrationStatus === 'fail'
    );
    const hasSuccess = migrations.some(m => m.migrationStatus === 'success');
    if (hasFailure && hasSuccess) return 'partial';
    if (hasFailure) return 'failed';
    if (hasSuccess) return 'success';
    return 'pending';
}

const STATUS_CONFIG: Record<PluginStatus, { label: string; bg: string; color: string; border: string }> = {
    success: {
        label: '✓ Modernized',
        bg: 'rgba(34,197,94,0.1)',
        color: '#4ade80',
        border: 'rgba(34,197,94,0.2)',
    },
    partial: {
        label: '⚠ Partial',
        bg: 'rgba(234,179,8,0.1)',
        color: '#fbbf24',
        border: 'rgba(234,179,8,0.2)',
    },
    failed: {
        label: '✗ Failed',
        bg: 'rgba(239,68,68,0.1)',
        color: '#f87171',
        border: 'rgba(239,68,68,0.2)',
    },
    pending: {
        label: '○ Pending',
        bg: 'rgba(100,116,139,0.1)',
        color: '#94a3b8',
        border: 'rgba(100,116,139,0.2)',
    },
};

export function StatusBadge({ status }: { status: PluginStatus }) {
    const { label, bg, color, border } = STATUS_CONFIG[status];
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
            {label}
        </span>
    );
}
