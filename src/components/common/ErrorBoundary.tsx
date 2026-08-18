import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme';

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

function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.message.includes('Network request failed')
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

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
            bgcolor: alpha(colors.warning.dark, 0.1),
            border: `1px solid ${colors.warning.light}`,
          }}
        >
          <Typography sx={{ color: colors.warning.light, fontWeight: 600 }}>A new version is available</Typography>
          <Typography sx={{ color: colors.text.muted }}>
            The application has been updated. Please reload the page.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              color: colors.warning.light,
              borderColor: colors.warning.light,
              '&:hover': {
                bgcolor: alpha(colors.warning.dark, 0.2),
                borderColor: colors.warning.light,
              },
            }}
          >
            Reload
          </Button>
        </Box>
      );
    }

    if (this.state.error && isNetworkError(this.state.error)) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
            borderRadius: '12px',
            bgcolor: alpha(colors.error.light, 0.1),
            border: `1px solid ${colors.error.light}`,
          }}
        >
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}fire-jenkins.svg`}
            alt="Error"
            sx={{ width: 120, height: 'auto' }}
          />
          <Typography sx={{ color: colors.text.dark, fontWeight: 600, fontSize: '1.1rem' }}>
            Unable to load data
          </Typography>
          <Typography sx={{ color: colors.text.muted, textAlign: 'center', maxWidth: 400 }}>
            There was a problem connecting to the server. Please check your internet connection and try again.
          </Typography>
          <Button
            variant="outlined"
            onClick={this.handleReset}
            sx={{
              color: colors.primary.light,
              borderColor: colors.primary.light,
              '&:hover': {
                bgcolor: alpha(colors.primary.dark, 0.2),
                borderColor: colors.primary.light,
              },
            }}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 4,
          borderRadius: '12px',
          bgcolor: alpha(colors.error.light, 0.1),
          border: `1px solid ${colors.error.light}`,
        }}
      >
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}fire-jenkins.svg`}
          alt="Error"
          sx={{ width: 120, height: 'auto' }}
        />
        <Typography sx={{ color: colors.text.dark, fontWeight: 600, fontSize: '1.1rem' }}>
          Something went wrong
        </Typography>
        <Typography sx={{ color: colors.text.muted, textAlign: 'center', maxWidth: 400 }}>
          An unexpected error occurred while rendering this page. Please try again or navigate back to the homepage.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={this.handleReset}
            sx={{
              color: colors.primary.light,
              borderColor: colors.primary.light,
              '&:hover': {
                bgcolor: alpha(colors.primary.dark, 0.2),
                borderColor: colors.primary.light,
              },
            }}
          >
            Try again
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              window.location.href = import.meta.env.BASE_URL;
            }}
            sx={{
              color: colors.text.muted,
              borderColor: colors.border.default,
              '&:hover': {
                bgcolor: alpha(colors.primary.dark, 0.1),
                borderColor: colors.border.hover,
              },
            }}
          >
            Go to homepage
          </Button>
        </Box>
      </Box>
    );
  }
}
