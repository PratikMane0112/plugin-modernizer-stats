import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme';
import ErrorBanner from './ErrorBanner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk')
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    if (this.state.error && isChunkLoadError(this.state.error)) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
            borderRadius: '12px',
            bgcolor: alpha(colors.warning.main, 0.1),
            border: `1px solid ${colors.warning.light}`,
          }}
        >
          <Typography sx={{ color: colors.warning.light, fontWeight: 600 }}>A new version is available</Typography>
          <Typography sx={{ color: colors.text.secondary }}>
            The application has been updated. Please reload the page.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              color: colors.warning.light,
              borderColor: colors.warning.light,
              '&:hover': {
                bgcolor: alpha(colors.warning.main, 0.2),
                borderColor: colors.warning.light,
              },
            }}
          >
            Reload
          </Button>
        </Box>
      );
    }

    return <ErrorBanner message={this.state.error?.message ?? 'An unexpected error occurred'} />;
  }
}
