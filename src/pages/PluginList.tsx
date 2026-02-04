import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { useMetadata } from '../hooks/useMetadata';

type FilterType = 'all' | 'has-failures' | 'fully-modernized';

export const PluginList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const { data, loading, error } = useMetadata();

    const filteredPlugins = useMemo(() => {
        if (!data) return [];

        return data.plugins.filter(plugin => {
            const matchesSearch = plugin.pluginName.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesFilter = true;
            const total = plugin.migrations ? plugin.migrations.length : 0;
            const failures = plugin.migrations ? plugin.migrations.filter(m => m.migrationStatus !== 'success').length : 0;

            if (filter === 'has-failures') {
                matchesFilter = failures > 0;
            } else if (filter === 'fully-modernized') {
                matchesFilter = failures === 0 && total > 0;
            }

            return matchesSearch && matchesFilter;
        });
    }, [data, searchTerm, filter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
                <p className="text-red-400 text-lg">Failed to load plugins. Please try refreshing the page.</p>
                {error && <p className="text-red-300 text-sm mt-2">{error.message}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e2329] p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search plugins..."
                        className="w-full pl-10 pr-4 py-2 bg-[#15171a] border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#15171a] text-slate-200"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                    >
                        <option value="all">All Plugins</option>
                        <option value="has-failures">Has Failures</option>
                        <option value="fully-modernized">Fully Modernized</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#15171a] border-b border-slate-800 text-slate-400 text-sm font-medium">
                                <th className="px-6 py-4">Plugin Name</th>
                                <th className="px-6 py-4">Total Migrations</th>
                                <th className="px-6 py-4">Success Rate</th>
                                <th className="px-6 py-4">Open PRs</th>
                                <th className="px-6 py-4">Latest Migration</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredPlugins.map((plugin) => {
                                const total = plugin.migrations ? plugin.migrations.length : 0;
                                const success = plugin.migrations ? plugin.migrations.filter((m) => m.migrationStatus === 'success').length : 0;
                                const rate = total > 0 ? ((success / total) * 100).toFixed(0) : '0';
                                const openPRs = plugin.migrations ? plugin.migrations.filter((m) => m.pullRequestStatus === 'open').length : 0;
                                const latestMigration = plugin.migrations && plugin.migrations.length > 0
                                    ? plugin.migrations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
                                    : null;

                                return (
                                    <tr key={plugin.pluginName} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{plugin.pluginName}</td>
                                        <td className="px-6 py-4 text-slate-400">{total}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${rate === '100' ? 'bg-green-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-400">{rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {openPRs > 0 ? (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                                                    {openPRs}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {latestMigration ? (
                                                <span>{new Date(latestMigration.timestamp).toLocaleDateString()}</span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/plugins/${plugin.pluginName}`}
                                                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                                            >
                                                Details <ChevronRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredPlugins.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No plugins found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};
