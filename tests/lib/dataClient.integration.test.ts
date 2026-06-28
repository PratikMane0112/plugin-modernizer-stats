import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReportJson } from '../../src/types';

const REPORT_URL = 'https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json';

/**
 * These tests fetch the real report.json, feed it to dataClient via mocked fetch
 * and validate that dataClient produces correct results matching the raw data.
 */
describe('dataClient validated against actual report.json', () => {
  let realReport: ReportJson;

  beforeEach(async () => {
    vi.resetModules();
    vi.restoreAllMocks();

    const res = await fetch(REPORT_URL);
    realReport = (await res.json()) as ReportJson;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(realReport),
      })
    );
  });

  it('getAllPlugins total migrations matches report.overview.totalMigrations', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllPlugins();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const totalFromClient = result.data.reduce((sum, p) => sum + p.totalMigrations, 0);

    let totalFromJson = 0;
    for (const p of Object.values(realReport.plugins)) {
      totalFromJson += p.aggregatedMigrations.length;
    }

    expect(totalFromClient).toBe(totalFromJson);
    expect(totalFromClient).toBe(realReport.overview.totalMigrations);
    console.log(`  dataClient : ${result.data.length} plugins, ${totalFromClient} migrations`);
    console.log(
      `  report.json: ${Object.keys(realReport.plugins).length} plugins, ${totalFromJson} migrations (overview: ${realReport.overview.totalMigrations})`
    );
  });

  it('getAllPlugins success+fail counts match manual count from report.json', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllPlugins();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const clientSuccess = result.data.reduce((sum, p) => sum + p.successCount, 0);
    const clientFail = result.data.reduce((sum, p) => sum + p.failCount, 0);

    let jsonSuccess = 0;
    let jsonFail = 0;
    for (const p of Object.values(realReport.plugins)) {
      for (const m of p.aggregatedMigrations) {
        if (m.migrationStatus === 'success') jsonSuccess++;
        else if (m.migrationStatus === 'fail') jsonFail++;
      }
    }

    expect(clientSuccess).toBe(jsonSuccess);
    expect(clientFail).toBe(jsonFail);
    console.log(`  dataClient : success=${clientSuccess}, fail=${clientFail}`);
    console.log(
      `  report.json: success=${jsonSuccess}, fail=${jsonFail} (overview: ${realReport.overview.successfulMigrations}s/${realReport.overview.failedMigrations}f)`
    );
  });

  it('getPluginReport returns correct data for a known mixed plugin', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    const pluginId = Object.keys(realReport.plugins).find((id) => {
      const agg = realReport.plugins[id].aggregatedMigrations;
      const s = agg.filter((m) => m.migrationStatus === 'success').length;
      const f = agg.filter((m) => m.migrationStatus === 'fail').length;
      return s > 0 && f > 0;
    });
    expect(pluginId).toBeDefined();

    const result = await dataClient.getPluginReport(pluginId!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const rawAgg = realReport.plugins[pluginId!].aggregatedMigrations;
    const expectedSuccess = rawAgg.filter((m) => m.migrationStatus === 'success').length;
    const expectedFail = rawAgg.filter((m) => m.migrationStatus === 'fail').length;

    expect(result.data.totalMigrations).toBe(rawAgg.length);
    expect(result.data.successCount).toBe(expectedSuccess);
    expect(result.data.failCount).toBe(expectedFail);
    expect(result.data.pluginRepository).toBe(realReport.plugins[pluginId!].sourceUrls?.repository ?? '');
    console.log(
      `  dataClient : ${pluginId} -> ${result.data.totalMigrations} migrations, ${result.data.successCount}s/${result.data.failCount}f`
    );
    console.log(`  report.json: ${pluginId} -> ${rawAgg.length} migrations, ${expectedSuccess}s/${expectedFail}f`);
  });

  it('getSummary overview matches raw report overview', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getSummary();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.overview).toEqual(realReport.overview);
    console.log(
      `  dataClient : totalPlugins=${result.data.overview.totalPlugins}, totalMigrations=${result.data.overview.totalMigrations}, successRate=${result.data.overview.successRate}%`
    );
    console.log(
      `  report.json: totalPlugins=${realReport.overview.totalPlugins}, totalMigrations=${realReport.overview.totalMigrations}, successRate=${realReport.overview.successRate}%`
    );
  });

  it('getIndex plugin/recipe counts match Object.keys lengths', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getIndex();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.plugins).toHaveLength(Object.keys(realReport.plugins).length);
    expect(result.data.recipes).toHaveLength(Object.keys(realReport.recipes).length);
    console.log(`  dataClient : ${result.data.plugins.length} plugins, ${result.data.recipes.length} recipes`);
    console.log(
      `  report.json: ${Object.keys(realReport.plugins).length} plugins, ${Object.keys(realReport.recipes).length} recipes`
    );
  });
});
