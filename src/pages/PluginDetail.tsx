import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    ArrowLeft, ExternalLink, CheckCircle, XCircle, GitBranch,
    Clock, GitCommit, AlertTriangle, FileText, Download
} from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { usePluginData, useFailedMigrations } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';
import { StatusBadge, deriveStatus } from '../components/StatusBadge';
import type { Migration } from '../types';

// ── PR Status Badge ─────────────────────────────────────────────────────────
function PRStatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; color: string; border: string }> = {
        open: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' },
        merged: { bg: 'rgba(168,85,247,0.1)', color: '#c084fc', border: 'rgba(168,85,247,0.2)' },
        closed: { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
    };
    const { bg, color, border } = config[status] ?? config.closed;
    return (
        <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, bgcolor: bg, color, border: `1px solid ${border}` }}>
            {status}
        </Box>
    );
}

// ── Recipe row for breakdown table ──────────────────────────────────────────
interface RecipeBreakdownRow { recipeId: string; recipeName: string; applied: number; success: number; failed: number; }

function buildRecipeBreakdown(migrations: Migration[]): RecipeBreakdownRow[] {
    const map = new Map<string, RecipeBreakdownRow>();
    for (const m of migrations) {
        const id = m.migrationId;
        const existing = map.get(id) || { recipeId: id, recipeName: m.migrationName || id, applied: 0, success: 0, failed: 0 };
        existing.applied++;
        if (m.migrationStatus === 'success') existing.success++;
        if (m.migrationStatus === 'fail' || m.migrationStatus === 'failure') existing.failed++;
        map.set(id, existing);
    }
    return [...map.values()].sort((a, b) => b.applied - a.applied);
}

// ── PR history rows ─────────────────────────────────────────────────────────
interface PRHistoryRow { url: string; recipeId: string; status: string; date: string; key: string; }

