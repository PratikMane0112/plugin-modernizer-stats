import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import type { ReportJson, RecipeReport, RecipeStats } from '../types';
import { colors } from '../theme';

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Box
    sx={{
      bgcolor: colors.bg.paper,
      p: { xs: 2, sm: 3 },
      borderRadius: '12px',
      border: `1px solid ${colors.border.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      height: '100%',
      transition: 'transform 0.15s, border-color 0.15s',
      '&:hover': { transform: 'scale(1.02)', borderColor: colors.border.hover },
    }}
  >
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
          fontWeight: 500,
          color: colors.text.secondary,
          mb: 0.25,
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: colors.text.primary }}>
        {value}
      </Typography>
      {subtitle && <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted, mt: 0.25 }}>{subtitle}</Typography>}
    </Box>
    <Box
      aria-hidden="true"
      sx={{
        p: { xs: 1, sm: 1.5 },
        borderRadius: '50%',
        bgcolor: `${color}55`,
        border: `1px solid ${color}88`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color,
        '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 24 } },
      }}
    >
      {icon}
    </Box>
  </Box>
);

export default function Dashboard() {
  const [, retry] = useReducer((x: number) => x + 1, 0);
  const [data, setData] = useState<ReportJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/report.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json: ReportJson = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const overview = data?.overview ?? null;
  const successRate = overview ? overview.successRate.toFixed(1) : '0';

  const recipesArray: RecipeReport[] = useMemo(() => {
    if (!data?.recipes) return [];
    return Object.values(data.recipes);
  }, [data]);

  const recipesStats: RecipeStats[] = useMemo(() => {
    return recipesArray.map((r) => ({
      recipeId: r.recipeId,
      total: r.totalApplications,
      success: r.successCount,
      fail: r.failureCount,
      pending: 0,
    }));
  }, [recipesArray]);

  const handleRetry = useCallback(() => {
    retry();
    window.location.reload();
  }, []);

  const migrationStatusOption = useMemo(() => {
    if (!overview) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: colors.bg.paper, borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: [
            { value: overview.successfulMigrations, name: 'Success', itemStyle: { color: colors.success.main } },
            { value: overview.failedMigrations, name: 'Failed', itemStyle: { color: colors.error.main } },
          ],
        },
      ],
    };
  }, [overview]);

  const topRecipesOption = useMemo(() => {
    if (recipesStats.length === 0) return {};
    const sorted = [...recipesStats].sort((a, b) => b.total - a.total).slice(0, 10);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: colors.text.secondary } },
      yAxis: {
        type: 'category',
        data: sorted.map((r) => r.recipeId.split('.').pop() ?? r.recipeId),
        axisLabel: { color: colors.text.secondary, width: 160, overflow: 'truncate' },
      },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          data: sorted.map((r) => r.success),
          itemStyle: { color: colors.success.light },
        },
        {
          name: 'Failures',
          type: 'bar',
          stack: 'total',
          data: sorted.map((r) => r.fail),
          itemStyle: { color: colors.error.light },
        },
      ],
    };
  }, [recipesStats]);

  const timelineOption = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return null;
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.timeline.map((t) => t.month),
        axisLabel: { color: colors.text.secondary, rotate: 45 },
      },
      yAxis: { type: 'value', axisLabel: { color: colors.text.secondary } },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          data: data.timeline.map((t) => t.success),
          itemStyle: { color: colors.success.light },
        },
        {
          name: 'Failed',
          type: 'bar',
          stack: 'total',
          data: data.timeline.map((t) => t.fail),
          itemStyle: { color: colors.error.light },
        },
      ],
    };
  }, [data]);

  const tagsOption = useMemo(() => {
    if (!data?.tags || data.tags.length === 0) return null;
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      series: [
        {
          name: 'Tags',
          type: 'pie',
          radius: ['35%', '65%'],
          roseType: 'area',
          itemStyle: { borderRadius: 8, borderColor: colors.bg.paper, borderWidth: 2 },
          label: { show: true, color: colors.text.secondary, fontSize: 11 },
          data: data.tags.map((t, i) => ({
            value: t.count,
            name: t.tag,
            itemStyle: { color: colors.chart.tagsPalette[i % colors.chart.tagsPalette.length] },
          })),
        },
      ],
    };
  }, [data]);

  const topFailingRecipes = useMemo(() => {
    if (!data?.failuresByRecipe || !data?.recipes) return [];
    return data.failuresByRecipe.slice(0, 8).map((entry) => {
      const recipe = data.recipes[entry.recipeId];
      return {
        recipeId: entry.recipeId,
        failures: entry.failures,
        successCount: recipe?.successCount ?? 0,
        failureCount: recipe?.failureCount ?? entry.failures,
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={50} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ flex: '1 1 160px', minWidth: 0 }}>
              <Skeleton variant="rounded" height={90} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 340px' }}>
            <Skeleton variant="rounded" height={400} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
          </Box>
          <Box sx={{ flex: '1 1 340px' }}>
            <Skeleton variant="rounded" height={400} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !data || !overview) {
    return (
      <Box
        sx={{
          bgcolor: colors.bg.paper,
          border: `1px solid ${colors.error.main}`,
          borderRadius: '12px',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ color: colors.error.light }}>{error ?? 'Failed to load data'}</Typography>
        <Box
          component="button"
          onClick={handleRetry}
          sx={{
            bgcolor: colors.error.main,
            color: colors.white,
            border: 'none',
            borderRadius: '8px',
            px: 2,
            py: 1,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Retry
        </Box>
      </Box>
    );
  }

  const cardSx = {
    bgcolor: colors.bg.paper,
    p: 3,
    borderRadius: '12px',
    border: `1px solid ${colors.border.default}`,
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
          background: `linear-gradient(to right, ${colors.primary.main}1a, ${colors.secondary.main}1a)`,
          border: `1px solid ${colors.primary.main}33`,
          borderRadius: '12px',
          px: 3,
          py: 1.5,
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeOutlined sx={{ fontSize: 16, color: colors.primary.light }} />
          <Typography sx={{ fontSize: '0.875rem', color: colors.text.body }}>
            Data generated:{' '}
            <Box component="span" sx={{ fontWeight: 600, color: colors.text.primary }}>
              {new Date(data.generatedAt).toLocaleString()}
            </Box>
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted }}>
          Source:{' '}
          <MuiLink
            href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary.light }}
          >
            metadata-plugin-modernizer
          </MuiLink>
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {[
          {
            title: 'Total Plugins',
            value: overview.totalPlugins,
            icon: <Inventory2Outlined />,
            color: colors.primary.main,
          },
          {
            title: 'Total Migrations',
            value: overview.totalMigrations,
            icon: <AccountTreeOutlined />,
            color: colors.accent.indigo,
          },
          {
            title: 'Successful Migrations',
            value: overview.successfulMigrations,
            icon: <CheckCircleOutlined />,
            color: colors.success.main,
          },
          {
            title: 'Failed Migrations',
            value: overview.failedMigrations,
            icon: <CancelOutlined />,
            color: colors.error.main,
          },
        ].map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </Box>

      {/* Charts row: Migration Status + Recipe Performance */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
          <Box sx={cardSx}>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary, mb: 2 }}>
              Migration Status
            </Typography>
            <ReactECharts option={migrationStatusOption} style={{ height: '350px' }} theme="dark" />
          </Box>
        </Box>
        <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
          <Box sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary }}>
                Recipe Performance
              </Typography>
              <MuiLink
                component={Link}
                to="/recipes"
                sx={{
                  fontSize: '0.875rem',
                  color: colors.primary.light,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View all &rarr;
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
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary, mb: 2 }}>
              Migration Timeline
            </Typography>
            {timelineOption ? (
              <ReactECharts option={timelineOption} style={{ height: '400px' }} theme="dark" />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                  color: colors.text.muted,
                  fontSize: '0.875rem',
                }}
              >
                Historical timeline data not yet available.
              </Box>
            )}
          </Box>
        </Box>
        {tagsOption && (
          <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
            <Box sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LabelOutlined sx={{ fontSize: 18, color: colors.primary.light }} />
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary }}>
                  Migration Tags
                </Typography>
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
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary }}>
              Recipes with Most Failures
            </Typography>
            <MuiLink
              component={Link}
              to="/recipes"
              sx={{
                fontSize: '0.875rem',
                color: colors.primary.light,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View all &rarr;
            </MuiLink>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {topFailingRecipes.map((recipe) => {
              const shortName = recipe.recipeId.split('.').pop() ?? recipe.recipeId;
              const completed = recipe.successCount + recipe.failureCount;
              const successPct = completed > 0 ? (recipe.successCount / completed) * 100 : 0;
              const failPct = completed > 0 ? (recipe.failureCount / completed) * 100 : 0;
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
                      bgcolor: colors.bg.default,
                      borderRadius: '8px',
                      border: `1px solid ${colors.border.default}`,
                      textDecoration: 'none',
                      transition: 'border-color 0.15s, background 0.15s',
                      '&:hover': { borderColor: `${colors.error.main}66`, bgcolor: colors.bg.hoverSubtle },
                    }}
                  >
                    <Typography
                      title={shortName}
                      sx={{
                        color: colors.text.emphasis,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {shortName}
                    </Typography>
                    <Box
                      role="progressbar"
                      aria-label={`${successPct.toFixed(0)}% success, ${failPct.toFixed(0)}% failure`}
                      sx={{ width: '100%', height: 6, borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}
                    >
                      <Box sx={{ height: '100%', bgcolor: colors.success.light, width: `${successPct}%` }} />
                      <Box sx={{ height: '100%', bgcolor: colors.error.main, width: `${failPct}%` }} />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography
                          component="span"
                          sx={{ color: colors.success.light, fontWeight: 500, fontSize: 'inherit' }}
                        >
                          &#10003; {recipe.successCount}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ color: colors.error.light, fontWeight: 500, fontSize: 'inherit' }}
                        >
                          &#10007; {recipe.failureCount}
                        </Typography>
                      </Box>
                      <Typography
                        component="span"
                        sx={{ color: colors.text.muted, fontSize: 'inherit', flexShrink: 0 }}
                      >
                        {successPct.toFixed(0)}% success
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
          background: `linear-gradient(to right, ${colors.border.default}80, ${colors.bg.default}80)`,
          p: 2,
          borderRadius: '12px',
          border: `1px solid ${colors.border.default}`,
          display: { xs: 'grid', sm: 'flex' },
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: { xs: 1.5, sm: 3 },
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            color: colors.text.secondary,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <TrendingUpOutlined sx={{ fontSize: 14 }} />
          Success :{' '}
          <Box component="span" sx={{ color: colors.text.primary, fontWeight: 700 }}>
            {successRate}%
          </Box>
        </Typography>
        <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
          |
        </Box>
        <Typography sx={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
          Plugins:{' '}
          <Box component="span" sx={{ color: colors.primary.light, fontWeight: 700 }}>
            {overview.totalPlugins}
          </Box>
        </Typography>
        <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
          |
        </Box>
        <Typography sx={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
          Migrations:{' '}
          <Box component="span" sx={{ color: colors.accent.indigoLight, fontWeight: 700 }}>
            {overview.totalMigrations}
          </Box>
        </Typography>
        <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
          |
        </Box>
        <Typography sx={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
          Recipes:{' '}
          <Box component="span" sx={{ color: colors.secondary.light, fontWeight: 700 }}>
            {recipesArray.length}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
