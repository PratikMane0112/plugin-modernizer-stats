import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { RecipeReport } from '../../src/types';

vi.mock('../../src/lib/dataClient', () => ({
  dataClient: {
    getAllRecipes: vi.fn(),
  },
}));

vi.mock('react-window', () => ({
  List: ({
    rowComponent: Row,
    rowCount,
    rowProps,
  }: {
    rowComponent: React.ComponentType<{ index: number; style: React.CSSProperties } & Record<string, unknown>>;
    rowCount: number;
    rowHeight: number;
    rowProps: Record<string, unknown>;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: rowCount }, (_, i) => (
        <Row key={i} index={i} style={{}} {...rowProps} />
      ))}
    </div>
  ),
}));

import { dataClient } from '../../src/lib/dataClient';
import RecipeList from '../../src/pages/RecipeList';

const mockClient = vi.mocked(dataClient);

function recipe(
  recipeId: string,
  totalApplications: number,
  successCount: number,
  failureCount: number,
  plugins: RecipeReport['plugins'] = []
): RecipeReport {
  return {
    recipeId,
    totalApplications,
    successCount,
    failureCount,
    plugins,
  };
}

const mockRecipes: RecipeReport[] = [
  recipe('io.jenkins.tools.pluginmodernizer.AddCodeOwner', 13, 11, 1, [
    { pluginName: 'build-blocker-plugin', status: 'success', timestamp: '2026-01-12T17-19-54' },
    { pluginName: 'syslog-logger', status: 'fail', timestamp: '2025-07-07T08-14-40' },
    { pluginName: 'pipeline-keep-running-step', status: '', timestamp: '2025-06-24T07-19-20' },
  ]),
  recipe('io.jenkins.tools.pluginmodernizer.SetupDependabot', 11, 9, 1, [
    { pluginName: 'appscan', status: 'success', timestamp: '2025-10-03T18-22-33' },
    { pluginName: 'absint-a3', status: 'success', timestamp: '2025-09-02T14-22-13' },
  ]),
  recipe('io.jenkins.tools.pluginmodernizer.UpgradeBomVersion', 4, 3, 0, [
    { pluginName: 'pipeline-lib-oras', status: 'success', timestamp: '2025-08-30T13-03-41' },
    { pluginName: 'pipeline-cps-oras', status: 'success', timestamp: '2025-08-30T13-01-25' },
  ]),
  recipe('io.jenkins.tools.pluginmodernizer.MigrateToJUnit5', 6, 1, 4, [
    { pluginName: 'pipeline-multibranch-defaults', status: 'fail', timestamp: '2025-10-05T13-47-45' },
    { pluginName: 'absint-a3', status: 'fail', timestamp: '2025-09-02T14-34-52' },
    { pluginName: 'buildtriggerbadge', status: 'fail', timestamp: '2025-07-27T16-08-02' },
  ]),
  recipe('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', 624, 102, 522, [
    { pluginName: 'mysql-api', status: 'success', timestamp: '2026-02-01T19-57-58' },
    { pluginName: 'zentimestamp', status: 'fail', timestamp: '2025-09-04T13-01-43' },
  ]),
];

