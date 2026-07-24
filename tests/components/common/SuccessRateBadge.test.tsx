import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuccessRateBadge from '../../../src/components/common/SuccessRateBadge';

describe('SuccessRateBadge', () => {
  it('renders "High" tier for rate >= 80%', () => {
    render(<SuccessRateBadge rate={92.5} />);
    expect(screen.getByText('High (92.5%)')).toBeDefined();
    console.log('  rate=92.5 -> "High (92.5%)"');
  });

  it('renders "Medium" tier for rate >= 50% and < 80%', () => {
    render(<SuccessRateBadge rate={65} />);
    expect(screen.getByText('Medium (65.0%)')).toBeDefined();
    console.log('  rate=65 -> "Medium (65.0%)"');
  });

  it('renders "Low" tier for rate > 0% and < 50%', () => {
    render(<SuccessRateBadge rate={23.7} />);
    expect(screen.getByText('Low (23.7%)')).toBeDefined();
    console.log('  rate=23.7 -> "Low (23.7%)"');
  });

  it('renders "Low" tier for rate = 0', () => {
    render(<SuccessRateBadge rate={0} />);
    expect(screen.getByText('Low (0.0%)')).toBeDefined();
    console.log('  rate=0 -> "Low (0.0%)"');
  });

  it('renders at boundary: 80% is "High"', () => {
    render(<SuccessRateBadge rate={80} />);
    expect(screen.getByText('High (80.0%)')).toBeDefined();
    console.log('  rate=80 -> "High (80.0%)"');
  });

  it('renders at boundary: 50% is "Medium"', () => {
    render(<SuccessRateBadge rate={50} />);
    expect(screen.getByText('Medium (50.0%)')).toBeDefined();
    console.log('  rate=50 -> "Medium (50.0%)"');
  });

  it('renders small size variant', () => {
    const { container } = render(<SuccessRateBadge rate={90} size="small" />);
    expect(screen.getByText('High (90.0%)')).toBeDefined();
    expect(container.firstChild).toBeDefined();
    console.log('  rate=90, size="small" -> "High (90.0%)"');
  });

  it('renders medium size variant (default)', () => {
    const { container } = render(<SuccessRateBadge rate={55} />);
    expect(screen.getByText('Medium (55.0%)')).toBeDefined();
    expect(container.firstChild).toBeDefined();
    console.log('  rate=55, size="medium" (default) -> "Medium (55.0%)"');
  });
});
