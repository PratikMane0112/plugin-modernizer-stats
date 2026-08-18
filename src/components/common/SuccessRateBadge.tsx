import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme';
import type { RateTier } from '../../util/recipeStatus';
import { getRateTier } from '../../util/recipeStatus';

const TIER_CONFIG: Record<RateTier, { label: string; color: string }> = {
  high: { label: 'High', color: colors.success.light },
  medium: { label: 'Medium', color: colors.warning.dark },
  low: { label: 'Low', color: colors.error.light },
};

interface SuccessRateBadgeProps {
  rate: number;
  size?: 'small' | 'medium';
}

export default function SuccessRateBadge({ rate, size = 'medium' }: SuccessRateBadgeProps) {
  const tier = getRateTier(rate);
  const { label, color } = TIER_CONFIG[tier];
  const isSmall = size === 'small';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: isSmall ? 1 : 1.5,
        py: isSmall ? 0.25 : 0.5,
        borderRadius: '6px',
        bgcolor: alpha(color, 0.15),
        border: `1px solid ${alpha(color, 0.3)}`,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: isSmall ? '0.75rem' : '0.875rem',
          fontWeight: 600,
          color,
          lineHeight: 1.4,
        }}
      >
        {label} ({rate.toFixed(1)}%)
      </Typography>
    </Box>
  );
}
