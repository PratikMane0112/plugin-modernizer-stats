import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from '../../../src/components/common/ErrorBanner';

describe('ErrorBanner', () => {
  it('displays the error message and default title', () => {
    render(<ErrorBanner message="Failed to load plugin data" />);
    expect(screen.getByText('Failed to load plugin data')).toBeDefined();
    expect(screen.getByText('Unable to fetch data')).toBeDefined();
    console.log(`  mock data   : message="Failed to load plugin data"`);
    console.log(`  ErrorBanner : rendered title and message text`);
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error occurred" onRetry={onRetry} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeDefined();
    console.log(`  mock data   : onRetry=provided`);
    console.log(`  ErrorBanner : retry button visible`);
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error occurred" onRetry={onRetry} />);

    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    console.log(`  mock data   : clicked retry button`);
    console.log(`  ErrorBanner : onRetry called ${onRetry.mock.calls.length} time(s)`);
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorBanner message="Error occurred" />);
    expect(screen.queryByText('Retry')).toBeNull();
    console.log(`  mock data   : onRetry=undefined`);
    console.log(`  ErrorBanner : retry button hidden`);
  });
});
