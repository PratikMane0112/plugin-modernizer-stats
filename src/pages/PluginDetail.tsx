
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, GitBranch } from 'lucide-react';
import data from '../data/modernization-stats.json';
import type { AppData } from '../types';

const appData = data as AppData;

export const PluginDetail = () => {
    const { name } = useParams<{ name: string }>();
    const plugin = appData.plugins.find(p => p.pluginName === name);

    if (!plugin) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-200">Plugin Not Found</h2>
                <Link to="/plugins" className="text-blue-400 hover:underline mt-4 inline-block">Back to Plugins</Link>
            </div>
        );
    }

    const successCount = plugin.migrations.filter(m => m.migrationStatus === 'success').length;
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
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {migration.migrationStatus === 'success' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : (
                                        <XCircle className="text-red-500" size={20} />
                                    )}
                                    <h3 className="font-semibold text-slate-200">{migration.migrationName}</h3>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">{new Date(migration.timestamp).toLocaleDateString()}</span>
                            </div>

                            <p className="text-slate-400 mb-3 text-sm">{migration.migrationId}</p>

                            <div className="flex items-center gap-4 text-sm">
                                {migration.pullRequestUrl ? (
                                    <a
                                        href={migration.pullRequestUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20"
                                    >
                                        <GitBranch size={14} className="mr-1" />
                                        PR Link
                                    </a>
                                ) : (
                                    <span className="text-slate-600 italic">No PR created</span>
                                )}

                                <span className="text-slate-500">
                                    Target: <span className="font-mono bg-[#15171a] border border-slate-700 px-1 rounded text-slate-300">{migration.jenkinsVersion}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
