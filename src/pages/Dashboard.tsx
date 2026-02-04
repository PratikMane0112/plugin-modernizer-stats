import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Package, GitBranch, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMetadata } from '../hooks/useMetadata';
import type { GlobalSummary, RecipeStats } from '../types';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number; className?: string }>, color: string }) => (
    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

export const Dashboard = () => {
    const { data, loading, error } = useMetadata();

    // All hooks must be called unconditionally, before any early returns
    const summary: GlobalSummary | null = data?.summary || null;
    const successRate = summary
        ? ((summary.successfulMigrations / summary.totalMigrations) * 100).toFixed(1)
        : '0';

    const migrationStatusOption = useMemo(() => {
        if (!summary) return {};

        return {
            title: { text: 'Migration Status', left: 'center', textStyle: { color: '#fff' } },
            tooltip: { trigger: 'item' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [
                {
                    name: 'Status',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#1e2329',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: { show: false },
                    data: [
                        { value: summary.successfulMigrations, name: 'Success', itemStyle: { color: '#22c55e' } },
                        { value: summary.failedMigrations, name: 'Failed', itemStyle: { color: '#ef4444' } },
                    ]
                }
            ]
        };
    }, [summary]);

    const topRecipesOption = useMemo(() => {
        if (!summary) return {};

        const recipes = Object.values(summary.recipes) as RecipeStats[];
        // Sort by failure count descending
        const sortedRecipes = recipes.sort((a, b) => b.fail - a.fail).slice(0, 10);

        return {
            title: { text: 'Top 10 Failing Recipes', left: 'center', textStyle: { color: '#fff' } },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', axisLabel: { color: '#94a3b8' } },
            yAxis: { type: 'category', data: sortedRecipes.map(r => r.name.split('.').pop()) || [], axisLabel: { color: '#94a3b8' } },
            series: [
                {
                    name: 'Failures',
                    type: 'bar',
                    data: sortedRecipes.map(r => r.fail),
                    itemStyle: { color: '#f87171' }
                },
                {
                    name: 'Successes',
                    type: 'bar',
                    data: sortedRecipes.map(r => r.success),
                    itemStyle: { color: '#4ade80' }
                }
            ]
        };
    }, [summary]);

    // Now safe to do conditional returns after all hooks are called
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !data || !summary) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
                <p className="text-red-400 text-lg">Failed to load data. Please try refreshing the page.</p>
                {error && <p className="text-red-300 text-sm mt-2">{error.message}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Plugins" value={summary.totalPlugins} icon={Package} color="bg-blue-500" />
                <StatCard title="Total Migrations" value={summary.totalMigrations} icon={GitBranch} color="bg-indigo-500" />
                <StatCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="Failed Migrations" value={summary.failedMigrations} icon={XCircle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <ReactECharts option={migrationStatusOption} style={{ height: '400px' }} theme="dark" />
                </div>
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <ReactECharts option={topRecipesOption} style={{ height: '400px' }} theme="dark" />
                </div>
            </div>
        </div>
    );
};
