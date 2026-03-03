import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center" role="alert">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
        <p className="text-red-400 text-lg mb-2">Failed to load data</p>
        <p className="text-red-300 text-sm mb-4">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
                aria-label="Retry loading data"
            >
                <RefreshCw size={16} aria-hidden="true" />
                Retry
            </button>
        )}
    </div>
);
