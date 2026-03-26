import { Component, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary for catching errors from React.lazy chunk load failures
 * and render errors in lazy-loaded route components.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const isChunkError =
                this.state.error?.message?.includes('Loading chunk') ||
                this.state.error?.message?.includes('Failed to fetch dynamically imported module');

            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', p: 4 }}>
                    <Box sx={{ bgcolor: '#1e2329', borderRadius: '12px', border: '1px solid #1e293b', p: 4, textAlign: 'center', maxWidth: 400 }}>
                        <AlertTriangle style={{ width: 48, height: 48, color: '#fbbf24', margin: '0 auto 16px' }} />
                        <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600, mb: 1 }}>
                            {isChunkError ? 'Failed to Load Page' : 'Something Went Wrong'}
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 3 }}>
                            {isChunkError
                                ? 'The page failed to load. This usually happens due to a network issue. Please try again.'
                                : this.props.fallbackMessage ?? 'An unexpected error occurred while rendering this page.'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                            <Button
                                onClick={this.handleRetry}
                                startIcon={<RefreshCw size={16} />}
                                sx={{
                                    bgcolor: '#2563eb',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    '&:hover': { bgcolor: '#3b82f6' },
                                }}
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                sx={{
                                    bgcolor: '#334155',
                                    color: '#e2e8f0',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    '&:hover': { bgcolor: '#475569' },
                                }}
                            >
                                Reload Page
                            </Button>
                        </Box>
                    </Box>
                </Box>
            );
        }

        return this.props.children;
    }
}
