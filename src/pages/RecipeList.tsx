import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useMetadata } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';
import type { RecipeReport } from '../types';

export const RecipeList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
    const { recipes, loading, error } = useMetadata();

    const filteredRecipes = useMemo(() => {
        if (!recipes) return [];
        return recipes.filter((recipe: RecipeReport) =>
            recipe.recipeId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recipes, searchTerm]);

    const toggleExpand = (recipeId: string) => {
        setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="space-y-6">
            {/* Search bar */}
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
                <span className="text-sm text-slate-400">{filteredRecipes.length} recipes</span>
            </div>

            {/* Recipe cards */}
            <div className="space-y-4">
                {filteredRecipes.map((recipe: RecipeReport) => {
                    const isExpanded = expandedRecipe === recipe.recipeId;
                    const shortName = recipe.recipeId.split('.').pop() || recipe.recipeId;
                    const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;

                    return (
                        <div key={recipe.recipeId} className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                            <div className="flex items-center">
                                <button
                                    onClick={() => toggleExpand(recipe.recipeId)}
                                    className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-semibold text-slate-200">{shortName}</h3>
                                        <span className="text-xs text-slate-500 font-mono hidden lg:inline">{recipe.recipeId}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-3 text-sm">
                                            <span className="text-slate-400">Total: <span className="text-white font-bold">{recipe.totalApplications}</span></span>
                                            <span className="text-green-400">✓ {recipe.successCount}</span>
                                            <span className="text-red-400">✗ {recipe.failureCount}</span>
                                            {pendingCount > 0 && <span className="text-amber-400">⏳ {pendingCount}</span>}
                                            <span className="text-slate-400">{recipe.successRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${recipe.successRate === 100 ? 'bg-green-500' : recipe.successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${recipe.successRate}%` }}
                                            />
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                    </div>
                                </button>
                                <Link
                                    to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                    className="px-4 py-4 text-blue-400 hover:text-blue-300 border-l border-slate-800 hover:bg-white/5 transition-colors"
                                    title="View full details"
                                >
                                    <ExternalLink size={16} />
                                </Link>
                            </div>

                            {isExpanded && recipe.plugins && recipe.plugins.length > 0 && (
                                <div className="border-t border-slate-800">
                                    <div className="px-6 py-3 bg-[#15171a] border-b border-slate-800">
                                        <div className="grid grid-cols-4 text-xs font-medium text-slate-400">
                                            <span>Plugin</span>
                                            <span>Status</span>
                                            <span>Timestamp</span>
                                            <span>Actions</span>
                                        </div>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {recipe.plugins.map((plugin, idx) => (
                                            <div key={`${plugin.pluginName}-${idx}`} className="px-6 py-2 grid grid-cols-4 text-sm border-b border-slate-800/50 hover:bg-white/5">
                                                <span className="text-slate-200">{plugin.pluginName}</span>
                                                <span className={
                                                    plugin.status === 'success' ? 'text-green-400' :
                                                    plugin.status === 'fail' || plugin.status === 'failure' ? 'text-red-400' :
                                                    'text-slate-500'
                                                }>
                                                    {plugin.status || 'unknown'}
                                                </span>
                                                <span className="text-slate-500 font-mono text-xs">
                                                    {plugin.timestamp?.split('T')[0] || '-'}
                                                </span>
                                                <Link to={`/plugins/${plugin.pluginName}`} className="text-blue-400 hover:underline text-xs">
                                                    View Plugin →
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredRecipes.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No recipes found matching your criteria.
                </div>
            )}
        </div>
    );
};
