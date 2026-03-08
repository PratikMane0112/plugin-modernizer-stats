import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIndex } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';

type SortField = 'name';
type SortDir = 'asc' | 'desc';

export const PluginList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipeFilter, setRecipeFilter] = useState('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const { index, loading, error } = useIndex();
    const parentRef = useRef<HTMLDivElement>(null);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return <ChevronDown size={14} className="text-slate-600" />;
        return sortDir === 'asc'
            ? <ChevronUp size={14} className="text-blue-400" />
            : <ChevronDown size={14} className="text-blue-400" />;
    };

    // All plugins from the index — lightweight, no per-plugin fetches
    const plugins = index?.plugins ?? [];
    const recipes = index?.recipes ?? [];

    const filtered = useMemo(() => {
        const q = searchTerm.toLowerCase();
        const list = plugins
            .filter(name => name.toLowerCase().includes(q));

        const sorted = [...list].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            return dir * a.localeCompare(b);
        });

        return sorted;
    }, [plugins, searchTerm, sortDir, sortField]);

    // Virtualizer — only render visible rows
    const virtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 56,
        overscan: 10,
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="space-y-6">
            {/* Header stats */}
            <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-medium">
                    {plugins.length} plugins
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 font-medium">
                    {recipes.length} recipes
                </span>
            </div>

            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e2329] p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search plugins..."
                        className="w-full pl-10 pr-4 py-2 bg-[#15171a] border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search plugins"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-slate-400">{filtered.length} results</span>
                    <select
                        className="px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#15171a] text-slate-200"
                        value={recipeFilter}
                        onChange={(e) => setRecipeFilter(e.target.value)}
                        aria-label="Filter by recipe"
                    >
                        <option value="all">All Recipes</option>
                        {recipes.map(r => {
                            const shortName = r.split('.').pop() ?? r;
                            return (
                                <option key={r} value={r}>{shortName}</option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {/* Virtualized Table */}
            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                {/* Table header */}
                <div className="bg-[#15171a] border-b border-slate-800 text-slate-400 text-sm font-medium">
                    <div className="flex items-center">
                        <div
                            className="flex-1 px-6 py-4 cursor-pointer select-none hover:text-slate-200"
                            onClick={() => toggleSort('name')}
                        >
                            <span className="flex items-center gap-1">
                                Plugin Name {renderSortIcon('name')}
                            </span>
                        </div>
                        <div className="w-24 px-6 py-4 text-right">
                            Actions
                        </div>
                    </div>
                </div>

                {/* Virtual scroll container */}
                <div
                    ref={parentRef}
                    style={{ height: '70vh', overflowY: 'auto' }}
                >
                    <div
                        style={{
                            height: virtualizer.getTotalSize(),
                            position: 'relative',
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const pluginName = filtered[virtualRow.index];
                            return (
                                <div
                                    key={pluginName}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        transform: `translateY(${virtualRow.start}px)`,
                                        width: '100%',
                                    }}
                                >
                                    <Link
                                        to={`/plugins/${pluginName}`}
                                        className="flex items-center hover:bg-white/5 transition-colors border-b border-slate-800/50"
                                    >
                                        <div className="flex-1 px-6 py-4">
                                            <span className="font-medium text-slate-200">
                                                {pluginName}
                                            </span>
                                        </div>
                                        <div className="w-24 px-6 py-4 text-right">
                                            <span className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                                                Details <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {filtered.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No plugins found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};
