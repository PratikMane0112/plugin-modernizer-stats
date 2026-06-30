import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../../../src/components/pluginPage/StatusBadge';
import type { PluginStatusColor } from '../../../src/types';

const statusEntries: { status: PluginStatusColor; defaultLabel: string }[] = [
  { status: 'green', defaultLabel: 'Success' },
  { status: 'red', defaultLabel: 'Fail' },
  { status: 'blue', defaultLabel: 'Mostly Success' },
  { status: 'yellow', defaultLabel: 'Mostly Fail' },
  { status: 'white', defaultLabel: 'Unknown' },
];

describe('StatusBadge', () => {
  describe('default labels', () => {
    statusEntries.forEach(({ status, defaultLabel }) => {
      it(`renders "${defaultLabel}" for status="${status}"`, () => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(defaultLabel)).toBeDefined();
        console.log(`  status="${status}" -> label="${defaultLabel}"`);
      });
    });
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="green" label="All Good" />);
    expect(screen.getByText('All Good')).toBeDefined();
    expect(screen.queryByText('Success')).toBeNull();
    console.log(`  status="green", label="All Good" -> rendered "All Good"`);
  });

  it('renders small size variant', () => {
    const { container } = render(<StatusBadge status="red" size="small" />);
    expect(screen.getByText('Fail')).toBeDefined();
    expect(container.firstChild).toBeDefined();
    console.log(`  status="red", size="small" -> label="Fail"`);
  });

  it('renders medium size variant (default)', () => {
    const { container } = render(<StatusBadge status="blue" />);
    expect(screen.getByText('Mostly Success')).toBeDefined();
    expect(container.firstChild).toBeDefined();
    console.log(`  status="blue", size="medium" (default) -> label="Mostly Success"`);
  });
});
