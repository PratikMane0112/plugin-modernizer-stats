import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => (
    <Box
        role="alert"
        sx={{
            bgcolor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
        }}
    >
        <AlertTriangle
            style={{ width: 48, height: 48, color: '#f87171', margin: '0 auto 16px' }}
            aria-hidden="true"
        />
        <Typography sx={{ color: '#f87171', fontSize: '1.125rem', mb: 1 }}>
            Failed to load data
        </Typography>
        <Typography sx={{ color: '#fca5a5', fontSize: '0.875rem', mb: 2 }}>
            {message}
        </Typography>
        {onRetry && (
            <Button
                onClick={onRetry}
                aria-label="Retry loading data"
                startIcon={<RefreshCw size={16} aria-hidden="true" />}
                sx={{
                    bgcolor: 'rgba(239,68,68,0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(239,68,68,0.3)' },
                }}
            >
                Retry
            </Button>
        )}
    </Box>
);
