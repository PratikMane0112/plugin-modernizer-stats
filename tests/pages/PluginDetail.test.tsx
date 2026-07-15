import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { PluginReport, Migration } from '../../src/types';

vi.mock('../../src/lib/dataClient', () => ({
  dataClient: {
    getPluginReport: vi.fn(),
    getPluginFailedMigrations: vi.fn(),
  },
}));

vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="echarts-mock" />,
}));

import { dataClient } from '../../src/lib/dataClient';
import PluginDetail from '../../src/pages/PluginDetail';

const mockClient = vi.mocked(dataClient);

function m(status: Migration['migrationStatus'], id: string, ts: string, extras?: Partial<Migration>): Migration {
  return {
    pluginVersion: '1.0',
    migrationName: id,
    migrationId: `io.jenkins.tools.pluginmodernizer.${id}`,
    migrationStatus: status,
    key: `${ts}.json`,
    timestamp: ts,
    ...extras,
  };
}

const mockPlugin: PluginReport = {
  pluginName: 'absint-a3',
  pluginRepository: 'https://github.com/jenkinsci/absint-a3-plugin.git',
  totalMigrations: 3,
  successCount: 2,
  failCount: 1,
  latestMigration: '2025-09-03T07-37-22',
  migrations: [
    m('success', 'SetupJenkinsfile', '2025-09-03T07-37-22', {
      pullRequestUrl: 'https://github.com/jenkinsci/absint-a3-plugin/pull/1',
      pullRequestStatus: 'merged',
      additions: 10,
      deletions: 2,
      tags: ['jenkinsfile', 'setup'],
      defaultBranch: 'master',
    }),
    m('fail', 'MigrateToJUnit5', '2025-09-02T14-34-52', {
      tags: ['junit5'],
    }),
    m('success', 'SetupDependabot', '2025-07-23T08-03-50', {
      pullRequestUrl: 'https://github.com/jenkinsci/absint-a3-plugin/pull/2',
      pullRequestStatus: 'merged',
      tags: ['dependabot', 'setup'],
    }),
  ],
  sourceUrls: { repository: 'https://github.com/jenkinsci/absint-a3-plugin.git', upstreamMetadata: '' },
};

function renderPluginDetail(pluginName = 'absint-a3') {
  return render(
    <MemoryRouter initialEntries={[`/plugins/${pluginName}`]}>
      <Routes>
        <Route path="/plugins/:name" element={<PluginDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockClient.getPluginFailedMigrations.mockResolvedValue({ ok: true, data: 'id,name\n1,test' });
});

describe('PluginDetail', () => {
  it('shows skeleton while loading', () => {
    mockClient.getPluginReport.mockReturnValue(new Promise(() => {}));

    renderPluginDetail();

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.getByText('Back to Plugins')).toBeDefined();
  });

  it('renders plugin detail on successful data load', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('absint-a3')).toBeDefined();
    });

    expect(screen.getByText('Back to Plugins')).toBeDefined();
  });

  it('shows error banner on fetch error', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: false, error: 'Network error' });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined();
    });

    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('shows not-found message when plugin does not exist', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: false, error: "Plugin 'nonexistent' not found" });

    renderPluginDetail('nonexistent');

    await waitFor(() => {
      expect(screen.getByText("Plugin 'nonexistent' not found")).toBeDefined();
    });
  });

  it('displays header stat boxes with correct values', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('absint-a3')).toBeDefined();
    });

    expect(screen.getByText('Migrations')).toBeDefined();
    expect(screen.getAllByText('Success').length).toBeGreaterThanOrEqual(1);

    const totalElements = screen.getAllByText('3');
    expect(totalElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders migration cards', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getAllByText('SetupJenkinsfile').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getAllByText('MigrateToJUnit5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SetupDependabot').length).toBeGreaterThanOrEqual(1);
  });

  it('shows View Repository link in header', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('absint-a3')).toBeDefined();
    });

    const repoLink = screen.getByText('View Repository');
    expect(repoLink.closest('a')?.getAttribute('href')).toBe('https://github.com/jenkinsci/absint-a3-plugin.git');
  });

  it('shows recipe breakdown table', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText(/Recipe Breakdown/)).toBeDefined();
    });
  });

  it('shows PR history when PRs exist', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText(/PR History/)).toBeDefined();
    });
  });

  it('shows failed migrations table when failures exist', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('Failed Migrations')).toBeDefined();
    });
  });

  it('hides failed migrations table when no failures', async () => {
    const noFailPlugin: PluginReport = {
      ...mockPlugin,
      failCount: 0,
      successCount: 3,
      migrations: mockPlugin.migrations.filter((mi) => mi.migrationStatus === 'success'),
    };
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: noFailPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('absint-a3')).toBeDefined();
    });

    expect(screen.queryByText('Failed Migrations')).toBeNull();
  });

  it('shows raw data section', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getByText('Raw Data')).toBeDefined();
    });
  });

  it('renders tags inline in migration cards', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    renderPluginDetail();

    await waitFor(() => {
      expect(screen.getAllByText('jenkinsfile').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getAllByText('setup').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('junit5').length).toBeGreaterThanOrEqual(1);
  });
});
