import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../../src/components/common/ErrorBoundary';

function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeDefined();
    console.log('  ErrorBoundary : renders children normally');
  });

  it('renders error message when error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Something went wrong')} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    console.log('  ErrorBoundary : shows error message in ErrorBanner');
  });

  it('renders chunk load error UI for ChunkLoadError', () => {
    const chunkError = new Error('Loading chunk 123 failed');
    chunkError.name = 'ChunkLoadError';

    render(
      <ErrorBoundary>
        <ThrowingComponent error={chunkError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('A new version is available')).toBeDefined();
    expect(screen.getByText('Reload')).toBeDefined();
    console.log('  ErrorBoundary : chunk load error shows reload UI');
  });

  it('detects dynamic import failure as chunk load error', () => {
    const moduleError = new Error('Failed to fetch dynamically imported module');

    render(
      <ErrorBoundary>
        <ThrowingComponent error={moduleError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('A new version is available')).toBeDefined();
    console.log('  ErrorBoundary : dynamic import failure treated as chunk load error');
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom fallback UI</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowingComponent error={new Error('fail')} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback UI')).toBeDefined();
    expect(screen.queryByText('fail')).toBeNull();
    console.log('  ErrorBoundary : renders custom fallback instead of default');
  });
});
