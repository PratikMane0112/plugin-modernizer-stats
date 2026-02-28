import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    Package, GitBranch, CheckCircle, XCircle, GitPullRequest,
    TrendingUp, Loader2, Clock, AlertTriangle, Tag
} from 'lucide-react';
import { useMetadata } from '../hooks/useMetadata';
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
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

export const Dashboard = () => {
    const { data, loading, error } = useMetadata();

    const summary = data?.summary || null;
    const overview = summary?.overview || null;
    const prStats = summary?.pullRequests || null;

    const successRate = overview
        ? overview.successRate.toFixed(1)
        : '0';

    const migrationStatusOption = useMemo(() => {
        if (!overview) return {};
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                name: 'Status',
                type: 'pie',
                radius: ['40%', '70%'],
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
        if (!summary) return {};
        const recipes = [...summary.recipes] as RecipeStats[];
        const sortedRecipes = recipes.sort((a, b) => b.total - a.total).slice(0, 10);
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: Array<{ seriesName: string; value: number; marker: string }>) => {
                    const header = params[0] ? sortedRecipes[params[0].value as unknown as number]?.recipeId || '' : '';
                    const shortHeader = header.split('.').pop() || header;
                    return `<b>${shortHeader}</b><br/>` +
                        params.map((p: { marker: string; seriesName: string; value: number }) =>
                            `${p.marker} ${p.seriesName}: ${p.value}`
                        ).join('<br/>');
                }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', axisLabel: { color: '#94a3b8' } },
            yAxis: {
                type: 'category',
                data: sortedRecipes.map(r => r.recipeId.split('.').pop()) || [],
                axisLabel: { color: '#94a3b8', width: 160, overflow: 'truncate' }
            },
            series: [
                {
                    name: 'Success',
                    type: 'bar',
                    stack: 'total',
                    data: sortedRecipes.map(r => r.success),
                    itemStyle: { color: '#4ade80' }
                },
                {
                    name: 'Failures',
                    type: 'bar',
                    stack: 'total',
                    data: sortedRecipes.map(r => r.fail),
                    itemStyle: { color: '#f87171' }
                },
                {
                    name: 'Pending',
                    type: 'bar',
                    stack: 'total',
                    data: sortedRecipes.map(r => r.pending),
                    itemStyle: { color: '#fbbf24' }
                }
            ]
        };
    }, [summary]);

    const prStatusOption = useMemo(() => {
        if (!prStats) return {};
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                name: 'PR Status',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#1e2329', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
                labelLine: { show: false },
                data: [
                    { value: prStats.mergedPRs, name: 'Merged', itemStyle: { color: '#a855f7' } },
                    { value: prStats.openPRs, name: 'Open', itemStyle: { color: '#22c55e' } },
                    { value: prStats.closedPRs, name: 'Closed', itemStyle: { color: '#ef4444' } },
                ]
            }]
        };
    }, [prStats]);

    const timelineOption = useMemo(() => {
        if (!summary || !summary.timeline || summary.timeline.length === 0) return {};
        return {
            tooltip: { trigger: 'axis' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                data: summary.timeline.map(t => t.month),
                axisLabel: { color: '#94a3b8', rotate: 45 }
            },
            yAxis: { type: 'value', axisLabel: { color: '#94a3b8' } },
            series: [
                {
                    name: 'Success',
                    type: 'bar',
                    stack: 'total',
                    data: summary.timeline.map(t => t.success),
                    itemStyle: { color: '#4ade80' }
                },
                {
                    name: 'Failed',
                    type: 'bar',
                    stack: 'total',
                    data: summary.timeline.map(t => t.fail),
                    itemStyle: { color: '#f87171' }
                }
            ]
        };
    }, [summary]);

    const tagsOption = useMemo(() => {
        if (!summary?.tags || summary.tags.length === 0) return {};
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                name: 'Tags',
                type: 'pie',
                radius: ['35%', '65%'],
                roseType: 'area',
                itemStyle: { borderRadius: 8, borderColor: '#1e2329', borderWidth: 2 },
                label: { show: true, color: '#94a3b8', fontSize: 11 },
                data: summary.tags.map((t, i) => ({
                    value: t.count,
                    name: t.tag,
                    itemStyle: {
                        color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'][i % 8]
                    }
                }))
            }]
        };
    }, [summary]);

    // Top failing plugins for quick navigation
    const topFailingPlugins = useMemo(() => {
        if (!data?.plugins) return [];
        return [...data.plugins]
            .filter(p => p.failCount > 0)
            .sort((a, b) => b.failCount - a.failCount)
            .slice(0, 5);
    }, [data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !data || !summary || !overview) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
                <p className="text-red-400 text-lg">Failed to load data. Please try refreshing the page.</p>
                {error && <p className="text-red-300 text-sm mt-2">{error.message}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Data Freshness Banner */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl px-6 py-3">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-sm text-slate-300">
                        Data generated: <span className="font-medium text-white">{new Date(summary.generatedAt).toLocaleString()}</span>
                    </span>
                </div>
                <span className="text-xs text-slate-500">
                    Source: <a href="https://github.com/jenkins-infra/metadata-plugin-modernizer" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">metadata-plugin-modernizer</a>
                </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Total Plugins" value={overview.totalPlugins} icon={Package} color="bg-blue-500" />
                <StatCard title="Total Migrations" value={overview.totalMigrations} icon={GitBranch} color="bg-indigo-500" />
                <StatCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle} color="bg-green-500" subtitle={`${overview.successfulMigrations} successful`} />
                <StatCard title="Failed Migrations" value={overview.failedMigrations} icon={XCircle} color="bg-red-500" />
                <StatCard title="Pending" value={overview.pendingMigrations} icon={AlertTriangle} color="bg-amber-500" />
                <StatCard title="Total PRs" value={prStats?.totalPRs || 0} icon={GitPullRequest} color="bg-purple-500" subtitle={`${prStats?.mergeRate.toFixed(1) || 0}% merge rate`} />
            </div>

            {/* Charts Row 1: Migration Status + PR Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Migration Status</h3>
                    <ReactECharts option={migrationStatusOption} style={{ height: '350px' }} theme="dark" />
                </div>
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Pull Request Status</h3>
                    <ReactECharts option={prStatusOption} style={{ height: '350px' }} theme="dark" />
                </div>
            </div>

            {/* Charts Row 2: Top Recipes + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Recipe Performance</h3>
                        <Link to="/recipes" className="text-sm text-blue-400 hover:underline">View all →</Link>
                    </div>
                    <ReactECharts option={topRecipesOption} style={{ height: '400px' }} theme="dark" />
                </div>
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Migration Timeline</h3>
                    <ReactECharts option={timelineOption} style={{ height: '400px' }} theme="dark" />
                </div>
            </div>

            {/* Row 3: Tags Distribution + Top Failing Plugins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tags Distribution */}
                {summary.tags && summary.tags.length > 0 && (
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag size={18} className="text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Migration Tags</h3>
                        </div>
                        <ReactECharts option={tagsOption} style={{ height: '320px' }} theme="dark" />
                    </div>
                )}

                {/* Top Failing Plugins */}
                {topFailingPlugins.length > 0 && (
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Plugins with Most Failures</h3>
                            <Link to="/plugins" className="text-sm text-blue-400 hover:underline">View all →</Link>
                        </div>
                        <div className="space-y-3">
                            {topFailingPlugins.map(plugin => (
                                <Link
                                    key={plugin.pluginName}
                                    to={`/plugins/${plugin.pluginName}`}
                                    className="flex items-center justify-between p-3 bg-[#15171a] rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                                >
                                    <div>
                                        <span className="text-slate-200 font-medium">{plugin.pluginName}</span>
                                        <div className="flex gap-3 mt-1 text-xs">
                                            <span className="text-green-400">✓ {plugin.successCount}</span>
                                            <span className="text-red-400">✗ {plugin.failCount}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{ width: `${100 - plugin.successRate}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1">{plugin.successRate.toFixed(0)}% success</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-center gap-6 text-sm">
                <span className="text-slate-400">
                    <TrendingUp size={14} className="inline mr-1" />
                    Merge Rate: <span className="text-white font-bold">{prStats?.mergeRate.toFixed(1)}%</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                    Open PRs: <span className="text-green-400 font-bold">{prStats?.openPRs}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                    Merged PRs: <span className="text-purple-400 font-bold">{prStats?.mergedPRs}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                    Closed PRs: <span className="text-red-400 font-bold">{prStats?.closedPRs}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                    Recipes: <span className="text-blue-400 font-bold">{summary.recipes.length}</span>
                </span>
            </div>
        </div>
    );
};
