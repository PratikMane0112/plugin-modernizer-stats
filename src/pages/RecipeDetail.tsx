import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    ArrowLeft, CheckCircle, XCircle, Clock, Loader2,
    ExternalLink, FileText, BookOpen
} from 'lucide-react';
import { useRecipeData } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';
import { SuccessRateBadge } from '../components/SuccessRateBadge';
import { StatusBadge } from '../components/StatusBadge';

const BASE = '/plugin-modernizer-stats';

// ── Affected Plugin Row (derived from recipe.plugins) ───────────────────────
interface AffectedPluginRow {
    pluginName: string;
    applied: number;
    success: number;
    failures: number;
    lastRun: string;
}

function buildAffectedPlugins(plugins: { pluginName: string; status: string; timestamp: string }[]): AffectedPluginRow[] {
    const map = new Map<string, AffectedPluginRow>();
    for (const p of plugins) {
        const existing = map.get(p.pluginName) || {
            pluginName: p.pluginName,
            applied: 0,
            success: 0,
            failures: 0,
            lastRun: '',
        };
        existing.applied++;
        if (p.status === 'success') existing.success++;
        if (p.status === 'fail' || p.status === 'failure') existing.failures++;
        if (p.timestamp && p.timestamp > existing.lastRun) existing.lastRun = p.timestamp;
        map.set(p.pluginName, existing);
    }
    return [...map.values()].sort((a, b) => b.failures - a.failures);
}

