import Box from '@mui/material/Box';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import PercentOutlined from '@mui/icons-material/PercentOutlined';
import { colors } from '../../theme';
import StatCard from '../common/StatCard';

const ICON_SIZE = 24;

interface MigrationSummaryCardsProps {
  totalMigrations: number;
  successCount: number;
  failCount: number;
}

export default function MigrationSummaryCards({
  totalMigrations,
  successCount,
  failCount,
}: MigrationSummaryCardsProps) {
  const successRate = totalMigrations > 0 ? ((successCount / totalMigrations) * 100).toFixed(1) : '0.0';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      <StatCard
        value={totalMigrations}
        label="Total"
        description="All migrations run"
        icon={<SwapHorizOutlined sx={{ fontSize: ICON_SIZE }} />}
        color={colors.primary.dark}
      />
      <StatCard
        value={successCount}
        label="Passed"
        description="Migrations succeeded"
        icon={<CheckCircleOutlined sx={{ fontSize: ICON_SIZE }} />}
        color={colors.success.light}
      />
      <StatCard
        value={failCount}
        label="Failed"
        description="Migrations failed"
        icon={<CancelOutlined sx={{ fontSize: ICON_SIZE }} />}
        color={colors.error.light}
      />
      <StatCard
        value={`${successRate}%`}
        label="Success Rate"
        description="Overall pass percentage"
        icon={<PercentOutlined sx={{ fontSize: ICON_SIZE }} />}
        color={colors.cyan.dark}
      />
    </Box>
  );
}
