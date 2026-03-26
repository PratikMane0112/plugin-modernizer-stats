import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    ArrowLeft, CheckCircle, XCircle, Clock,
    ExternalLink, FileText, BookOpen
} from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useRecipeData } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';
import { SuccessRateBadge } from '../components/SuccessRateBadge';
import { StatusBadge } from '../components/StatusBadge';

const BASE = '/plugin-modernizer-stats';

// ── Affected Plugin Row ─────────────────────────────────────────────────────
interface AffectedPluginRow { pluginName: string; applied: number; success: number; failures: number; lastRun: string; }

function buildAffectedPlugins(plugins: { pluginName: string; status: string; timestamp: string }[]): AffectedPluginRow[] {
    const map = new Map<string, AffectedPluginRow>();
    for (const p of plugins) {
        const existing = map.get(p.pluginName) || { pluginName: p.pluginName, applied: 0, success: 0, failures: 0, lastRun: '' };
        existing.applied++;
        if (p.status === 'success') existing.success++;
        if (p.status === 'fail' || p.status === 'failure') existing.failures++;
        if (p.timestamp && p.timestamp > existing.lastRun) existing.lastRun = p.timestamp;
        map.set(p.pluginName, existing);
    }
    return [...map.values()].sort((a, b) => b.failures - a.failures);
}

