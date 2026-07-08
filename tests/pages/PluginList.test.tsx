import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PluginReport, Migration } from '../../src/types';

vi.mock('../../src/lib/dataClient', () => ({
  dataClient: {
    getAllPlugins: vi.fn(),
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
import PluginList from '../../src/pages/PluginList';

const mockClient = vi.mocked(dataClient);

function m(status: Migration['migrationStatus'], id: string, ts: string): Migration {
  return {
    pluginVersion: '1.0',
    migrationName: id.split('.').pop() ?? id,
    migrationId: id,
    migrationStatus: status,
    key: `${ts}.json`,
    timestamp: ts,
  };
}

const mockPlugins: PluginReport[] = [
  {
    pluginName: 'BlazeMeterJenkinsPlugin',
    pluginRepository: 'https://github.com/jenkinsci/blazemeter-plugin.git',
    totalMigrations: 2,
    successCount: 2,
    failCount: 0,
    latestMigration: '2025-09-03T08-05-48',
    migrations: [
      m('success', 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', '2025-09-03T08-05-48'),
      m('success', 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', '2025-07-23T07-51-56'),
    ],
    sourceUrls: { repository: 'https://github.com/jenkinsci/blazemeter-plugin.git', upstreamMetadata: '' },
  },
  {
    pluginName: 'CustomHistory',
    pluginRepository: 'https://github.com/jenkinsci/custom-history-plugin.git',
    totalMigrations: 2,
    successCount: 0,
    failCount: 2,
    latestMigration: '2025-09-03T08-08-19',
    migrations: [
      m('fail', 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', '2025-09-03T08-08-19'),
      m('fail', 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', '2025-07-23T07-55-02'),
    ],
  },
  {
    pluginName: 'absint-a3',
    pluginRepository: 'https://github.com/jenkinsci/absint-a3-plugin.git',
    totalMigrations: 8,
    successCount: 7,
    failCount: 1,
    latestMigration: '2025-09-03T07-37-22',
    migrations: [
      m('success', 'io.jenkins.tools.pluginmodernizer.UpgradeToLatestJava11CoreVersion', '2025-09-03T07-37-22'),
      m('fail', 'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5', '2025-09-02T14-34-52'),
      m('success', 'io.jenkins.tools.pluginmodernizer.FixJellyIssues', '2025-09-02T14-32-42'),
      m('success', 'io.jenkins.tools.pluginmodernizer.SetupDependabot', '2025-09-02T14-22-13'),
      m('success', 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', '2025-09-02T14-17-29'),
      m('success', 'io.jenkins.tools.pluginmodernizer.UpgradeToLatestJava11CoreVersion', '2025-09-02T14-13-06'),
      m('success', 'io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion', '2025-09-02T14-04-22'),
      m('success', 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', '2025-07-23T08-03-50'),
    ],
    sourceUrls: { repository: 'https://github.com/jenkinsci/absint-a3-plugin.git', upstreamMetadata: '' },
  },
];

function renderPluginList() {
  return render(
    <MemoryRouter>
      <PluginList />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PluginList', () => {
  it('shows skeleton while loading', () => {
    mockClient.getAllPlugins.mockReturnValue(new Promise(() => {}));

    renderPluginList();

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  mock data    : loading (never resolves)`);
    console.log(`  PluginList   : ${skeletons.length} skeleton elements rendered`);
  });

  it('renders plugin rows on successful data load', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: mockPlugins });

    renderPluginList();

    await waitFor(() => {
      expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    });

    expect(screen.getByText('CustomHistory')).toBeDefined();
    expect(screen.getByText('absint-a3')).toBeDefined();
    expect(screen.getByText('3 total')).toBeDefined();
    console.log(`  mock data    : ${mockPlugins.length} plugins (BlazeMeter=green, CustomHistory=red, absint-a3=blue)`);
    console.log(`  PluginList   : all 3 plugin names rendered, "3 total" shown`);
  });

  it('filters plugins by search text (case-insensitive)', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: mockPlugins });

    renderPluginList();

    await waitFor(() => {
      expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: 'CUSTOM' } });

    expect(screen.getByText('CustomHistory')).toBeDefined();
    expect(screen.queryByText('BlazeMeterJenkinsPlugin')).toBeNull();
    expect(screen.queryByText('absint-a3')).toBeNull();
    console.log(`  mock data    : search="CUSTOM"`);
    console.log(`  PluginList   : only CustomHistory visible`);
  });

  it('filters plugins by status when status card is clicked', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: mockPlugins });

    renderPluginList();

    await waitFor(() => {
      expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    });

    const failCard = screen.getAllByText('All Failed').find((el) => el.closest('button'));
    expect(failCard).toBeDefined();
    fireEvent.click(failCard!);

    expect(screen.getByText('CustomHistory')).toBeDefined();
    expect(screen.queryByText('BlazeMeterJenkinsPlugin')).toBeNull();
    expect(screen.queryByText('absint-a3')).toBeNull();
    console.log(`  mock data    : status filter="All Failed" (red)`);
    console.log(`  PluginList   : only CustomHistory (2 fail, 0 success) visible`);
  });

  it('shows ErrorBanner on error', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: false, error: 'Network error' });

    renderPluginList();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined();
    });

    expect(screen.getByText('Retry')).toBeDefined();
    console.log(`  mock data    : getAllPlugins returns error`);
    console.log(`  PluginList   : ErrorBanner displayed with "Network error"`);
  });

  it('shows "No plugins found" when filters match nothing', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: mockPlugins });

    renderPluginList();

    await waitFor(() => {
      expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: 'nonexistent-xyz' } });

    expect(screen.getByText('No plugins found')).toBeDefined();
    console.log(`  mock data    : search="nonexistent-xyz"`);
    console.log(`  PluginList   : "No plugins found" message displayed`);
  });

  it('displays correct status cards with migration-derived counts', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: mockPlugins });

    renderPluginList();

    await waitFor(() => {
      expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    });

    const passedCard = screen.getAllByText('All Passed').find((el) => el.closest('button'));
    expect(passedCard).toBeDefined();
    fireEvent.click(passedCard!);
    expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    expect(screen.queryByText('CustomHistory')).toBeNull();
    expect(screen.queryByText('absint-a3')).toBeNull();
    console.log(`  All Passed   : BlazeMeterJenkinsPlugin (2/2 success -> green)`);

    fireEvent.click(passedCard!);

    const mostlyCard = screen.getAllByText('Mostly Passed').find((el) => el.closest('button'));
    expect(mostlyCard).toBeDefined();
    fireEvent.click(mostlyCard!);
    expect(screen.getByText('absint-a3')).toBeDefined();
    expect(screen.queryByText('BlazeMeterJenkinsPlugin')).toBeNull();
    expect(screen.queryByText('CustomHistory')).toBeNull();
    console.log(`  Mostly Passed: absint-a3 (7/8 success, 1 fail -> blue)`);
  });
});
