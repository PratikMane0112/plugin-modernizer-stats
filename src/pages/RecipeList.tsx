import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMetadata } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';
import { SuccessRateBadge, getRateTier } from '../components/SuccessRateBadge';
import type { RecipeReport } from '../types';

type SortField = 'name' | 'totalApplications' | 'successCount' | 'failureCount' | 'successRate';
type SortDir = 'asc' | 'desc';
type RateFilter = 'all' | 'high' | 'medium' | 'low';

export const RecipeList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rateFilter, setRateFilter] = useState<RateFilter>('all');
    const [sortField, setSortField] = useState<SortField>('failureCount');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const { recipes, loading, error } = useMetadata();
    const parentRef = useRef<HTMLDivElement>(null);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir(field === 'name' ? 'asc' : 'desc');
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return <ChevronDown size={14} className="text-slate-600" />;
        return sortDir === 'asc'
            ? <ChevronUp size={14} className="text-blue-400" />
            : <ChevronDown size={14} className="text-blue-400" />;
    };

    const filtered = useMemo(() => {
        if (!recipes) return [];
        const q = searchTerm.toLowerCase();

        const list = recipes.filter((recipe: RecipeReport) => {
            const matchesSearch = recipe.recipeId.toLowerCase().includes(q);
            if (!matchesSearch) return false;

            if (rateFilter === 'all') return true;
            const tier = getRateTier(recipe.successRate);
            return tier === rateFilter;
        });

        const sorted = [...list].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'name': return dir * a.recipeId.localeCompare(b.recipeId);
                case 'totalApplications': return dir * (a.totalApplications - b.totalApplications);
                case 'successCount': return dir * (a.successCount - b.successCount);
                case 'failureCount': return dir * (a.failureCount - b.failureCount);
                case 'successRate': return dir * (a.successRate - b.successRate);
                default: return 0;
            }
        });

        return sorted;
    }, [recipes, searchTerm, rateFilter, sortField, sortDir]);

    const virtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 5,
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
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 font-medium">
                    {recipes?.length ?? 0} recipes
                </span>
            </div>

            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e2329] p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        className="w-full pl-10 pr-4 py-2 bg-[#15171a] border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search recipes"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-slate-400">{filtered.length} results</span>
                    <select
                        className="px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#15171a] text-slate-200"
                        value={rateFilter}
                        onChange={(e) => setRateFilter(e.target.value as RateFilter)}
                        aria-label="Filter by success rate"
                    >
                        <option value="all">All Rates</option>
                        <option value="high">● High (≥80%)</option>
                        <option value="medium">◑ Medium (50–79%)</option>
                        <option value="low">○ Low (&lt;50%)</option>
                    </select>
                </div>
            </div>

            {/* Virtualized Table */}
            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                {/* Table header */}
                <div className="bg-[#15171a] border-b border-slate-800 text-slate-400 text-sm font-medium">
                    <div className="flex items-center">
                        <div
                            className="flex-1 min-w-0 px-6 py-4 cursor-pointer select-none hover:text-slate-200"
                            onClick={() => toggleSort('name')}
                        >
                            <span className="flex items-center gap-1">
                                Recipe {renderSortIcon('name')}
                            </span>
                        </div>
                        <div
                            className="w-20 px-3 py-4 text-center cursor-pointer select-none hover:text-slate-200 hidden sm:block"
                            onClick={() => toggleSort('totalApplications')}
                        >
                            <span className="flex items-center justify-center gap-1">
                                Total {renderSortIcon('totalApplications')}
                            </span>
                        </div>
                        <div
                            className="w-20 px-3 py-4 text-center cursor-pointer select-none hover:text-slate-200 hidden sm:block"
                            onClick={() => toggleSort('successCount')}
                        >
                            <span className="flex items-center justify-center gap-1">
                                Success {renderSortIcon('successCount')}
                            </span>
                        </div>
                        <div
                            className="w-20 px-3 py-4 text-center cursor-pointer select-none hover:text-slate-200 hidden sm:block"
                            onClick={() => toggleSort('failureCount')}
                        >
                            <span className="flex items-center justify-center gap-1">
                                Failed {renderSortIcon('failureCount')}
                            </span>
                        </div>
                        <div
                            className="w-40 px-3 py-4 text-center cursor-pointer select-none hover:text-slate-200"
                            onClick={() => toggleSort('successRate')}
                        >
                            <span className="flex items-center justify-center gap-1">
                                Success Rate {renderSortIcon('successRate')}
                            </span>
                        </div>
                        <div className="w-20 px-3 py-4 text-right">
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
                            const recipe = filtered[virtualRow.index];
                            const shortName = recipe.recipeId.split('.').pop() || recipe.recipeId;
                            const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;

                            return (
                                <div
                                    key={recipe.recipeId}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        transform: `translateY(${virtualRow.start}px)`,
                                        width: '100%',
                                    }}
                                >
                                    <div className="flex items-center hover:bg-white/5 transition-colors border-b border-slate-800/50">
                                        <div className="flex-1 min-w-0 px-6 py-4">
                                            <Link
                                                to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                                className="font-medium text-slate-200 hover:text-blue-400 transition-colors"
                                            >
                                                {shortName}
                                            </Link>
                                            <p className="text-xs text-slate-600 font-mono truncate mt-0.5">{recipe.recipeId}</p>
                                            {/* Mobile-only inline stats */}
                                            <div className="flex gap-3 mt-1 text-xs sm:hidden">
                                                <span className="text-slate-400">Total: <span className="text-white font-bold">{recipe.totalApplications}</span></span>
                                                <span className="text-green-400">✓ {recipe.successCount}</span>
                                                <span className="text-red-400">✗ {recipe.failureCount}</span>
                                                {pendingCount > 0 && <span className="text-amber-400">⏳ {pendingCount}</span>}
                                            </div>
                                        </div>
                                        <div className="w-20 px-3 py-4 text-center text-slate-300 text-sm hidden sm:block">
                                            {recipe.totalApplications}
                                        </div>
                                        <div className="w-20 px-3 py-4 text-center hidden sm:block">
                                            {recipe.successCount > 0 ? (
                                                <span className="text-green-400 text-sm">{recipe.successCount}</span>
                                            ) : (
                                                <span className="text-slate-600 text-sm">0</span>
                                            )}
                                        </div>
                                        <div className="w-20 px-3 py-4 text-center hidden sm:block">
                                            {recipe.failureCount > 0 ? (
                                                <span className="text-red-400 text-sm">{recipe.failureCount}</span>
                                            ) : (
                                                <span className="text-slate-600 text-sm">0</span>
                                            )}
                                        </div>
                                        <div className="w-40 px-3 py-4 text-center">
                                            <SuccessRateBadge rate={recipe.successRate} />
                                        </div>
                                        <div className="w-20 px-3 py-4 text-right">
                                            <Link
                                                to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                                            >
                                                <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {filtered.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No recipes found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};