function renderRecipeList() {
  return render(
    <MemoryRouter>
      <RecipeList />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecipeList', () => {
  it('shows skeleton while loading', () => {
    mockClient.getAllRecipes.mockReturnValue(new Promise(() => {}));

    renderRecipeList();

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  mock data    : loading (never resolves)`);
    console.log(`  RecipeList   : ${skeletons.length} skeleton elements rendered`);
  });

  it('renders recipe rows on successful data load', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    expect(screen.getByText('SetupDependabot')).toBeDefined();
    expect(screen.getByText('UpgradeBomVersion')).toBeDefined();
    expect(screen.getByText('MigrateToJUnit5')).toBeDefined();
    expect(screen.getByText('SetupJenkinsfile')).toBeDefined();
    expect(screen.getByText('5 total')).toBeDefined();
    console.log(`  mock data    : ${mockRecipes.length} recipes from report.json`);
    console.log(`  RecipeList   : all 5 short recipe names rendered, "5 total" shown`);
  });

  it('filters recipes by search text (case-insensitive)', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search a recipe…');
    fireEvent.change(searchInput, { target: { value: 'JUNIT' } });

    expect(screen.getByText('MigrateToJUnit5')).toBeDefined();
    expect(screen.queryByText('AddCodeOwner')).toBeNull();
    expect(screen.queryByText('SetupDependabot')).toBeNull();
    expect(screen.queryByText('SetupJenkinsfile')).toBeNull();
    expect(screen.queryByText('UpgradeBomVersion')).toBeNull();
    console.log(`  mock data    : search="JUNIT"`);
    console.log(`  RecipeList   : only MigrateToJUnit5 visible`);
  });

  it('filters recipes by "High Rate" tier (AddCodeOwner 84.62%, SetupDependabot 81.82%)', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const highCard = screen.getAllByText('High Rate').find((el) => el.closest('button'));
    expect(highCard).toBeDefined();
    fireEvent.click(highCard!);

    expect(screen.getByText('AddCodeOwner')).toBeDefined();
    expect(screen.getByText('SetupDependabot')).toBeDefined();
    expect(screen.queryByText('UpgradeBomVersion')).toBeNull();
    expect(screen.queryByText('MigrateToJUnit5')).toBeNull();
    expect(screen.queryByText('SetupJenkinsfile')).toBeNull();
    console.log(`  mock data    : tier filter="High Rate" (>=80%)`);
    console.log(`  RecipeList   : AddCodeOwner (84.62%) + SetupDependabot (81.82%) visible`);
  });

  it('shows ErrorBanner on error', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: false, error: 'Network error' });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('Unable to fetch data')).toBeDefined();
    });

    expect(screen.getByText('Retry')).toBeDefined();
    console.log(`  mock data    : getAllRecipes returns error`);
    console.log(`  RecipeList   : ErrorBanner displayed with "Unable to fetch data"`);
  });

  it('shows "No recipes found" when filters match nothing', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search a recipe…');
    fireEvent.change(searchInput, { target: { value: 'nonexistent-xyz' } });

    expect(screen.getByText('No recipes found')).toBeDefined();
    console.log(`  mock data    : search="nonexistent-xyz"`);
    console.log(`  RecipeList   : "No recipes found" message displayed`);
  });

  it('displays correct tier cards with real tier counts (high=2, medium=1, low=2)', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    expect(screen.getByText('High Rate')).toBeDefined();
    expect(screen.getByText('Medium Rate')).toBeDefined();
    expect(screen.getByText('Low Rate')).toBeDefined();
    expect(screen.queryByText('No Data')).toBeNull();

    const highCard = screen.getAllByText('High Rate').find((el) => el.closest('button'));
    fireEvent.click(highCard!);
    expect(screen.getByText('2 results')).toBeDefined();
    fireEvent.click(highCard!);

    const medCard = screen.getAllByText('Medium Rate').find((el) => el.closest('button'));
    fireEvent.click(medCard!);
    expect(screen.getByText('1 result')).toBeDefined();
    fireEvent.click(medCard!);

    const lowCard = screen.getAllByText('Low Rate').find((el) => el.closest('button'));
    fireEvent.click(lowCard!);
    expect(screen.getByText('2 results')).toBeDefined();
    fireEvent.click(lowCard!);

    console.log(`  RecipeList   : tier counts validated — high=2, medium=1, low=2, no "No Data" card`);
  });

  it('toggles tier filter off when active card is clicked again', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const highCard = screen.getAllByText('High Rate').find((el) => el.closest('button'));
    fireEvent.click(highCard!);

    expect(screen.queryByText('UpgradeBomVersion')).toBeNull();
    expect(screen.queryByText('MigrateToJUnit5')).toBeNull();
    expect(screen.queryByText('SetupJenkinsfile')).toBeNull();

    fireEvent.click(highCard!);

    await waitFor(() => {
      expect(screen.getByText('UpgradeBomVersion')).toBeDefined();
    });
    expect(screen.getByText('AddCodeOwner')).toBeDefined();
    expect(screen.getByText('SetupDependabot')).toBeDefined();
    expect(screen.getByText('MigrateToJUnit5')).toBeDefined();
    expect(screen.getByText('SetupJenkinsfile')).toBeDefined();
    console.log(`  RecipeList   : clicking active High Rate card resets filter to "all"`);
  });

  it('combines search and tier filter using real high-tier recipes', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const highCard = screen.getAllByText('High Rate').find((el) => el.closest('button'));
    fireEvent.click(highCard!);

    expect(screen.getByText('AddCodeOwner')).toBeDefined();
    expect(screen.getByText('SetupDependabot')).toBeDefined();
    expect(screen.queryByText('MigrateToJUnit5')).toBeNull();
    expect(screen.queryByText('SetupJenkinsfile')).toBeNull();
    expect(screen.queryByText('UpgradeBomVersion')).toBeNull();

    const searchInput = screen.getByPlaceholderText('Search a recipe…');
    fireEvent.change(searchInput, { target: { value: 'Dependabot' } });

    expect(screen.getByText('SetupDependabot')).toBeDefined();
    expect(screen.queryByText('AddCodeOwner')).toBeNull();
    console.log(`  RecipeList   : tier=high + search="Dependabot" -> only SetupDependabot (81.82%)`);
  });

  it('sorts recipes by name A-Z by default', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const list = screen.getByTestId('virtual-list');
    const rows = list.textContent ?? '';
    const addIdx = rows.indexOf('AddCodeOwner');
    const migrateIdx = rows.indexOf('MigrateToJUnit5');
    const depIdx = rows.indexOf('SetupDependabot');
    const jenkinsIdx = rows.indexOf('SetupJenkinsfile');
    const bomIdx = rows.indexOf('UpgradeBomVersion');
    expect(addIdx).toBeLessThan(migrateIdx);
    expect(migrateIdx).toBeLessThan(depIdx);
    expect(depIdx).toBeLessThan(jenkinsIdx);
    expect(jenkinsIdx).toBeLessThan(bomIdx);
    console.log(`  RecipeList   : default sort is Name A-Z (Add < Migrate < SetupDep < SetupJenk < Upgrade)`);
  });

  it('renders the sort select with default value', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    expect(screen.getByText('Name A–Z')).toBeDefined();
    console.log(`  RecipeList   : sort dropdown shows "Name A–Z" by default`);
  });

  it('clears all filters via the "Clear filters" link in empty state', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search a recipe…');
    fireEvent.change(searchInput, { target: { value: 'nonexistent-xyz' } });

    expect(screen.getByText('No recipes found')).toBeDefined();

    fireEvent.click(screen.getByText('Clear filters'));

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });
    expect(screen.getByText('SetupJenkinsfile')).toBeDefined();
    console.log(`  RecipeList   : "Clear filters" resets search and tier filter`);
  });

  it('filters by "Low Rate" tier (SetupJenkinsfile 16.35%, MigrateToJUnit5 16.67%)', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const lowCard = screen.getAllByText('Low Rate').find((el) => el.closest('button'));
    expect(lowCard).toBeDefined();
    fireEvent.click(lowCard!);

    expect(screen.getByText('MigrateToJUnit5')).toBeDefined();
    expect(screen.getByText('SetupJenkinsfile')).toBeDefined();
    expect(screen.queryByText('AddCodeOwner')).toBeNull();
    expect(screen.queryByText('SetupDependabot')).toBeNull();
    expect(screen.queryByText('UpgradeBomVersion')).toBeNull();
    console.log(`  mock data    : tier filter="Low Rate" (<50%)`);
    console.log(`  RecipeList   : MigrateToJUnit5 (16.67%) + SetupJenkinsfile (16.35%) visible`);
  });

  it('filters by "Medium Rate" tier (UpgradeBomVersion 75%)', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const medCard = screen.getAllByText('Medium Rate').find((el) => el.closest('button'));
    expect(medCard).toBeDefined();
    fireEvent.click(medCard!);

    expect(screen.getByText('UpgradeBomVersion')).toBeDefined();
    expect(screen.queryByText('AddCodeOwner')).toBeNull();
    expect(screen.queryByText('SetupDependabot')).toBeNull();
    expect(screen.queryByText('MigrateToJUnit5')).toBeNull();
    expect(screen.queryByText('SetupJenkinsfile')).toBeNull();
    console.log(`  mock data    : tier filter="Medium Rate" (50-79%)`);
    console.log(`  RecipeList   : only UpgradeBomVersion (75%) visible`);
  });

  it('handles real-world totalApplications != successCount + failureCount', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: mockRecipes });

    renderRecipeList();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const list = screen.getByTestId('virtual-list');
    const text = list.textContent ?? '';
    expect(text).toContain('/13');
    expect(text).toContain('/6');
    console.log(`  RecipeList   : AddCodeOwner shows /13 (not /12) and MigrateToJUnit5 shows /6 (not /5)`);
    console.log(`                 proving totalApplications is used, not successCount + failureCount`);
  });
});