const cardSx = { bgcolor: '#1e2329', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' };
const thSx = { color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, bgcolor: 'rgba(21,23,26,0.5)', borderBottom: '1px solid #1e293b', py: 1.5 };
const tdSx = { color: '#cbd5e1', fontSize: '0.875rem', borderBottom: '1px solid #1e293b', py: 1.5 };

export const RecipeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const recipeName = decodeURIComponent(id ?? '');
    const { recipe, loading, error } = useRecipeData(recipeName);

    const docsUrl = 'https://github.com/openrewrite/rewrite-jenkins';

    const statusChartOption = useMemo(() => {
        if (!recipe) return {};
        const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;
        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: '0%', textStyle: { color: '#cbd5e1' } },
            series: [{
                type: 'pie', radius: ['40%', '70%'],
                itemStyle: { borderRadius: 10, borderColor: '#1e2329', borderWidth: 2 },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
                data: [
                    { value: recipe.successCount, name: 'Success', itemStyle: { color: '#22c55e' } },
                    { value: recipe.failureCount, name: 'Failed', itemStyle: { color: '#ef4444' } },
                    ...(pendingCount > 0 ? [{ value: pendingCount, name: 'Pending', itemStyle: { color: '#f59e0b' } }] : []),
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

    const affectedPlugins = useMemo(() => recipe?.plugins ? buildAffectedPlugins(recipe.plugins) : [], [recipe]);
    const failureRows = useMemo(() => {
        if (!recipe?.plugins) return [];
        return recipe.plugins
            .filter(p => p.status === 'fail' || p.status === 'failure')
            .sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''));
    }, [recipe]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} size={48} />
            </Box>
        );
    }

    if (error) {
        const is404 = error.message.includes('404');
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box component={Link} to="/recipes" sx={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#e2e8f0' } }}>
                    <ArrowLeft size={16} style={{ marginRight: 4 }} /> Back to Recipes
                </Box>
                {is404 ? (
                    <Box sx={{ ...cardSx, p: 6, textAlign: 'center' }}>
                        <Typography sx={{ color: '#64748b', fontSize: '1.125rem', mb: 1 }}>Recipe not found</Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.875rem', fontFamily: 'monospace' }}>{recipeName}</Typography>
                    </Box>
                ) : (
                    <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />
                )}
            </Box>
        );
    }

    if (!recipe) return null;

    const displayName = recipe.recipeId.split('.').pop() || recipe.recipeId;
    const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;

    const statBadge = (bg: string, color: string, border: string, val: number | string, label: string) => (
        <Box sx={{ bgcolor: bg, px: 2, py: 1, borderRadius: '8px', border: `1px solid ${border}`, textAlign: 'center' }}>
            <Typography sx={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color }}>{val}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color, fontWeight: 500 }}>{label}</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box component={Link} to="/recipes" sx={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#e2e8f0' } }}>
                <ArrowLeft size={16} style={{ marginRight: 4 }} /> Back to Recipes
            </Box>

            {/* ── Summary Card ─────────────────────────────────── */}
            <Box sx={{ bgcolor: '#1e2329', p: 4, borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9' }}>{displayName}</Typography>
                            <SuccessRateBadge rate={recipe.successRate} />
                        </Box>
                        <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontFamily: 'monospace', mb: 1.5 }}>{recipe.recipeId}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                            <Box component="a" href={docsUrl} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>
                                <BookOpen size={14} /> OpenRewrite Source <ExternalLink size={12} />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, textAlign: 'center' }}>
                        {statBadge('rgba(59,130,246,0.1)', '#60a5fa', 'rgba(59,130,246,0.2)', recipe.totalApplications, 'Total')}
                        {statBadge('rgba(34,197,94,0.1)', '#4ade80', 'rgba(34,197,94,0.2)', recipe.successCount, 'Success')}
                        {statBadge('rgba(239,68,68,0.1)', '#f87171', 'rgba(239,68,68,0.2)', recipe.failureCount, 'Failed')}
                        {pendingCount > 0 && statBadge('rgba(245,158,11,0.1)', '#fbbf24', 'rgba(245,158,11,0.2)', pendingCount, 'Pending')}
                        {statBadge('rgba(99,102,241,0.1)', '#818cf8', 'rgba(99,102,241,0.2)', `${recipe.successRate.toFixed(1)}%`, 'Success Rate')}
                    </Box>
                </Box>
            </Box>

            {/* ── Charts: Status Distribution + Application Timeline ── */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Box sx={{ bgcolor: '#1e2329', p: 3, borderRadius: '12px', border: '1px solid #1e293b' }}>
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Status Distribution</Typography>
                        <ReactECharts option={statusChartOption} style={{ height: '300px' }} theme="dark" />
                    </Box>
                </Box>
                {timelineOption && (
                    <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                        <Box sx={{ bgcolor: '#1e2329', p: 3, borderRadius: '12px', border: '1px solid #1e293b' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Application Timeline</Typography>
                            <ReactECharts option={timelineOption} style={{ height: '300px' }} theme="dark" />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* ── Affected Plugins Table ──────────────────────── */}
            {affectedPlugins.length > 0 && (
                <Box sx={cardSx}>
                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a' }}>
                        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>Affected Plugins ({affectedPlugins.length})</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table role="table" size="small">
                            <TableHead>
                                <TableRow>
                                    {['Plugin', 'Applied', 'Success', 'Failures', 'Last Run', 'Status'].map((h, i) => (
                                        <TableCell key={h} align={i === 0 ? 'left' : 'center'} sx={thSx}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {affectedPlugins.map(p => {
                                    const pluginStatus = p.failures > 0 && p.success > 0 ? 'partial' : p.failures > 0 ? 'failed' : p.success > 0 ? 'success' : 'pending';
                                    return (
                                        <TableRow key={p.pluginName} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                            <TableCell sx={tdSx}>
                                                <Box component={Link} to={`/plugins/${p.pluginName}`} sx={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>
                                                    {p.pluginName}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={tdSx}>{p.applied}</TableCell>
                                            <TableCell align="center" sx={tdSx}>
                                                <Box component="span" sx={{ color: p.success > 0 ? '#4ade80' : '#475569' }}>{p.success}</Box>
                                            </TableCell>
                                            <TableCell align="center" sx={tdSx}>
                                                <Box component="span" sx={{ color: p.failures > 0 ? '#f87171' : '#475569' }}>{p.failures}</Box>
                                            </TableCell>
                                            <TableCell sx={{ ...tdSx, fontFamily: 'monospace' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Clock size={12} /> {p.lastRun?.split('T')[0] || '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={tdSx}><StatusBadge status={pluginStatus} /></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            )}

            {/* ── Failure Breakdown ────────────────────────────── */}
            {failureRows.length > 0 && (
                <Box sx={cardSx}>
                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <XCircle size={16} style={{ color: '#f87171' }} />
                        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>Failure Breakdown ({failureRows.length})</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table role="table" size="small">
                            <TableHead>
                                <TableRow>
                                    {['Plugin', 'Timestamp', 'Actions'].map(h => (
                                        <TableCell key={h} sx={thSx}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {failureRows.map((row, i) => (
                                    <TableRow key={`${row.pluginName}-${i}`} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                        <TableCell sx={tdSx}>
                                            <Box component={Link} to={`/plugins/${row.pluginName}`} sx={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>
                                                {row.pluginName}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ ...tdSx, fontFamily: 'monospace' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Clock size={12} /> {row.timestamp?.split('T')[0] || '-'}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tdSx}>
                                            <Box component={Link} to={`/plugins/${row.pluginName}`} sx={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { textDecoration: 'underline' } }}>
                                                View Plugin →
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            )}

            {/* ── Plugin Applications (full list) ─────────────── */}
            <Box sx={cardSx}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a' }}>
                    <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>All Plugin Applications ({recipe.plugins.length})</Typography>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table role="table" size="small">
                        <TableHead>
                            <TableRow>
                                {['Plugin', 'Status', 'Timestamp', 'Actions'].map(h => (
                                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recipe.plugins.map((plugin, idx) => (
                                <TableRow key={`${plugin.pluginName}-${idx}`} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                    <TableCell sx={{ ...tdSx, fontWeight: 500 }}>{plugin.pluginName}</TableCell>
                                    <TableCell sx={tdSx}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {plugin.status === 'success' ? (
                                                <><CheckCircle size={14} style={{ color: '#4ade80' }} /><Box component="span" sx={{ color: '#4ade80', fontSize: '0.875rem' }}>success</Box></>
                                            ) : plugin.status === 'fail' || plugin.status === 'failure' ? (
                                                <><XCircle size={14} style={{ color: '#f87171' }} /><Box component="span" sx={{ color: '#f87171', fontSize: '0.875rem' }}>failed</Box></>
                                            ) : (
                                                <Box component="span" sx={{ color: '#64748b', fontSize: '0.875rem' }}>{plugin.status || 'unknown'}</Box>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ ...tdSx, fontFamily: 'monospace' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                            <Clock size={12} /> {plugin.timestamp?.split('T')[0] || '-'}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={tdSx}>
                                        <Box component={Link} to={`/plugins/${plugin.pluginName}`} sx={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>
                                            View Plugin →
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>

            {/* ── Raw Data Links ───────────────────────────────── */}
            <Box sx={{ bgcolor: '#1e2329', p: 3, borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Raw Data</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {[
                        { href: `${BASE}/recipes/${encodeURIComponent(recipe.recipeId)}.json`, icon: <FileText size={16} />, label: `${recipe.recipeId}.json` },
                        { href: `${BASE}/plugin-recipes-index.json`, icon: <FileText size={16} />, label: 'plugin-recipes-index.json' },
                    ].map(({ href, icon, label }) => (
                        <Box key={label} component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: '#15171a', color: '#cbd5e1', borderRadius: '8px', border: '1px solid #334155', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { borderColor: '#475569', color: '#f1f5f9' }, transition: 'all 0.15s' }}>
                            {icon} {label} <ExternalLink size={12} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
