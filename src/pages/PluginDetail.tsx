
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, GitBranch, Loader2 } from 'lucide-react';
import { usePluginData } from '../hooks/useMetadata';

export const PluginDetail = () => {
    const { name } = useParams<{ name: string }>();
    const { plugin, loading, error } = usePluginData(name || '');

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

    const successCount = plugin.migrations.filter((m) => m.migrationStatus === 'success').length;
    const failCount = plugin.migrations.length - successCount;

    return (
        <div className="space-y-6">
            <Link to="/plugins" className="inline-flex items-center text-slate-400 hover:text-slate-200">
                <ArrowLeft size={16} className="mr-1" /> Back to Plugins
            </Link>

            <div className="bg-[#1e2329] p-8 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{plugin.pluginName}</h1>
                        <a
                            href={plugin.pluginRepository}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-400 hover:underline"
                        >
                            View Repository <ExternalLink size={14} className="ml-1" />
                        </a>
                    </div>
                    <div className="flex gap-4 text-center">
                        <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                            <span className="block text-2xl font-bold text-green-500">{successCount}</span>
                            <span className="text-xs text-green-400 font-medium">Successful</span>
                        </div>
                        <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                            <span className="block text-2xl font-bold text-red-500">{failCount}</span>
                            <span className="text-xs text-red-400 font-medium">Failed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-[#15171a]">
                    <h2 className="font-bold text-slate-200">Migration History</h2>
                </div>
                <div className="divide-y divide-slate-800">
                    {plugin.migrations.map((migration) => (
                        <div key={migration.key} className="p-6 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 flex-1">
                                    {migration.migrationStatus === 'success' ? (
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                    ) : (
                                        <XCircle className="text-red-500 flex-shrink-0" size={20} />
                                    )}
                                    <h3 className="font-semibold text-slate-200">{migration.migrationName}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {migration.pullRequestStatus && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${migration.pullRequestStatus === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            migration.pullRequestStatus === 'merged' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            PR {migration.pullRequestStatus}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-500 font-mono">{new Date(migration.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {migration.migrationDescription && (
                                <p className="text-slate-400 text-sm mb-3">{migration.migrationDescription}</p>
                            )}

                            {/* Tags */}
                            {migration.tags && migration.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {migration.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Check Runs Status */}
                            {migration.checkRunsSummary && (
                                <div className="mb-3 p-3 bg-[#15171a] rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-300">Check Runs Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${migration.checkRunsSummary === 'success'
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {migration.checkRunsSummary}
                                        </span>
                                    </div>
                                    {migration.checkRuns && (
                                        <div className="grid grid-cols-1 gap-1">
                                            {(Object.entries(migration.checkRuns) as [string, string][]).map(([name, status]) => (
                                                <div key={name} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-400">{name}</span>
                                                    <span className={status === 'success' ? 'text-green-400' : 'text-red-400'}>
                                                        {status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm">
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
                                    <div className="flex items-center gap-2 text-xs">
                                        {migration.additions !== undefined && (
                                            <span className="text-green-400">+{migration.additions}</span>
                                        )}
                                        {migration.deletions !== undefined && (
                                            <span className="text-red-400">-{migration.deletions}</span>
                                        )}
                                        {migration.changedFiles !== undefined && (
                                            <span className="text-slate-500">{migration.changedFiles} files</span>
                                        )}
                                    </div>
                                )}

                                {/* Baselines */}
                                {migration.effectiveBaseline && (
                                    <span className="text-slate-500 text-xs">
                                        Baseline: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-slate-300">{migration.effectiveBaseline}</span>
                                    </span>
                                )}

                                {migration.jenkinsVersion && (
                                    <span className="text-slate-500 text-xs">
                                        Jenkins: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-slate-300">{migration.jenkinsVersion}</span>
                                    </span>
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