export const RecipeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const recipeName = decodeURIComponent(id ?? '');
    const { recipe, loading, error } = useRecipeData(recipeName);

    // Derive display info dynamically from recipe ID — no hardcoded constants
    const docsUrl = 'https://github.com/openrewrite/rewrite-jenkins';

    const statusChartOption = useMemo(() => {
        if (!recipe) return {};
        const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                itemStyle: { borderRadius: 10, borderColor: '#1e2329', borderWidth: 2 },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
                data: [
                    { value: recipe.successCount, name: 'Success', itemStyle: { color: '#22c55e' } },
                    { value: recipe.failureCount, name: 'Failed', itemStyle: { color: '#ef4444' } },
                    ...(pendingCount > 0
                        ? [{ value: pendingCount, name: 'Pending', itemStyle: { color: '#f59e0b' } }]
                        : []),
                ]
            }]
        };
    }, [recipe]);

    const timelineOption = useMemo(() => {
        if (!recipe?.plugins || recipe.plugins.length === 0) return null;

        const monthMap = new Map<string, { success: number; fail: number }>();
        for (const p of recipe.plugins) {
            const month = p.timestamp?.split('T')[0]?.substring(0, 7) || '';
            if (!month) continue;
            const entry = monthMap.get(month) || { success: 0, fail: 0 };
            if (p.status === 'success') entry.success++;
            else entry.fail++;
            monthMap.set(month, entry);
        }

        if (monthMap.size < 2) return null;

        const months = [...monthMap.keys()].sort();
        return {
            tooltip: { trigger: 'axis' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: { type: 'category' as const, data: months, axisLabel: { color: '#94a3b8', rotate: 45 } },
            yAxis: { type: 'value' as const, axisLabel: { color: '#94a3b8' } },
            series: [
                { name: 'Success', type: 'bar' as const, stack: 'total', data: months.map(m => monthMap.get(m)?.success || 0), itemStyle: { color: '#4ade80' } },
                { name: 'Failed', type: 'bar' as const, stack: 'total', data: months.map(m => monthMap.get(m)?.fail || 0), itemStyle: { color: '#f87171' } },
            ]
        };
    }, [recipe]);

    const affectedPlugins = useMemo(() => {
        if (!recipe?.plugins) return [];
        return buildAffectedPlugins(recipe.plugins);
    }, [recipe]);

    // Failure rows — plugins where this recipe failed
    const failureRows = useMemo(() => {
        if (!recipe?.plugins) return [];
        return recipe.plugins
            .filter(p => p.status === 'fail' || p.status === 'failure')
            .sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''));
    }, [recipe]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        const is404 = error.message.includes('404');
        return (
            <div className="space-y-4">
                <Link to="/recipes" className="inline-flex items-center text-slate-400 hover:text-slate-200">
                    <ArrowLeft size={16} className="mr-1" /> Back to Recipes
                </Link>
                {is404 ? (
                    <div className="bg-[#1e2329] rounded-xl border border-slate-800 p-12 text-center">
                        <p className="text-slate-500 text-lg mb-2">Recipe not found</p>
                        <p className="text-slate-600 text-sm font-mono">{recipeName}</p>
                    </div>
                ) : (
                    <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />
                )}
            </div>
        );
    }

    if (!recipe) return null;

    const displayName = recipe.recipeId.split('.').pop() || recipe.recipeId;
    const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;

    return (
        <div className="space-y-6">
            <Link to="/recipes" className="inline-flex items-center text-slate-400 hover:text-slate-200">
                <ArrowLeft size={16} className="mr-1" /> Back to Recipes
            </Link>

            {/* ── Summary Card ────────────────────────────────────────── */}
            <div className="bg-[#1e2329] p-8 rounded-xl border border-slate-800">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                            <SuccessRateBadge rate={recipe.successRate} />
                        </div>
                        <p className="text-sm text-slate-500 font-mono mb-3">{recipe.recipeId}</p>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-400 hover:underline text-sm"
                            >
                                <BookOpen size={14} />
                                OpenRewrite Source
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-center">
                        <div className="bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
                            <span className="block text-2xl font-bold text-blue-400">{recipe.totalApplications}</span>
                            <span className="text-xs text-blue-300">Total</span>
                        </div>
                        <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                            <span className="block text-2xl font-bold text-green-400">{recipe.successCount}</span>
                            <span className="text-xs text-green-300">Success</span>
                        </div>
                        <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                            <span className="block text-2xl font-bold text-red-400">{recipe.failureCount}</span>
                            <span className="text-xs text-red-300">Failed</span>
                        </div>
                        {pendingCount > 0 && (
                            <div className="bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                                <span className="block text-2xl font-bold text-amber-400">{pendingCount}</span>
                                <span className="text-xs text-amber-300">Pending</span>
                            </div>
                        )}
                        <div className="bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                            <span className="block text-2xl font-bold text-indigo-400">{recipe.successRate.toFixed(1)}%</span>
                            <span className="text-xs text-indigo-300">Success Rate</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Charts: Status Distribution + Application Timeline ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
                    <ReactECharts option={statusChartOption} style={{ height: '300px' }} theme="dark" />
                </div>
                {timelineOption && (
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Application Timeline</h3>
                        <ReactECharts option={timelineOption} style={{ height: '300px' }} theme="dark" />
                    </div>
                )}
            </div>

            {/* ── Affected Plugins Table ──────────────────────────────── */}
            {affectedPlugins.length > 0 && (
                <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-[#15171a]">
                        <h2 className="font-bold text-slate-200">Affected Plugins ({affectedPlugins.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left" role="table">
                            <thead>
                                <tr className="bg-[#15171a]/50 border-b border-slate-800 text-slate-400 text-sm">
                                    <th className="px-6 py-3">Plugin</th>
                                    <th className="px-6 py-3 text-center">Applied</th>
                                    <th className="px-6 py-3 text-center">Success</th>
                                    <th className="px-6 py-3 text-center">Failures</th>
                                    <th className="px-6 py-3">Last Run</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {affectedPlugins.map((p) => {
                                    const pluginStatus = p.failures > 0 && p.success > 0
                                        ? 'partial'
                                        : p.failures > 0
                                            ? 'failed'
                                            : p.success > 0
                                                ? 'success'
                                                : 'pending';
                                    return (
                                        <tr key={p.pluginName} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3">
                                                <Link
                                                    to={`/plugins/${p.pluginName}`}
                                                    className="text-blue-400 hover:underline text-sm font-medium"
                                                >
                                                    {p.pluginName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-center text-slate-300 text-sm">{p.applied}</td>
                                            <td className="px-6 py-3 text-center">
                                                {p.success > 0 ? (
                                                    <span className="text-green-400 text-sm">{p.success}</span>
                                                ) : (
                                                    <span className="text-slate-600 text-sm">0</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                {p.failures > 0 ? (
                                                    <span className="text-red-400 text-sm">{p.failures}</span>
                                                ) : (
                                                    <span className="text-slate-600 text-sm">0</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-slate-400 text-sm font-mono flex items-center gap-1">
                                                <Clock size={12} />
                                                {p.lastRun?.split('T')[0] || '-'}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <StatusBadge status={pluginStatus} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Failure Breakdown (only if failures exist) ──────────── */}
            {failureRows.length > 0 && (
                <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-[#15171a] flex items-center gap-2">
                        <XCircle size={16} className="text-red-400" />
                        <h2 className="font-bold text-slate-200">Failure Breakdown ({failureRows.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left" role="table">
                            <thead>
                                <tr className="bg-[#15171a]/50 border-b border-slate-800 text-slate-400 text-sm">
                                    <th className="px-6 py-3">Plugin</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {failureRows.map((row, i) => (
                                    <tr key={`${row.pluginName}-${i}`} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3">
                                            <Link
                                                to={`/plugins/${row.pluginName}`}
                                                className="text-blue-400 hover:underline text-sm"
                                            >
                                                {row.pluginName}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3 text-slate-400 text-sm font-mono flex items-center gap-1">
                                            <Clock size={12} />
                                            {row.timestamp?.split('T')[0] || '-'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <Link
                                                to={`/plugins/${row.pluginName}`}
                                                className="text-blue-400 hover:underline text-xs"
                                            >
                                                View Plugin →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Plugin Applications (full list) ────────────────────── */}
            <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-[#15171a]">
                    <h2 className="font-bold text-slate-200">All Plugin Applications ({recipe.plugins.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left" role="table">
                        <thead>
                            <tr className="bg-[#15171a] border-b border-slate-800 text-slate-400 text-sm font-medium">
                                <th className="px-6 py-3">Plugin</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {recipe.plugins.map((plugin, idx) => (
                                <tr key={`${plugin.pluginName}-${idx}`} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3 text-slate-200 font-medium">{plugin.pluginName}</td>
                                    <td className="px-6 py-3">
                                        <span className="flex items-center gap-1">
                                            {plugin.status === 'success' ? (
                                                <><CheckCircle size={14} className="text-green-400" /><span className="text-green-400 text-sm">success</span></>
                                            ) : plugin.status === 'fail' || plugin.status === 'failure' ? (
                                                <><XCircle size={14} className="text-red-400" /><span className="text-red-400 text-sm">failed</span></>
                                            ) : (
                                                <span className="text-slate-500 text-sm">{plugin.status || 'unknown'}</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-slate-500 text-sm font-mono flex items-center gap-1">
                                            <Clock size={12} />
                                            {plugin.timestamp?.split('T')[0] || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Link
                                            to={`/plugins/${plugin.pluginName}`}
                                            className="text-blue-400 hover:underline text-sm"
                                        >
                                            View Plugin →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Raw Data Links ──────────────────────────────────────── */}
            <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">Raw Data</h3>
                <div className="flex flex-wrap gap-3">
                    <a
                        href={`${BASE}/recipes/${encodeURIComponent(recipe.recipeId)}.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#15171a] text-slate-300 rounded-lg border border-slate-700 hover:border-slate-600 hover:text-white transition-colors text-sm"
                    >
                        <FileText size={16} />
                        {recipe.recipeId}.json
                        <ExternalLink size={12} />
                    </a>
                    <a
                        href={`${BASE}/plugin-recipes-index.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#15171a] text-slate-300 rounded-lg border border-slate-700 hover:border-slate-600 hover:text-white transition-colors text-sm"
                    >
                        <FileText size={16} />
                        plugin-recipes-index.json
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
};
