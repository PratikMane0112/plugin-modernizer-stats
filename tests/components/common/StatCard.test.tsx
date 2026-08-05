import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatCard from '../../../src/components/common/StatCard';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard value={431} label="Total Plugins" icon={<span>icon</span>} color="#3b82f6" />);

    expect(screen.getByText('431')).toBeDefined();
    expect(screen.getByText('Total Plugins')).toBeDefined();
    console.log('  StatCard : renders value and label');
  });

  it('renders description when provided', () => {
    render(
      <StatCard
        value="59.22%"
        label="Success Rate"
        description="Overall rate"
        icon={<span>icon</span>}
        color="#10b981"
      />
    );

    expect(screen.getByText('Overall rate')).toBeDefined();
    console.log('  StatCard : renders description');
  });

  it('renders as clickable button when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<StatCard value="5" label="Active" icon={<span>icon</span>} color="#3b82f6" onClick={handleClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    console.log('  StatCard : clickable and fires onClick');
  });

  it('renders as non-interactive div when onClick is not provided', () => {
    render(<StatCard value="10" label="Count" icon={<span>icon</span>} color="#3b82f6" />);

    expect(screen.queryByRole('button')).toBeNull();
    console.log('  StatCard : non-clickable without onClick');
  });
});
