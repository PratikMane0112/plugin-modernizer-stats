import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { PluginStatusColor } from '../../types';
import { statusColorMap, statusDefaultLabels } from '../../theme';

interface StatusBadgeProps {
  status: PluginStatusColor;
  label?: string;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, label, size = 'medium' }: StatusBadgeProps) {
  const color = statusColorMap[status];
  const displayLabel = label ?? statusDefaultLabels[status];
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
        {displayLabel}
      </Typography>
    </Box>
  );
}
