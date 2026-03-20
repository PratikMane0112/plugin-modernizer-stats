import { useMemo, useCallback, useReducer } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    Package, GitBranch, CheckCircle, XCircle,
    TrendingUp, Clock, AlertTriangle, Tag
} from 'lucide-react';
import { useMetadata } from '../hooks/useMetadata';
import { SkeletonPage } from '../components/Skeleton';
import { ErrorBanner } from '../components/ErrorBanner';
import type { RecipeStats } from '../types';

const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    subtitle?: string;
}) => (
    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800 flex items-center justify-between transition-all hover:scale-[1.02] hover:border-slate-700">
        <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-20`} aria-hidden="true">
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

export const Dashboard = () => {
    const [, retry] = useReducer((x: number) => x + 1, 0);
    const { summary, recipes, loading, error } = useMetadata();

    const overview = summary?.overview ?? null;
    const successRate = overview ? overview.successRate.toFixed(1) : '0';

    const handleRetry = useCallback(() => {
        retry();
        window.location.reload();
    }, []);

    const migrationStatusOption = useMemo(() => {
        if (!overview) return {};
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                name: 'Status', type: 'pie', radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#1e2329', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
                labelLine: { show: false },
                data: [
                    { value: overview.successfulMigrations, name: 'Success', itemStyle: { color: '#22c55e' } },
                    { value: overview.failedMigrations, name: 'Failed', itemStyle: { color: '#ef4444' } },
                    ...(overview.pendingMigrations > 0
                        ? [{ value: overview.pendingMigrations, name: 'Pending', itemStyle: { color: '#f59e0b' } }]
                        : []),
                ]
            }]
        };
    }, [overview]);

    const topRecipesOption = useMemo(() => {
        if (!summary?.recipes) return {};
        const sorted = ([...summary.recipes] as RecipeStats[])
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', axisLabel: { color: '#94a3b8' } },
            yAxis: {
                type: 'category',
                data: sorted.map(r => r.recipeId.split('.').pop() ?? r.recipeId),
                axisLabel: { color: '#94a3b8', width: 160, overflow: 'truncate' },
            },
            series: [
                { name: 'Success', type: 'bar', stack: 'total', data: sorted.map(r => r.success), itemStyle: { color: '#4ade80' } },
                { name: 'Failures', type: 'bar', stack: 'total', data: sorted.map(r => r.fail), itemStyle: { color: '#f87171' } },
                { name: 'Pending', type: 'bar', stack: 'total', data: sorted.map(r => r.pending), itemStyle: { color: '#fbbf24' } },
            ]
        };
    }, [summary]);

    const timelineOption = useMemo(() => {
        if (!summary?.timeline || summary.timeline.length === 0) return null;
        return {
            tooltip: { trigger: 'axis' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                data: summary.timeline.map(t => t.month),
                axisLabel: { color: '#94a3b8', rotate: 45 },
            },
            yAxis: { type: 'value', axisLabel: { color: '#94a3b8' } },
            series: [
                { name: 'Success', type: 'bar', stack: 'total', data: summary.timeline.map(t => t.success), itemStyle: { color: '#4ade80' } },
                { name: 'Failed', type: 'bar', stack: 'total', data: summary.timeline.map(t => t.fail), itemStyle: { color: '#f87171' } },
            ]
        };
    }, [summary]);

    const tagsOption = useMemo(() => {
        if (!summary?.tags || summary.tags.length === 0) return null;
        const palette = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                name: 'Tags', type: 'pie', radius: ['35%', '65%'], roseType: 'area',
                itemStyle: { borderRadius: 8, borderColor: '#1e2329', borderWidth: 2 },
                label: { show: true, color: '#94a3b8', fontSize: 11 },
                data: summary.tags.map((t, i) => ({
                    value: t.count,
                    name: t.tag,
                    itemStyle: { color: palette[i % palette.length] },
                })),
            }]
        };
    }, [summary]);

    const topFailingRecipes = useMemo(() => {
        if (!recipes) return [];
        return [...recipes]
            .filter(r => r.failureCount > 0)
            .sort((a, b) => b.failureCount - a.failureCount)
            .slice(0, 8);
    }, [recipes]);

    if (loading) return <SkeletonPage />;
    if (error || !summary || !overview) {
        return <ErrorBanner message={error?.message ?? 'Unknown error'} onRetry={handleRetry} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl px-6 py-3 gap-2">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" aria-hidden="true" />
                    <span className="text-sm text-slate-300">
                        Data generated: <span className="font-medium text-white">{new Date(summary.generatedAt).toLocaleString()}</span>
                    </span>
                </div>
                <span className="text-xs text-slate-500">
                    Source:{' '}
                    <a href="https://github.com/jenkins-infra/metadata-plugin-modernizer" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" aria-label="View data source on GitHub">metadata-plugin-modernizer</a>
                </span>
            </div>

            {/* Stat cards — only reliable migration data, no PR stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard title="Total Plugins" value={overview.totalPlugins} icon={Package} color="bg-blue-500" />
                <StatCard title="Total Migrations" value={overview.totalMigrations} icon={GitBranch} color="bg-indigo-500" />
                <StatCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle} color="bg-green-500" subtitle={`${overview.successfulMigrations} successful`} />
                <StatCard title="Failed Migrations" value={overview.failedMigrations} icon={XCircle} color="bg-red-500" />
                <StatCard title="Pending" value={overview.pendingMigrations} icon={AlertTriangle} color="bg-amber-500" />
            </div>

            {/* Charts row: Migration Status + Recipe Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Migration Status</h3>
                    <ReactECharts option={migrationStatusOption} style={{ height: '350px' }} theme="dark" />
                </div>
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Recipe Performance</h3>
                        <Link to="/recipes" className="text-sm text-blue-400 hover:underline">View all →</Link>
                    </div>
                    <ReactECharts option={topRecipesOption} style={{ height: '350px' }} theme="dark" />
                </div>
            </div>

            {/* Timeline + Tags/Failing Recipes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Migration Timeline</h3>
                    {timelineOption ? (
                        <ReactECharts option={timelineOption} style={{ height: '400px' }} theme="dark" />
                    ) : (
                        <div className="flex items-center justify-center h-100 text-slate-500 text-sm">
                            <p>Historical timeline data not yet available.</p>
                        </div>
                    )}
                </div>
                {tagsOption && (
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag size={18} className="text-blue-400" aria-hidden="true" />
                            <h3 className="text-lg font-semibold text-white">Migration Tags</h3>
                        </div>
                        <ReactECharts option={tagsOption} style={{ height: '400px' }} theme="dark" />
                    </div>
                )}
            </div>

            {/* Top Failing Recipes */}
            {topFailingRecipes.length > 0 && (
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Recipes with Most Failures</h3>
                        <Link to="/recipes" className="text-sm text-blue-400 hover:underline">View all →</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {topFailingRecipes.map(recipe => {
                            const shortName = recipe.recipeId.split('.').pop() ?? recipe.recipeId;
                            const failRate = 100 - recipe.successRate;
                            return (
                                <Link
                                    key={recipe.recipeId}
                                    to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                    className="flex flex-col gap-2 p-3 bg-[#15171a] rounded-lg border border-slate-800 hover:border-red-500/40 hover:bg-[#1a1c20] transition-all group"
                                >
                                    {/* Recipe name — truncated with tooltip */}
                                    <span
                                        className="text-slate-200 font-medium text-sm truncate w-full group-hover:text-white transition-colors"
                                        title={shortName}
                                    >
                                        {shortName}
                                    </span>

                                    {/* Progress bar */}
                                    <div
                                        className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden"
                                        role="progressbar"
                                        aria-valuenow={failRate}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`${failRate.toFixed(0)}% failure rate`}
                                    >
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${failRate}%` }} />
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400 font-medium">✓ {recipe.successCount}</span>
                                            <span className="text-red-400 font-medium">✗ {recipe.failureCount}</span>
                                        </div>
                                        <span className="text-slate-500 shrink-0">{recipe.successRate.toFixed(0)}% success</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer summary — only reliable data */}
            <div className="bg-linear-to-r from-slate-800/50 to-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-center gap-6 text-sm">
                <span className="text-slate-400">
                    <TrendingUp size={14} className="inline mr-1" aria-hidden="true" />
                    Success Rate: <span className="text-white font-bold">{successRate}%</span>
                </span>
                <span className="text-slate-600" aria-hidden="true">|</span>
                <span className="text-slate-400">Plugins: <span className="text-blue-400 font-bold">{overview.totalPlugins}</span></span>
                <span className="text-slate-600" aria-hidden="true">|</span>
                <span className="text-slate-400">Migrations: <span className="text-indigo-400 font-bold">{overview.totalMigrations}</span></span>
                <span className="text-slate-600" aria-hidden="true">|</span>
                <span className="text-slate-400">Recipes: <span className="text-purple-400 font-bold">{summary.recipes.length}</span></span>
            </div>
        </div>
    );
};
