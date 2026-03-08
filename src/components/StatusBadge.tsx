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

const STATUS_CONFIG: Record<PluginStatus, { label: string; className: string }> = {
    success: {
        label: '✓ Modernized',
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    partial: {
        label: '⚠ Partial',
        className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    failed: {
        label: '✗ Failed',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    pending: {
        label: '○ Pending',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
};

export function StatusBadge({ status }: { status: PluginStatus }) {
    const { label, className } = STATUS_CONFIG[status];
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
        >
            {label}
        </span>
    );
}
