import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { colors } from '../../theme';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '12px',
        bgcolor: alpha(colors.error.main, 0.1),
        border: `1px solid ${colors.error.light}`,
      }}
    >
      <FiAlertTriangle size={20} color={colors.error.light} />
      <Typography sx={{ flex: 1, color: colors.error.detail }}>{message}</Typography>
      {onRetry && (
        <Button
          size="small"
          onClick={onRetry}
          startIcon={<FiRefreshCw size={14} />}
          sx={{
            color: colors.error.light,
            borderColor: colors.error.light,
            '&:hover': {
              bgcolor: alpha(colors.error.main, 0.2),
              borderColor: colors.error.light,
            },
          }}
          variant="outlined"
        >
          Retry
        </Button>
      )}
    </Box>
  );
}
