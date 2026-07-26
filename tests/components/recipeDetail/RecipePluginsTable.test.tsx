import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { RecipeReport } from '../../../src/types';
import RecipePluginsTable from '../../../src/components/recipeDetail/RecipePluginsTable';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const addCodeOwnerPlugins: RecipeReport['plugins'] = [
  { pluginName: 'build-blocker-plugin', status: 'success', timestamp: '2026-01-12T17-19-54' },
  { pluginName: 'probely-security', status: 'success', timestamp: '2025-09-02T15-43-31' },
  { pluginName: 'ec2-fleet', status: 'success', timestamp: '2025-07-29T16-31-26' },
  { pluginName: 'syslog-logger', status: 'fail', timestamp: '2025-07-07T08-14-40' },
  { pluginName: 'pipeline-keep-running-step', status: '', timestamp: '2025-06-24T07-19-20' },
];

const addCodeOwnerRecipe: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
  totalApplications: 13,
  successCount: 11,
  failureCount: 1,
  plugins: addCodeOwnerPlugins,
};

function renderTable(recipe: RecipeReport = addCodeOwnerRecipe) {
  return render(
    <MemoryRouter>
      <RecipePluginsTable recipe={recipe} />
    </MemoryRouter>,
  );
}

describe('RecipePluginsTable', () => {
  it('renders the section title with plugin count', () => {
    renderTable();
    expect(screen.getByText('Affected Plugins (5)')).toBeDefined();
    console.log('  RecipePluginsTable : "Affected Plugins (5)" rendered');
  });

  it('renders table headers', () => {
    renderTable();
    expect(screen.getByText('Plugin')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Date')).toBeDefined();
    console.log('  RecipePluginsTable : Plugin, Status, Date headers rendered');
  });

  it('renders all real AddCodeOwner plugin names', () => {
    renderTable();
    expect(screen.getByText('build-blocker-plugin')).toBeDefined();
    expect(screen.getByText('probely-security')).toBeDefined();
    expect(screen.getByText('ec2-fleet')).toBeDefined();
    expect(screen.getByText('syslog-logger')).toBeDefined();
    expect(screen.getByText('pipeline-keep-running-step')).toBeDefined();
    console.log('  RecipePluginsTable : all 5 real plugin names rendered');
  });

  it('shows correct status chips for each status type', () => {
    renderTable();
    expect(screen.getAllByText('\u2713 Success').length).toBe(3);
    expect(screen.getByText('\u2717 Failed')).toBeDefined();
    expect(screen.getByText('? Unknown')).toBeDefined();
    console.log('  RecipePluginsTable : 3x Success, 1x Failed, 1x Unknown');
  });

  it('sorts plugins by timestamp descending (newest first)', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows[0].textContent).toContain('build-blocker-plugin');
    expect(dataRows[1].textContent).toContain('probely-security');
    expect(dataRows[2].textContent).toContain('ec2-fleet');
    expect(dataRows[3].textContent).toContain('syslog-logger');
    expect(dataRows[4].textContent).toContain('pipeline-keep-running-step');
    console.log('  RecipePluginsTable : sorted newest first (2026-01 > 2025-09 > 2025-07 > 2025-07 > 2025-06)');
  });

  it('navigates to plugin detail on row click', () => {
    mockNavigate.mockClear();
    renderTable();
    fireEvent.click(screen.getByText('build-blocker-plugin'));
    expect(mockNavigate).toHaveBeenCalledWith('/plugins/build-blocker-plugin');
    console.log('  RecipePluginsTable : row click navigates to /plugins/build-blocker-plugin');
  });

  it('returns null when plugins array is empty', () => {
    const empty: RecipeReport = { ...addCodeOwnerRecipe, plugins: [] };
    const { container } = renderTable(empty);
    expect(container.innerHTML).toBe('');
    console.log('  RecipePluginsTable : returns null for empty plugins');
  });

  it('formats real timestamps as dates', () => {
    renderTable();
    expect(screen.getByText('2026-01-12')).toBeDefined();
    expect(screen.getByText('2025-09-02')).toBeDefined();
    expect(screen.getByText('2025-07-29')).toBeDefined();
    expect(screen.getByText('2025-07-07')).toBeDefined();
    expect(screen.getByText('2025-06-24')).toBeDefined();
    console.log('  RecipePluginsTable : all 5 real timestamps formatted as YYYY-MM-DD');
  });
});
