import { useMemo, useCallback, useReducer } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    Package, GitBranch, CheckCircle, XCircle,
    TrendingUp, Clock, AlertTriangle, Tag
} from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import { useMetadata } from '../hooks/useMetadata';
import { SkeletonPage } from '../components/Skeleton';
import { ErrorBanner } from '../components/ErrorBanner';
import type { RecipeStats } from '../types';

const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    subtitle?: string;
}) => (
    <Box
        sx={{
            bgcolor: '#1e2329',
            p: 3,
            borderRadius: '12px',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            transition: 'transform 0.15s, border-color 0.15s',
            '&:hover': { transform: 'scale(1.02)', borderColor: '#334155' },
        }}
    >
        <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#94a3b8', mb: 0.25 }}>{title}</Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>{value}</Typography>
            {subtitle && <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
        <Box
            aria-hidden="true"
            sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: `${color}55`,
                border: `1px solid ${color}88`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color,
            }}
        >
            <Icon size={24} />
        </Box>
    </Box>
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
                    ...((overview.pendingMigrations ?? 0) > 0
                        ? [{ value: overview.pendingMigrations!, name: 'Pending', itemStyle: { color: '#f59e0b' } }]
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

    const cardSx = {
        bgcolor: '#1e2329',
        p: 3,
        borderRadius: '12px',
        border: '1px solid #1e293b',
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Data freshness banner */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to right, rgba(59,130,246,0.1), rgba(168,85,247,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={16} style={{ color: '#60a5fa' }} aria-hidden="true" />
                    <Typography sx={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                        Data generated:{' '}
                        <Box component="span" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                            {new Date(summary.generatedAt).toLocaleString()}
                        </Box>
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Source:{' '}
                    <MuiLink
                        href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#60a5fa' }}
                        aria-label="View data source on GitHub"
                    >
                        metadata-plugin-modernizer
                    </MuiLink>
                </Typography>
            </Box>

            {/* Stat Cards */}
            {/* Stat Cards — flex row so all 5 fill the full width equally */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'stretch' }}>
                {[{ title: 'Total Plugins', value: overview.totalPlugins, icon: Package, color: '#3b82f6' },
                { title: 'Total Migrations', value: overview.totalMigrations, icon: GitBranch, color: '#6366f1' },
                { title: 'Success Rate', value: `${successRate}%`, icon: CheckCircle, color: '#22c55e', subtitle: `${overview.successfulMigrations} successful` },
                { title: 'Failed Migrations', value: overview.failedMigrations, icon: XCircle, color: '#ef4444' },
                { title: 'Pending', value: overview.pendingMigrations ?? 0, icon: AlertTriangle, color: '#f59e0b' },
                ].map(card => (
                    <Box key={card.title} sx={{ flex: '1 1 160px', minWidth: 0 }}>
                        <StatCard {...card} />
                    </Box>
                ))}
            </Box>

            {/* Charts row: Migration Status + Recipe Performance */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
                    <Box sx={cardSx}>
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Migration Status</Typography>
                        <ReactECharts option={migrationStatusOption} style={{ height: '350px' }} theme="dark" />
                    </Box>
                </Box>
                <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
                    <Box sx={cardSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9' }}>Recipe Performance</Typography>
                            <MuiLink component={Link} to="/recipes" sx={{ fontSize: '0.875rem', color: '#60a5fa', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                View all →
                            </MuiLink>
                        </Box>
                        <ReactECharts option={topRecipesOption} style={{ height: '350px' }} theme="dark" />
                    </Box>
                </Box>
            </Box>

            {/* Timeline + Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
                    <Box sx={cardSx}>
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', mb: 2 }}>Migration Timeline</Typography>
                        {timelineOption ? (
                            <ReactECharts option={timelineOption} style={{ height: '400px' }} theme="dark" />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b', fontSize: '0.875rem' }}>
                                <p>Historical timeline data not yet available.</p>
                            </Box>
                        )}
                    </Box>
                </Box>
                {tagsOption && (
                    <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
                        <Box sx={cardSx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Tag size={18} style={{ color: '#60a5fa' }} aria-hidden="true" />
                                <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9' }}>Migration Tags</Typography>
                            </Box>
                            <ReactECharts option={tagsOption} style={{ height: '400px' }} theme="dark" />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Top Failing Recipes */}
            {topFailingRecipes.length > 0 && (
                <Box sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9' }}>Recipes with Most Failures</Typography>
                        <MuiLink component={Link} to="/recipes" sx={{ fontSize: '0.875rem', color: '#60a5fa', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            View all →
                        </MuiLink>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {topFailingRecipes.map(recipe => {
                            const shortName = recipe.recipeId.split('.').pop() ?? recipe.recipeId;
                            const failRate = 100 - recipe.successRate;
                            return (
                                <Box key={recipe.recipeId} sx={{ flex: '1 1 200px', minWidth: 0 }}>
                                    <Box
                                        component={Link}
                                        to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            p: 1.5,
                                            height: '100%',
                                            bgcolor: '#15171a',
                                            borderRadius: '8px',
                                            border: '1px solid #1e293b',
                                            textDecoration: 'none',
                                            transition: 'border-color 0.15s, background 0.15s',
                                            '&:hover': { borderColor: 'rgba(239,68,68,0.4)', bgcolor: '#1a1c20' },
                                        }}
                                    >
                                        <Typography
                                            title={shortName}
                                            sx={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                            {shortName}
                                        </Typography>
                                        <Box
                                            role="progressbar"
                                            aria-valuenow={failRate}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label={`${failRate.toFixed(0)}% failure rate`}
                                            sx={{ width: '100%', height: 6, bgcolor: '#334155', borderRadius: '9999px', overflow: 'hidden' }}
                                        >
                                            <Box sx={{ height: '100%', bgcolor: '#ef4444', borderRadius: '9999px', width: `${failRate}%` }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Typography component="span" sx={{ color: '#4ade80', fontWeight: 500, fontSize: 'inherit' }}>✓ {recipe.successCount}</Typography>
                                                <Typography component="span" sx={{ color: '#f87171', fontWeight: 500, fontSize: 'inherit' }}>✗ {recipe.failureCount}</Typography>
                                            </Box>
                                            <Typography component="span" sx={{ color: '#64748b', fontSize: 'inherit', flexShrink: 0 }}>
                                                {recipe.successRate.toFixed(0)}% success
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Footer summary */}
            <Box
                sx={{
                    background: 'linear-gradient(to right, rgba(30,41,59,0.5), rgba(15,23,42,0.5))',
                    p: 2,
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                }}
            >
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp size={14} aria-hidden="true" />
                    Success Rate: <Box component="span" sx={{ color: '#f1f5f9', fontWeight: 700 }}>{successRate}%</Box>
                </Typography>
                <Box component="span" sx={{ color: '#475569' }} aria-hidden="true">|</Box>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Plugins: <Box component="span" sx={{ color: '#60a5fa', fontWeight: 700 }}>{overview.totalPlugins}</Box></Typography>
                <Box component="span" sx={{ color: '#475569' }} aria-hidden="true">|</Box>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Migrations: <Box component="span" sx={{ color: '#818cf8', fontWeight: 700 }}>{overview.totalMigrations}</Box></Typography>
                <Box component="span" sx={{ color: '#475569' }} aria-hidden="true">|</Box>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Recipes: <Box component="span" sx={{ color: '#c084fc', fontWeight: 700 }}>{summary.recipes.length}</Box></Typography>
            </Box>
        </Box>
    );
};