function buildPRHistory(migrations: Migration[]): PRHistoryRow[] {
    return migrations
        .filter(m => m.pullRequestUrl)
        .map(m => ({
            url: m.pullRequestUrl!,
            recipeId: m.migrationId,
            status: m.pullRequestStatus || 'unknown',
            date: m.timestamp?.split('T')[0] || 'N/A',
            key: m.key,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
}

const cardSx = { bgcolor: '#1e2329', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' };
const thSx = { color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, bgcolor: 'rgba(21,23,26,0.5)', borderBottom: '1px solid #1e293b', py: 1.5 };
const tdSx = { color: '#cbd5e1', fontSize: '0.875rem', borderBottom: '1px solid #1e293b', py: 1.5 };

export const PluginDetail = () => {
    const { name } = useParams<{ name: string }>();
    const { plugin, loading, error } = usePluginData(name || '');
    const { csvData, headers, loading: csvLoading } = useFailedMigrations(name || '');

    const timelineOption = useMemo(() => {
        if (!plugin?.migrations || plugin.migrations.length === 0) return null;
        const monthMap = new Map<string, { success: number; fail: number }>();
        for (const m of plugin.migrations) {
            const date = m.timestamp?.split('T')[0] || '';
            const month = date.substring(0, 7);
            if (!month) continue;
            const entry = monthMap.get(month) || { success: 0, fail: 0 };
            if (m.migrationStatus === 'success') entry.success++;
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
    }, [plugin]);

    const recipeBreakdown = useMemo(() => plugin?.migrations ? buildRecipeBreakdown(plugin.migrations) : [], [plugin]);
    const prHistory = useMemo(() => plugin?.migrations ? buildPRHistory(plugin.migrations) : [], [plugin]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} size={48} />
            </Box>
        );
    }

    if (error || !plugin) {
        const is404 = error?.message.includes('404');
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box component={Link} to="/plugins" sx={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#e2e8f0' } }}>
                    <ArrowLeft size={16} style={{ marginRight: 4 }} /> Back to Plugins
                </Box>
                {is404 ? (
                    <Box sx={{ ...cardSx, p: 6, textAlign: 'center' }}>
                        <Typography sx={{ color: '#64748b', fontSize: '1.125rem', mb: 1 }}>Plugin not found</Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.875rem' }}>{name}</Typography>
                    </Box>
                ) : (
                    <ErrorBanner message={error?.message ?? 'Unknown error'} onRetry={() => window.location.reload()} />
                )}
            </Box>
        );
    }

    const status = deriveStatus(plugin.migrations);
    const successCount = plugin.migrations.filter(m => m.migrationStatus === 'success').length;
    const failCount = plugin.migrations.filter(m => m.migrationStatus === 'fail' || m.migrationStatus === 'failure').length;
    const pendingCount = plugin.totalMigrations - successCount - failCount;
    const openPRs = plugin.migrations.filter(m => m.pullRequestStatus === 'open').length;
    const mergedPRs = plugin.migrations.filter(m => m.pullRequestStatus === 'merged').length;
    const closedPRs = plugin.migrations.filter(m => m.pullRequestStatus === 'closed').length;

    const statMiniBadge = (bg: string, color: string, border: string, val: number, label: string) => (
        <Box sx={{ bgcolor: bg, px: 2, py: 1, borderRadius: '8px', border: `1px solid ${border}`, textAlign: 'center' }}>
            <Typography sx={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color }}>{val}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color, fontWeight: 500 }}>{label}</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box component={Link} to="/plugins" sx={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#e2e8f0' } }}>
                <ArrowLeft size={16} style={{ marginRight: 4 }} /> Back to Plugins
            </Box>

            {/* ── Summary Card ─────────────────────────────────── */}
            <Box sx={{ bgcolor: '#1e2329', p: 4, borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9' }}>{plugin.pluginName}</Typography>
                            <StatusBadge status={status} />
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, fontSize: '0.875rem' }}>
                            {plugin.pluginRepository && (
                                <Box component="a" href={plugin.pluginRepository} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', color: '#60a5fa', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                    View Repository <ExternalLink size={14} style={{ marginLeft: 4 }} />
                                </Box>
                            )}
                            {plugin.migrations[0]?.defaultBranch && (
                                <Box component="span" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <GitBranch size={14} /> {plugin.migrations[0].defaultBranch}
                                </Box>
                            )}
                            {plugin.migrations[0]?.pluginVersion && (
                                <Box component="span" sx={{ px: 1, py: 0.25, bgcolor: '#334155', color: '#cbd5e1', fontSize: '0.75rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                                    v{plugin.migrations[0].pluginVersion}
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, textAlign: 'center' }}>
                        {statMiniBadge('rgba(59,130,246,0.1)', '#3b82f6', 'rgba(59,130,246,0.2)', plugin.totalMigrations, 'Migrations')}
                        {statMiniBadge('rgba(34,197,94,0.1)', '#22c55e', 'rgba(34,197,94,0.2)', successCount, 'Success')}
                        {statMiniBadge('rgba(239,68,68,0.1)', '#ef4444', 'rgba(239,68,68,0.2)', failCount, 'Failed')}
                        {pendingCount > 0 && statMiniBadge('rgba(245,158,11,0.1)', '#f59e0b', 'rgba(245,158,11,0.2)', pendingCount, 'Pending')}
                    </Box>
                </Box>
                {/* PR counts + latest migration */}
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #1e293b', pt: 2 }}>
                    {plugin.latestMigration && (
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock size={12} /> Last Updated: <Box component="span" sx={{ color: '#f1f5f9' }}>{plugin.latestMigration.split('T')[0]}</Box>
                        </Box>
                    )}
                    {openPRs > 0 && <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><GitBranch size={12} style={{ color: '#4ade80' }} /> Open PRs: <Box component="span" sx={{ color: '#4ade80', fontWeight: 600 }}>{openPRs}</Box></Box>}
                    {mergedPRs > 0 && <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><GitBranch size={12} style={{ color: '#c084fc' }} /> Merged PRs: <Box component="span" sx={{ color: '#c084fc', fontWeight: 600 }}>{mergedPRs}</Box></Box>}
                    {closedPRs > 0 && <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><GitBranch size={12} /> Closed PRs: <Box component="span" sx={{ color: '#cbd5e1', fontWeight: 600 }}>{closedPRs}</Box></Box>}
                </Box>
            </Box>

            {/* ── Migration Timeline Chart ─────────────────────── */}
            {timelineOption && (
                <Box sx={{ bgcolor: '#1e2329', p: 3, borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Migration Timeline</Typography>
                    <ReactECharts option={timelineOption} style={{ height: '250px' }} theme="dark" />
                </Box>
            )}

            {/* ── Recipe Breakdown ─────────────────────────────── */}
            {recipeBreakdown.length > 0 && (
                <Box sx={cardSx}>
                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a' }}>
                        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>Recipe Breakdown ({recipeBreakdown.length})</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table role="table" size="small">
                            <TableHead>
                                <TableRow>
                                    {['Recipe', 'Applied', 'Success', 'Failed', 'Status'].map(h => (
                                        <TableCell key={h} align={h === 'Recipe' ? 'left' : 'center'} sx={thSx}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recipeBreakdown.map(row => {
                                    const rowStatus = row.failed > 0 && row.success > 0 ? 'partial' : row.failed > 0 ? 'failed' : row.success > 0 ? 'success' : 'pending';
                                    return (
                                        <TableRow key={row.recipeId} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                            <TableCell sx={tdSx}>
                                                <Box component={Link} to={`/recipes/${encodeURIComponent(row.recipeId)}`} sx={{ color: '#60a5fa', textDecoration: 'none', fontFamily: 'monospace', fontSize: '0.8125rem', '&:hover': { textDecoration: 'underline' } }}>
                                                    {row.recipeName}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={tdSx}>{row.applied}</TableCell>
                                            <TableCell align="center" sx={tdSx}>
                                                <Box component="span" sx={{ color: row.success > 0 ? '#4ade80' : '#475569' }}>{row.success}</Box>
                                            </TableCell>
                                            <TableCell align="center" sx={tdSx}>
                                                <Box component="span" sx={{ color: row.failed > 0 ? '#f87171' : '#475569' }}>{row.failed}</Box>
                                            </TableCell>
                                            <TableCell align="center" sx={tdSx}><StatusBadge status={rowStatus} /></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            )}

            {/* ── PR History ──────────────────────────────────── */}
            {prHistory.length > 0 && (
                <Box sx={cardSx}>
                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a' }}>
                        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>PR History ({prHistory.length})</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table role="table" size="small">
                            <TableHead>
                                <TableRow>
                                    {['Pull Request', 'Recipe', 'Status', 'Date'].map(h => (
                                        <TableCell key={h} sx={thSx}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {prHistory.map(pr => (
                                    <TableRow key={pr.key} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                        <TableCell sx={tdSx}>
                                            <Box component="a" href={pr.url} target="_blank" rel="noopener noreferrer" sx={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>
                                                <GitBranch size={14} /> {pr.url.split('/').slice(-2).join('/')} <ExternalLink size={12} />
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tdSx}>
                                            <Box component={Link} to={`/recipes/${encodeURIComponent(pr.recipeId)}`} sx={{ color: '#cbd5e1', textDecoration: 'none', fontFamily: 'monospace', fontSize: '0.875rem', '&:hover': { color: '#60a5fa' } }}>
                                                {pr.recipeId.split('.').pop() ?? pr.recipeId}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tdSx}><PRStatusBadge status={pr.status} /></TableCell>
                                        <TableCell sx={{ ...tdSx, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Clock size={12} /> {pr.date}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            )}

            {/* ── Failed Migrations ────────────────────────────── */}
            {failCount > 0 && (
                <Box sx={cardSx}>
                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={16} style={{ color: '#f87171' }} />
                        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>Failed Migrations</Typography>
                    </Box>
                    {csvLoading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <CircularProgress size={24} sx={{ color: '#64748b' }} />
                        </Box>
                    ) : csvData && csvData.length > 0 ? (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table role="table" size="small">
                                <TableHead>
                                    <TableRow>
                                        {headers.map((h, i) => <TableCell key={i} sx={thSx}>{h}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {csvData.map((row, i) => (
                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                            {row.map((cell, j) => <TableCell key={j} sx={tdSx}>{cell}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                            No CSV data available. Failed migration details may not have been exported.
                        </Box>
                    )}
                </Box>
            )}

            {/* ── Migration History ────────────────────────────── */}
            <Box sx={cardSx}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e293b', bgcolor: '#15171a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>Migration History ({plugin.migrations.length})</Typography>
                </Box>
                <Box sx={{ '& > *:not(:last-child)': { borderBottom: '1px solid #1e293b' } }}>
                    {plugin.migrations.map(migration => (
                        <Box key={migration.key} sx={{ p: 3, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                            {/* Header row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                    {migration.migrationStatus === 'success'
                                        ? <CheckCircle style={{ color: '#22c55e', flexShrink: 0 }} size={20} />
                                        : (migration.migrationStatus === 'fail' || migration.migrationStatus === 'failure')
                                            ? <XCircle style={{ color: '#ef4444', flexShrink: 0 }} size={20} />
                                            : <AlertTriangle style={{ color: '#f59e0b', flexShrink: 0 }} size={20} />}
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: '#e2e8f0' }}>{migration.migrationName}</Typography>
                                        <Box component={Link} to={`/recipes/${encodeURIComponent(migration.migrationId)}`} sx={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontFamily: 'monospace', '&:hover': { textDecoration: 'underline' } }}>
                                            {migration.migrationId}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                    {migration.pullRequestStatus && <PRStatusBadge status={migration.pullRequestStatus} />}
                                    <Box component="span" sx={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Clock size={12} /> {migration.timestamp?.split('T')[0] || 'N/A'}
                                    </Box>
                                </Box>
                            </Box>

                            {migration.migrationDescription && (
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1.5, ml: 3.5 }}>{migration.migrationDescription}</Typography>
                            )}

                            {migration.tags && migration.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, ml: 3.5 }}>
                                    {migration.tags.map((tag: string, idx: number) => (
                                        <Box key={idx} component="span" sx={{ px: 1, py: 0.5, bgcolor: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                            {tag}
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Baselines & Version Info */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5, ml: 3.5, fontSize: '0.75rem' }}>
                                {migration.pluginVersion && (
                                    <Box component="span" sx={{ color: '#64748b' }}>Plugin: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#15171a', border: '1px solid #334155', px: 0.5, borderRadius: '4px', color: '#cbd5e1' }}>v{migration.pluginVersion}</Box></Box>
                                )}
                                {migration.jenkinsBaseline && (
                                    <Box component="span" sx={{ color: '#64748b' }}>Jenkins BL: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#15171a', border: '1px solid #334155', px: 0.5, borderRadius: '4px', color: '#cbd5e1' }}>{migration.jenkinsBaseline}</Box></Box>
                                )}
                                {migration.targetBaseline && (
                                    <Box component="span" sx={{ color: '#64748b' }}>Target BL: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#15171a', border: '1px solid #334155', px: 0.5, borderRadius: '4px', color: '#fde68a' }}>{migration.targetBaseline}</Box></Box>
                                )}
                                {migration.effectiveBaseline && (
                                    <Box component="span" sx={{ color: '#64748b' }}>Effective BL: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#15171a', border: '1px solid #334155', px: 0.5, borderRadius: '4px', color: '#86efac' }}>{migration.effectiveBaseline}</Box></Box>
                                )}
                                {migration.jenkinsVersion && (
                                    <Box component="span" sx={{ color: '#64748b' }}>Jenkins: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#15171a', border: '1px solid #334155', px: 0.5, borderRadius: '4px', color: '#cbd5e1' }}>{migration.jenkinsVersion}</Box></Box>
                                )}
                                {migration.defaultBranch && (
                                    <Box component="span" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <GitBranch size={12} /> {migration.defaultBranch}
                                    </Box>
                                )}
                                {migration.defaultBranchLatestCommitSha && (
                                    <Box component="span" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <GitCommit size={12} />
                                        <Box component="span" sx={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{migration.defaultBranchLatestCommitSha.substring(0, 7)}</Box>
                                    </Box>
                                )}
                            </Box>

                            {/* Check Runs Status */}
                            {migration.checkRunsSummary && (
                                <Box sx={{ mb: 1.5, ml: 3.5, p: 1.5, bgcolor: '#15171a', borderRadius: '8px', border: '1px solid #334155' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>CI Check Runs</Typography>
                                        <Box component="span" sx={{
                                            px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500,
                                            bgcolor: migration.checkRunsSummary === 'success' ? 'rgba(34,197,94,0.1)' : migration.checkRunsSummary === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: migration.checkRunsSummary === 'success' ? '#4ade80' : migration.checkRunsSummary === 'pending' ? '#fbbf24' : '#f87171',
                                        }}>
                                            {migration.checkRunsSummary}
                                        </Box>
                                    </Box>
                                    {migration.checkRuns && (
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5 }}>
                                            {(Object.entries(migration.checkRuns) as [string, string | null][]).map(([checkName, sts]) => (
                                                <Box key={checkName} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', px: 1, py: 0.5, borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}>
                                                    <Box component="span" sx={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', mr: 1 }}>{checkName}</Box>
                                                    <Box component="span" sx={{ color: sts === 'success' ? '#4ade80' : sts === 'failure' ? '#f87171' : sts === null ? '#475569' : '#fbbf24' }}>
                                                        {sts === null ? 'pending' : sts}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Action row */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, ml: 3.5, fontSize: '0.875rem' }}>
                                {migration.pullRequestUrl ? (
                                    <Box component="a" href={migration.pullRequestUrl} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', color: '#60a5fa', bgcolor: 'rgba(59,130,246,0.1)', px: 1.5, py: 0.5, borderRadius: '9999px', border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none', '&:hover': { color: '#93c5fd' } }}>
                                        <GitBranch size={14} style={{ marginRight: 4 }} /> View PR
                                    </Box>
                                ) : (
                                    <Box component="span" sx={{ color: '#475569', fontStyle: 'italic' }}>No PR created</Box>
                                )}
                                {(migration.additions !== undefined || migration.deletions !== undefined) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', bgcolor: '#15171a', px: 1, py: 0.5, borderRadius: '4px', border: '1px solid #334155' }}>
                                        {migration.additions !== undefined && migration.additions > 0 && <Box component="span" sx={{ color: '#4ade80' }}>+{migration.additions}</Box>}
                                        {migration.deletions !== undefined && migration.deletions > 0 && <Box component="span" sx={{ color: '#f87171' }}>-{migration.deletions}</Box>}
                                        {migration.changedFiles !== undefined && migration.changedFiles > 0 && <Box component="span" sx={{ color: '#64748b' }}>{migration.changedFiles} files</Box>}
                                    </Box>
                                )}
                                {migration.dryRun && (
                                    <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: 'rgba(234,179,8,0.1)', color: '#fbbf24', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(234,179,8,0.2)' }}>
                                        Dry Run
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── Raw Data ─────────────────────────────────────── */}
            <Box sx={{ bgcolor: '#1e2329', p: 3, borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Raw Data</Typography>

                {/* Source links to GitHub */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {plugin.sourceUrls?.aggregatedMigrations && (
                        <Box component="a" href={plugin.sourceUrls.aggregatedMigrations} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: '#15171a', color: '#cbd5e1', borderRadius: '8px', border: '1px solid #334155', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { borderColor: '#475569', color: '#f1f5f9' }, transition: 'all 0.15s' }}>
                            <FileText size={16} /> aggregated_migrations.json <ExternalLink size={12} />
                        </Box>
                    )}
                    {plugin.sourceUrls?.failedMigrations && plugin.rawFailedMigrations && plugin.rawFailedMigrations.length > 0 && (
                        <Box component="a" href={plugin.sourceUrls.failedMigrations} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: '#15171a', color: '#cbd5e1', borderRadius: '8px', border: '1px solid #334155', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { borderColor: '#475569', color: '#f1f5f9' }, transition: 'all 0.15s' }}>
                            <Download size={16} /> failed_migrations.csv <ExternalLink size={12} />
                        </Box>
                    )}
                </Box>

                {/* Inline raw aggregated_migrations.json */}
                {plugin.rawAggregatedMigrations && (
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FileText size={14} /> aggregated_migrations.json
                        </Typography>
                        <Box sx={{ bgcolor: '#15171a', border: '1px solid #334155', borderRadius: '8px', p: 2, maxHeight: '400px', overflow: 'auto', fontFamily: 'monospace', fontSize: '0.8125rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {JSON.stringify(plugin.rawAggregatedMigrations, null, 2)}
                        </Box>
                    </Box>
                )}

                {/* Inline raw failed_migrations (CSV rows as table) */}
                {plugin.rawFailedMigrations && plugin.rawFailedMigrations.length > 0 && (
                    <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Download size={14} /> failed_migrations.csv ({plugin.rawFailedMigrations.length} rows)
                        </Typography>
                        <Box sx={{ overflowX: 'auto', bgcolor: '#15171a', border: '1px solid #334155', borderRadius: '8px' }}>
                            <Table role="table" size="small">
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(plugin.rawFailedMigrations[0]).map(h => (
                                            <TableCell key={h} sx={thSx}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {plugin.rawFailedMigrations.map((row, i) => (
                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                            {Object.values(row).map((val, j) => (
                                                <TableCell key={j} sx={{ ...tdSx, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{val}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
