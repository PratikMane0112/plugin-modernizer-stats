import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useMetadata } from '../hooks/useMetadata';
import type { PluginReport } from '../types';

type FilterType = 'all' | 'has-failures' | 'fully-modernized' | 'has-open-prs' | 'pending';
type SortField = 'name' | 'totalMigrations' | 'successRate' | 'failCount' | 'openPRs' | 'mergedPRs' | 'latestMigration';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

export const PluginList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [page, setPage] = useState(0);
    const { data, loading, error } = useMetadata();

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir(field === 'name' ? 'asc' : 'desc');
        }
        setPage(0);
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return <ChevronDown size={14} className="text-slate-600" />;
        return sortDir === 'asc'
            ? <ChevronUp size={14} className="text-blue-400" />
            : <ChevronDown size={14} className="text-blue-400" />;
    };

    const sortedAndFiltered = useMemo(() => {
        if (!data) return [];

        const filtered = data.plugins.filter((plugin: PluginReport) => {
            const matchesSearch = plugin.pluginName.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesFilter = true;
            switch (filter) {
                case 'has-failures': matchesFilter = plugin.failCount > 0; break;
                case 'fully-modernized': matchesFilter = plugin.failCount === 0 && plugin.totalMigrations > 0; break;
                case 'has-open-prs': matchesFilter = plugin.openPRs > 0; break;
                case 'pending': matchesFilter = plugin.totalMigrations > plugin.successCount + plugin.failCount; break;
            }
            return matchesSearch && matchesFilter;
        });

        const sorted = [...filtered].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'name': return dir * a.pluginName.localeCompare(b.pluginName);
                case 'totalMigrations': return dir * (a.totalMigrations - b.totalMigrations);
                case 'successRate': return dir * (a.successRate - b.successRate);
                case 'failCount': return dir * (a.failCount - b.failCount);
                case 'openPRs': return dir * (a.openPRs - b.openPRs);
                case 'mergedPRs': return dir * (a.mergedPRs - b.mergedPRs);
                case 'latestMigration': {
                    const aTs = a.latestMigration || '';
                    const bTs = b.latestMigration || '';
                    return dir * aTs.localeCompare(bTs);
                }
                default: return 0;
            }
        });

        return sorted;
    }, [data, searchTerm, filter, sortField, sortDir]);

    const totalPages = Math.ceil(sortedAndFiltered.length / PAGE_SIZE);
    const paged = sortedAndFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-slate-400">{sortedAndFiltered.length} plugins</span>
                    <select
                        className="px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#15171a] text-slate-200"
                        value={filter}
                        onChange={(e) => { setFilter(e.target.value as FilterType); setPage(0); }}
                    >
                        <option value="all">All Plugins</option>
                        <option value="has-failures">Has Failures</option>
                        <option value="fully-modernized">Fully Modernized</option>
                        <option value="has-open-prs">Has Open PRs</option>
                        <option value="pending">Has Pending</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#15171a] border-b border-slate-800 text-slate-400 text-sm font-medium">
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('name')}>
                                    <span className="flex items-center gap-1">Plugin Name {renderSortIcon('name')}</span>
                                </th>
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('totalMigrations')}>
                                    <span className="flex items-center gap-1">Migrations {renderSortIcon('totalMigrations')}</span>
                                </th>
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('successRate')}>
                                    <span className="flex items-center gap-1">Success Rate {renderSortIcon('successRate')}</span>
                                </th>
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('failCount')}>
                                    <span className="flex items-center gap-1">Failures {renderSortIcon('failCount')}</span>
                                </th>
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('openPRs')}>
                                    <span className="flex items-center gap-1">Open PRs {renderSortIcon('openPRs')}</span>
                                </th>
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('mergedPRs')}>
                                    <span className="flex items-center gap-1">Merged PRs {renderSortIcon('mergedPRs')}</span>
                                </th>
                                <th className="px-6 py-4 cursor-pointer select-none hover:text-slate-200" onClick={() => toggleSort('latestMigration')}>
                                    <span className="flex items-center gap-1">Latest {renderSortIcon('latestMigration')}</span>
                                </th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {paged.map((plugin) => {
                                const rate = plugin.successRate.toFixed(0);
                                return (
                                    <tr key={plugin.pluginName} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{plugin.pluginName}</td>
                                        <td className="px-6 py-4 text-slate-400">{plugin.totalMigrations}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${rate === '100' ? 'bg-green-500' : Number(rate) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-400">{rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {plugin.failCount > 0 ? (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                                                    {plugin.failCount}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {plugin.openPRs > 0 ? (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                                                    {plugin.openPRs}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {plugin.mergedPRs > 0 ? (
                                                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
                                                    {plugin.mergedPRs}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {plugin.latestMigration
                                                ? new Date(plugin.latestMigration.replace(/T.*/, '')).toLocaleDateString()
                                                : <span className="text-slate-600">-</span>
                                            }
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

                {paged.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No plugins found matching your criteria.
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 bg-[#15171a] border-t border-slate-800">
                        <span className="text-sm text-slate-500">
                            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedAndFiltered.length)} of {sortedAndFiltered.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 text-sm rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-3 py-1 text-sm rounded border ${page === i ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-3 py-1 text-sm rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
