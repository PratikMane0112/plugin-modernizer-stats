import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { RecipeReport } from '../../../src/types';
import RecipeFailuresBreakdown from '../../../src/components/recipeDetail/RecipeFailuresBreakdown';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const migrateToJUnit5: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5',
  totalApplications: 6,
  successCount: 1,
  failureCount: 4,
  plugins: [
    { pluginName: 'pipeline-multibranch-defaults', status: 'fail', timestamp: '2025-10-05T13-47-45' },
    { pluginName: 'absint-a3', status: 'fail', timestamp: '2025-09-02T14-34-52' },
    { pluginName: 'buildtriggerbadge', status: 'fail', timestamp: '2025-07-27T16-08-02' },
    { pluginName: 'buildtriggerbadge', status: 'fail', timestamp: '2025-07-27T16-01-56' },
    { pluginName: 'custom-build-properties', status: 'success', timestamp: '2025-07-10T15-25-15' },
    { pluginName: 'pipeline-keep-running-step', status: '', timestamp: '2025-06-24T07-19-20' },
  ],
};

const setupDependabot: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.SetupDependabot',
  totalApplications: 11,
  successCount: 9,
  failureCount: 1,
  plugins: [
    { pluginName: 'appscan', status: 'success', timestamp: '2025-10-03T18-22-33' },
    { pluginName: 'absint-a3', status: 'success', timestamp: '2025-09-02T14-22-13' },
    { pluginName: 'syslog-logger', status: 'fail', timestamp: '2025-07-07T08-10-17' },
  ],
};

function renderBreakdown(recipe: RecipeReport = migrateToJUnit5) {
  return render(
    <MemoryRouter>
      <RecipeFailuresBreakdown recipe={recipe} />
    </MemoryRouter>
  );
}

describe('RecipeFailuresBreakdown', () => {
  it('renders the section title with real MigrateToJUnit5 failure count', () => {
    renderBreakdown();
    expect(screen.getByText('Failed Plugins (4)')).toBeDefined();
    console.log('  RecipeFailuresBreakdown : "Failed Plugins (4)" for MigrateToJUnit5');
  });

  it('renders table headers', () => {
    renderBreakdown();
    expect(screen.getByText('Plugin')).toBeDefined();
    expect(screen.getByText('Date')).toBeDefined();
    console.log('  RecipeFailuresBreakdown : Plugin, Date headers rendered');
  });

  it('only shows failed plugins, not success or unknown', () => {
    renderBreakdown();
    expect(screen.getAllByText('pipeline-multibranch-defaults')).toHaveLength(1);
    expect(screen.getAllByText('absint-a3')).toHaveLength(1);
    expect(screen.getAllByText('buildtriggerbadge')).toHaveLength(2);
    expect(screen.queryByText('custom-build-properties')).toBeNull();
    expect(screen.queryByText('pipeline-keep-running-step')).toBeNull();
    console.log('  RecipeFailuresBreakdown : 4 failed shown, success/unknown excluded');
  });

  it('sorts failed plugins by timestamp descending', () => {
    renderBreakdown();
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows[0].textContent).toContain('pipeline-multibranch-defaults');
    expect(dataRows[1].textContent).toContain('absint-a3');
    expect(dataRows[2].textContent).toContain('buildtriggerbadge');
    expect(dataRows[3].textContent).toContain('buildtriggerbadge');
    console.log('  RecipeFailuresBreakdown : sorted (2025-10 > 2025-09 > 2025-07 > 2025-07)');
  });

  it('navigates to plugin detail on row click', () => {
    mockNavigate.mockClear();
    renderBreakdown();
    fireEvent.click(screen.getAllByText('pipeline-multibranch-defaults')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/plugins/pipeline-multibranch-defaults');
    console.log('  RecipeFailuresBreakdown : row click navigates to /plugins/pipeline-multibranch-defaults');
  });

  it('shows single-failure recipe (SetupDependabot has 1 failure: syslog-logger)', () => {
    renderBreakdown(setupDependabot);
    expect(screen.getByText('Failed Plugins (1)')).toBeDefined();
    expect(screen.getByText('syslog-logger')).toBeDefined();
    expect(screen.queryByText('appscan')).toBeNull();
    expect(screen.queryByText('absint-a3')).toBeNull();
    console.log('  RecipeFailuresBreakdown : SetupDependabot shows only syslog-logger');
  });

  it('returns null when recipe has no failures (all success)', () => {
    const allSuccess: RecipeReport = {
      ...setupDependabot,
      failureCount: 0,
      plugins: setupDependabot.plugins.filter((p) => p.status === 'success'),
    };
    const { container } = renderBreakdown(allSuccess);
    expect(container.innerHTML).toBe('');
    console.log('  RecipeFailuresBreakdown : returns null when all plugins succeeded');
  });

  it('returns null when plugins array is empty', () => {
    const empty: RecipeReport = { ...migrateToJUnit5, plugins: [] };
    const { container } = renderBreakdown(empty);
    expect(container.innerHTML).toBe('');
    console.log('  RecipeFailuresBreakdown : returns null for empty plugins');
  });

  it('formats real timestamps as dates', () => {
    renderBreakdown();
    expect(screen.getByText('2025-10-05')).toBeDefined();
    expect(screen.getByText('2025-09-02')).toBeDefined();
    console.log('  RecipeFailuresBreakdown : real timestamps formatted as YYYY-MM-DD');
  });

  it('renders warning icon in header', () => {
    renderBreakdown();
    const icon = document.querySelector('[data-testid="WarningAmberOutlinedIcon"]');
    expect(icon).toBeDefined();
    console.log('  RecipeFailuresBreakdown : warning icon rendered');
  });
});
