import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PluginReport, Migration } from '../../../src/types';
import PluginHeader from '../../../src/components/pluginDetail/PluginHeader';

function m(status: Migration['migrationStatus'], id: string, ts: string, extras?: Partial<Migration>): Migration {
  return {
    pluginVersion: '1.0',
    migrationName: id,
    migrationId: id,
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
      pullRequestStatus: 'merged',
      defaultBranch: 'master',
    }),
    m('fail', 'MigrateToJUnit5', '2025-09-02T14-34-52'),
    m('success', 'SetupDependabot', '2025-07-23T08-03-50', {
      pullRequestStatus: 'merged',
    }),
  ],
  sourceUrls: { repository: 'https://github.com/jenkinsci/absint-a3-plugin.git', upstreamMetadata: '' },
};

function renderHeader(plugin: PluginReport = mockPlugin) {
  return render(
    <MemoryRouter>
      <PluginHeader plugin={plugin} />
    </MemoryRouter>
  );
}

describe('PluginHeader', () => {
  it('displays plugin name', () => {
    renderHeader();
    expect(screen.getByText('absint-a3')).toBeDefined();
  });

  it('shows Partial badge for mixed-result plugin', () => {
    renderHeader();
    expect(screen.getByText(/Partial/)).toBeDefined();
  });

  it('shows Modernized badge for all-green plugin', () => {
    const greenPlugin: PluginReport = {
      ...mockPlugin,
      failCount: 0,
      migrations: [m('success', 'A', '2025-09-01T00-00-00'), m('success', 'B', '2025-09-02T00-00-00')],
    };
    renderHeader(greenPlugin);
    expect(screen.getByText(/Modernized/)).toBeDefined();
  });

  it('renders View Repository link', () => {
    renderHeader();
    const link = screen.getByText('View Repository');
    expect(link.closest('a')?.getAttribute('href')).toBe('https://github.com/jenkinsci/absint-a3-plugin.git');
  });

  it('hides View Repository when sourceUrls is undefined', () => {
    renderHeader({ ...mockPlugin, sourceUrls: undefined });
    expect(screen.queryByText('View Repository')).toBeNull();
  });

  it('displays stat boxes with correct values', () => {
    renderHeader();
    const migrationsBox = screen.getByTestId('stat-migrations');
    expect(migrationsBox.textContent).toContain('3');
    expect(migrationsBox.textContent).toContain('Migrations');

    const successBox = screen.getByTestId('stat-success');
    expect(successBox.textContent).toContain('2');
    expect(successBox.textContent).toContain('Success');

    const failedBox = screen.getByTestId('stat-failed');
    expect(failedBox.textContent).toContain('1');
    expect(failedBox.textContent).toContain('Failed');
  });

  it('shows branch chip when defaultBranch exists', () => {
    renderHeader();
    expect(screen.getByText('master')).toBeDefined();
  });

  it('shows version chip', () => {
    renderHeader();
    expect(screen.getByText('v1.0')).toBeDefined();
  });

  it('shows merged PR count', () => {
    renderHeader();
    const mergedBox = screen.getByTestId('merged-prs');
    expect(mergedBox.textContent).toContain('Merged PRs:');
    expect(mergedBox.textContent).toContain('2');
  });

  it('shows last updated date', () => {
    renderHeader();
    const pageText = document.body.textContent ?? '';
    expect(pageText).toContain('Last Updated:');
  });
});
