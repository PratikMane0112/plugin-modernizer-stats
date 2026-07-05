import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PluginReport, Migration } from '../../../src/types';
import PluginRow from '../../../src/components/pluginList/PluginRow';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function m(status: Migration['migrationStatus'], id: string, ts: string): Migration {
  return {
    pluginVersion: '4.26',
    migrationName: id.split('.').pop() ?? id,
    migrationId: id,
    migrationStatus: status,
    key: `${ts}.json`,
    timestamp: ts,
  };
}

const blazemeterPlugin: PluginReport = {
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
};

const customHistoryPlugin: PluginReport = {
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
  sourceUrls: { repository: 'https://github.com/jenkinsci/custom-history-plugin.git', upstreamMetadata: '' },
};

const style: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: 72 };

function renderRow(plugin: PluginReport = blazemeterPlugin) {
  return render(
    <MemoryRouter>
      <PluginRow plugin={plugin} style={style} />
    </MemoryRouter>
  );
}

describe('PluginRow', () => {
  it('displays the plugin name', () => {
    renderRow();
    expect(screen.getByText('BlazeMeterJenkinsPlugin')).toBeDefined();
    console.log(`  mock data  : pluginName="BlazeMeterJenkinsPlugin"`);
    console.log(`  PluginRow  : plugin name rendered`);
  });

  it('renders StatusBadge with correct status for all-success plugin', () => {
    renderRow();
    expect(screen.getByText('Success')).toBeDefined();
    console.log(`  mock data  : BlazeMeterJenkinsPlugin — 2 success, 0 fail -> deriveStatus="green"`);
    console.log(`  PluginRow  : StatusBadge shows "Success"`);
  });

  it('renders StatusBadge as "Fail" for all-fail plugin', () => {
    renderRow(customHistoryPlugin);
    expect(screen.getByText('Fail')).toBeDefined();
    console.log(`  mock data  : CustomHistory — 0 success, 2 fail -> deriveStatus="red"`);
    console.log(`  PluginRow  : StatusBadge shows "Fail"`);
  });

  it('shows GitHub link when sourceUrls.repository exists', () => {
    renderRow();
    const link = screen.getByLabelText('GitHub repository for BlazeMeterJenkinsPlugin');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://github.com/jenkinsci/blazemeter-plugin.git');
    expect(link.getAttribute('target')).toBe('_blank');
    console.log(`  mock data  : sourceUrls.repository="https://github.com/jenkinsci/blazemeter-plugin.git"`);
    console.log(`  PluginRow  : GitHub icon link rendered with correct href`);
  });

  it('hides GitHub link when no sourceUrls', () => {
    const noUrlPlugin: PluginReport = { ...blazemeterPlugin, sourceUrls: undefined };
    renderRow(noUrlPlugin);
    expect(screen.queryByLabelText('GitHub repository for BlazeMeterJenkinsPlugin')).toBeNull();
    console.log(`  mock data  : sourceUrls=undefined`);
    console.log(`  PluginRow  : no GitHub icon rendered`);
  });

  it('navigates to plugin detail page on click', () => {
    mockNavigate.mockClear();
    const { container } = renderRow();
    const row = container.firstChild as HTMLElement;
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/plugins/BlazeMeterJenkinsPlugin');
    console.log(`  mock data  : clicked row for "BlazeMeterJenkinsPlugin"`);
    console.log(`  PluginRow  : navigated to "/plugins/BlazeMeterJenkinsPlugin"`);
  });

  it('displays migration success count and total', () => {
    renderRow();
    const row = screen.getByText('BlazeMeterJenkinsPlugin').closest('[style]');
    const text = row!.textContent ?? '';
    expect(text).toContain('2');
    expect(text).toContain('/2');
    console.log(`  mock data  : BlazeMeterJenkinsPlugin — successCount=2, totalMigrations=2`);
    console.log(`  PluginRow  : "2/2" rendered in row`);
  });
});
