import type { Migration, PluginStatus } from '../types';

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
