import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { RecipeReport } from '../../types';
import { colors } from '../../theme';

interface RecipeTimelineProps {
  recipe: RecipeReport;
}

export default function RecipeTimeline({ recipe }: RecipeTimelineProps) {
  const chartOption = useMemo(() => {
    const buckets = new Map<string, { success: number; fail: number }>();

    for (const p of recipe.plugins) {
      const month = p.timestamp.slice(0, 7);
      const entry = buckets.get(month) ?? { success: 0, fail: 0 };
      if (p.status === 'success') entry.success++;
      else if (p.status === 'fail') entry.fail++;
      buckets.set(month, entry);
    }

    if (buckets.size === 0) return null;

    const months = [...buckets.keys()].sort();
    const successData = months.map((m) => buckets.get(m)!.success);
    const failData = months.map((m) => buckets.get(m)!.fail);

    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { color: colors.text.muted, rotate: 45 },
      },
      yAxis: { type: 'value', axisLabel: { color: colors.text.muted } },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          data: successData,
          itemStyle: { color: colors.success.light },
        },
        {
          name: 'Failed',
          type: 'bar',
          stack: 'total',
          data: failData,
          itemStyle: { color: colors.error.light },
        },
      ],
    };
  }, [recipe.plugins]);

  if (!chartOption) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        p: 3,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
      }}
    >
      <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark, mb: 2 }}>
        Application Timeline
      </Typography>
      <ReactECharts option={chartOption} style={{ height: '300px' }} theme="dark" />
    </Box>
  );
}
