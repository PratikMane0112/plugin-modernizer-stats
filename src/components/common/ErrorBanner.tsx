import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { FiRefreshCw } from 'react-icons/fi';
import { colors } from '../../theme';

interface ErrorBannerProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, title = 'Unable to fetch data', onRetry }: ErrorBannerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
        py: 6,
        px: 3,
        borderRadius: '12px',
        bgcolor: alpha(colors.error.light, 0.05),
        border: `1px solid ${alpha(colors.error.light, 0.3)}`,
      }}
    >
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}fire-jenkins.svg`}
        alt="Error"
        sx={{ width: 180, height: 'auto' }}
      />
      <Typography sx={{ color: colors.text.dark, fontWeight: 700, fontSize: '1.25rem' }}>{title}</Typography>
      <Typography sx={{ color: colors.text.muted, fontSize: '0.95rem', maxWidth: 400 }}>{message}</Typography>
      {onRetry && (
        <Button
          size="medium"
          onClick={onRetry}
          startIcon={<FiRefreshCw size={16} />}
          sx={{
            mt: 1,
            color: colors.primary.light,
            borderColor: colors.primary.light,
            '&:hover': {
              bgcolor: alpha(colors.primary.dark, 0.2),
              borderColor: colors.primary.light,
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
