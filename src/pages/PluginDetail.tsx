import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    ArrowLeft, ExternalLink, CheckCircle, XCircle, GitBranch,
    Loader2, Clock, GitCommit, AlertTriangle
} from 'lucide-react';
import { usePluginData } from '../hooks/useMetadata';

export const PluginDetail = () => {
    const { name } = useParams<{ name: string }>();
    const { plugin, loading, error } = usePluginData(name || '');

    const timelineOption = useMemo(() => {
        if (!plugin?.migrations || plugin.migrations.length === 0) return null;

        // Group by month
        const monthMap = new Map<string, { success: number; fail: number }>();
        for (const m of plugin.migrations) {
            const date = m.timestamp?.split('T')[0] || '';
            const month = date.substring(0, 7); // "YYYY-MM"
            if (!month) continue;
            const entry = monthMap.get(month) || { success: 0, fail: 0 };
            if (m.migrationStatus === 'success') entry.success++;
            else entry.fail++;
            monthMap.set(month, entry);
        }

        if (monthMap.size < 2) return null;

        const months = [...monthMap.keys()].sort();
        return {
            tooltip: { trigger: 'axis' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: { type: 'category' as const, data: months, axisLabel: { color: '#94a3b8', rotate: 45 } },
            yAxis: { type: 'value' as const, axisLabel: { color: '#94a3b8' } },
            series: [
                { name: 'Success', type: 'bar' as const, stack: 'total', data: months.map(m => monthMap.get(m)?.success || 0), itemStyle: { color: '#4ade80' } },
                { name: 'Failed', type: 'bar' as const, stack: 'total', data: months.map(m => monthMap.get(m)?.fail || 0), itemStyle: { color: '#f87171' } },
            ]
        };
    }, [plugin]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !plugin) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-200">Plugin Not Found</h2>
                {error && <p className="text-red-400 mt-2">{error.message}</p>}
                <Link to="/plugins" className="text-blue-400 hover:underline mt-4 inline-block">Back to Plugins</Link>
            </div>
        );
    }

    const successCount = plugin.migrations.filter(m => m.migrationStatus === 'success').length;
    const failCount = plugin.migrations.filter(m => m.migrationStatus === 'fail' || m.migrationStatus === 'failure').length;
    const pendingCount = plugin.totalMigrations - successCount - failCount;

    return (
        <div className="space-y-6">
            <Link to="/plugins" className="inline-flex items-center text-slate-400 hover:text-slate-200">
                <ArrowLeft size={16} className="mr-1" /> Back to Plugins
            </Link>

            {/* Plugin Header */}
            <div className="bg-[#1e2329] p-8 rounded-xl border border-slate-800">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{plugin.pluginName}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {plugin.pluginRepository && (
                                <a
                                    href={plugin.pluginRepository}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-400 hover:underline"
                                >
                                    View Repository <ExternalLink size={14} className="ml-1" />
                                </a>
                            )}
                            {plugin.migrations[0]?.defaultBranch && (
                                <span className="text-slate-500 flex items-center gap-1">
                                    <GitBranch size={14} />
                                    {plugin.migrations[0].defaultBranch}
                                </span>
                            )}
                            {plugin.migrations[0]?.pluginVersion && (
                                <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded font-mono">
                                    v{plugin.migrations[0].pluginVersion}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 text-center">
                        <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                            <span className="block text-2xl font-bold text-green-500">{successCount}</span>
                            <span className="text-xs text-green-400 font-medium">Success</span>
                        </div>
                        <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                            <span className="block text-2xl font-bold text-red-500">{failCount}</span>
                            <span className="text-xs text-red-400 font-medium">Failed</span>
                        </div>
                        {pendingCount > 0 && (
                            <div className="bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                                <span className="block text-2xl font-bold text-amber-500">{pendingCount}</span>
                                <span className="text-xs text-amber-400 font-medium">Pending</span>
                            </div>
                        )}
                        <div className="bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
                            <span className="block text-2xl font-bold text-blue-500">{plugin.successRate.toFixed(0)}%</span>
                            <span className="text-xs text-blue-400 font-medium">Rate</span>
                        </div>
                    </div>
                </div>

                {/* PR summary bar */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-800 pt-4">
                    <span>Open PRs: <span className="text-green-400 font-bold">{plugin.openPRs}</span></span>
                    <span>Merged PRs: <span className="text-purple-400 font-bold">{plugin.mergedPRs}</span></span>
                    <span>Closed PRs: <span className="text-red-400 font-bold">{plugin.closedPRs}</span></span>
                    {plugin.latestMigration && (
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Latest: <span className="text-white">{plugin.latestMigration.split('T')[0]}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Per-plugin Timeline Chart */}
            {timelineOption && (
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Migration Timeline</h3>
                    <ReactECharts option={timelineOption} style={{ height: '250px' }} theme="dark" />
                </div>
            )}

            {/* Migration History */}
            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-[#15171a] flex items-center justify-between">
                    <h2 className="font-bold text-slate-200">Migration History ({plugin.migrations.length})</h2>
                </div>
                <div className="divide-y divide-slate-800">
                    {plugin.migrations.map((migration) => (
                        <div key={migration.key} className="p-6 hover:bg-white/5 transition-colors">
                            {/* Header row */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 flex-1">
                                    {migration.migrationStatus === 'success' ? (
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                    ) : migration.migrationStatus === 'fail' || migration.migrationStatus === 'failure' ? (
                                        <XCircle className="text-red-500 flex-shrink-0" size={20} />
                                    ) : (
                                        <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-slate-200">{migration.migrationName}</h3>
                                        <Link
                                            to={`/recipes/${encodeURIComponent(migration.migrationId)}`}
                                            className="text-xs text-blue-400 hover:underline font-mono"
                                        >
                                            {migration.migrationId}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {migration.pullRequestStatus && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${migration.pullRequestStatus === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                migration.pullRequestStatus === 'merged' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            PR {migration.pullRequestStatus}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                        <Clock size={12} />
                                        {migration.timestamp?.split('T')[0] || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {migration.migrationDescription && (
                                <p className="text-slate-400 text-sm mb-3 ml-7">{migration.migrationDescription}</p>
                            )}

                            {/* Tags */}
                            {migration.tags && migration.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3 ml-7">
                                    {migration.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Baselines & Version Info */}
                            <div className="flex flex-wrap gap-3 mb-3 ml-7 text-xs">
                                {migration.pluginVersion && (
                                    <span className="text-slate-500">
                                        Plugin: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-slate-300">v{migration.pluginVersion}</span>
                                    </span>
                                )}
                                {migration.jenkinsBaseline && (
                                    <span className="text-slate-500">
                                        Jenkins BL: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-slate-300">{migration.jenkinsBaseline}</span>
                                    </span>
                                )}
                                {migration.targetBaseline && (
                                    <span className="text-slate-500">
                                        Target BL: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-amber-300">{migration.targetBaseline}</span>
                                    </span>
                                )}
                                {migration.effectiveBaseline && (
                                    <span className="text-slate-500">
                                        Effective BL: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-green-300">{migration.effectiveBaseline}</span>
                                    </span>
                                )}
                                {migration.jenkinsVersion && (
                                    <span className="text-slate-500">
                                        Jenkins: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-slate-300">{migration.jenkinsVersion}</span>
                                    </span>
                                )}
                                {migration.defaultBranch && (
                                    <span className="text-slate-500 flex items-center gap-1">
                                        <GitBranch size={12} /> {migration.defaultBranch}
                                    </span>
                                )}
                                {migration.defaultBranchLatestCommitSha && (
                                    <span className="text-slate-500 flex items-center gap-1">
                                        <GitCommit size={12} />
                                        <span className="font-mono text-slate-300">{migration.defaultBranchLatestCommitSha.substring(0, 7)}</span>
                                    </span>
                                )}
                            </div>

                            {/* Check Runs Status */}
                            {migration.checkRunsSummary && (
                                <div className="mb-3 ml-7 p-3 bg-[#15171a] rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-300">CI Check Runs</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${migration.checkRunsSummary === 'success' ? 'bg-green-500/10 text-green-400' :
                                                migration.checkRunsSummary === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-red-500/10 text-red-400'
                                            }`}>
                                            {migration.checkRunsSummary}
                                        </span>
                                    </div>
                                    {migration.checkRuns && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                            {(Object.entries(migration.checkRuns) as [string, string | null][]).map(([checkName, status]) => (
                                                <div key={checkName} className="flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-white/5">
                                                    <span className="text-slate-400 truncate mr-2">{checkName}</span>
                                                    <span className={
                                                        status === 'success' ? 'text-green-400' :
                                                            status === 'failure' ? 'text-red-400' :
                                                                status === null ? 'text-slate-600' :
                                                                    'text-amber-400'
                                                    }>
                                                        {status === null ? 'pending' : status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action row: PR link, code changes, flags */}
                            <div className="flex flex-wrap items-center gap-4 text-sm ml-7">
                                {migration.pullRequestUrl ? (
                                    <a
                                        href={migration.pullRequestUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20"
                                    >
                                        <GitBranch size={14} className="mr-1" />
                                        View PR
                                    </a>
                                ) : (
                                    <span className="text-slate-600 italic">No PR created</span>
                                )}

                                {/* Code Changes */}
                                {(migration.additions !== undefined || migration.deletions !== undefined) && (
                                    <div className="flex items-center gap-2 text-xs bg-[#15171a] px-2 py-1 rounded border border-slate-700">
                                        {migration.additions !== undefined && migration.additions > 0 && (
                                            <span className="text-green-400">+{migration.additions}</span>
                                        )}
                                        {migration.deletions !== undefined && migration.deletions > 0 && (
                                            <span className="text-red-400">-{migration.deletions}</span>
                                        )}
                                        {migration.changedFiles !== undefined && migration.changedFiles > 0 && (
                                            <span className="text-slate-500">{migration.changedFiles} files</span>
                                        )}
                                    </div>
                                )}

                                {migration.dryRun && (
                                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">
                                        Dry Run
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
