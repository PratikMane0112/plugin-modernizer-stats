import { Component, type ReactNode } from 'react';
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
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <div className="bg-[#1e2329] rounded-xl border border-slate-800 p-8 text-center max-w-md">
                        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-white mb-2">
                            {isChunkError ? 'Failed to Load Page' : 'Something Went Wrong'}
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {isChunkError
                                ? 'The page failed to load. This usually happens due to a network issue. Please try again.'
                                : this.props.fallbackMessage ?? 'An unexpected error occurred while rendering this page.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
