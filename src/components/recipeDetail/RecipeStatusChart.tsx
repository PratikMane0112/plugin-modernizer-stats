import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { RecipeReport } from '../../types';
import { colors } from '../../theme';

interface RecipeStatusChartProps {
  recipe: RecipeReport;
}

export default function RecipeStatusChart({ recipe }: RecipeStatusChartProps) {
  const chartOption = useMemo(() => {
    const { successCount, failureCount, totalApplications } = recipe;
    const other = totalApplications - successCount - failureCount;

    const data: { value: number; name: string; itemStyle: { color: string } }[] = [
      { value: successCount, name: 'Success', itemStyle: { color: colors.success.light } },
      { value: failureCount, name: 'Failed', itemStyle: { color: colors.error.light } },
    ];

    if (other > 0) {
      data.push({ value: other, name: 'Other', itemStyle: { color: colors.neutral } });
    }

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            color: colors.text.muted,
            formatter: '{d}%',
          },
          data,
        },
      ],
    };
  }, [recipe]);

  if (recipe.totalApplications === 0) return null;

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
        Application Status
      </Typography>
      <ReactECharts option={chartOption} style={{ height: '300px' }} theme="dark" />
    </Box>
  );
}
