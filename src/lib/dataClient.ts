import type {
  ReportJson,
  SummaryJson,
  PluginRecipesIndex,
  RecipeReport,
  RecipeStats,
  PluginReport,
  PluginData,
  Result,
} from '../types';

const TIMEOUT_MS = 10_000;
const REPORT_URL = `${import.meta.env.BASE_URL}data/report.json`;

let reportPromise: Promise<Result<ReportJson>> | null = null;

async function fetchJson<T>(url: string): Promise<Result<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data: T = await res.json();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: `Request timed out after ${TIMEOUT_MS}ms` };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown fetch error',
    };
  } finally {
    clearTimeout(timer);
  }
}

function getReport(): Promise<Result<ReportJson>> {
  if (!reportPromise) {
    reportPromise = fetchJson<ReportJson>(REPORT_URL);
  }
  return reportPromise;
}

function buildPluginReport(pluginId: string, pluginData: PluginData): PluginReport {
  const migrations = pluginData.aggregatedMigrations?.migrations ?? [];
  const successCount = migrations.filter((m) => m.migrationStatus === 'success').length;
  const failCount = migrations.filter((m) => m.migrationStatus === 'failure').length;

  let latestMigration: string | null = null;
  if (migrations.length > 0) {
    latestMigration = migrations.reduce(
      (latest, m) => (m.timestamp > latest ? m.timestamp : latest),
      migrations[0].timestamp
    );
  }

  return {
    pluginName: pluginData.aggregatedMigrations?.pluginName ?? pluginId,
    pluginRepository: pluginData.aggregatedMigrations?.pluginRepository ?? '',
    totalMigrations: migrations.length,
    successCount,
    failCount,
    latestMigration,
    migrations,
    sourceUrls: pluginData.sourceUrls,
    rawAggregatedMigrations: pluginData.aggregatedMigrations,
    rawFailedMigrations: pluginData.failedMigrations,
  };
}

export const dataClient = {
  async getSummary(): Promise<Result<SummaryJson>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const recipes: RecipeStats[] = Object.entries(report.recipes).map(([recipeId, r]) => ({
      recipeId,
      total: r.totalApplications,
      success: r.successCount,
      fail: r.failureCount,
      pending: r.pending,
    }));

    return {
      ok: true,
      data: {
        schemaVersion: report.schemaVersion,
        generatedAt: report.generatedAt,
        dataSource: report.dataSource,
        meta: report.meta,
        overview: report.overview,
        pullRequests: report.pullRequests,
        timeline: report.timeline,
        tags: report.tags,
        failuresByRecipe: report.failuresByRecipe,
        pluginsWithFailedMigrations: report.pluginsWithFailedMigrations,
        recipes,
      },
    };
  },

  async getIndex(): Promise<Result<PluginRecipesIndex>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    return {
      ok: true,
      data: {
        schemaVersion: report.schemaVersion,
        generatedAt: report.generatedAt,
        plugins: Object.keys(report.plugins).sort(),
        recipes: Object.keys(report.recipes).sort(),
      },
    };
  },

  async getRecipe(recipeName: string): Promise<Result<RecipeReport>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const recipe = report.recipes[recipeName];
    if (!recipe) {
      return { ok: false, error: `Recipe '${recipeName}' not found` };
    }

    const data: RecipeReport = {
      ...recipe,
      successRate:
        recipe.successRate ??
        (recipe.totalApplications > 0 ? (recipe.successCount / recipe.totalApplications) * 100 : 0),
    };

    return { ok: true, data };
  },

  async getPluginReport(pluginName: string): Promise<Result<PluginReport>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const pluginData = report.plugins[pluginName];
    if (!pluginData) {
      return { ok: false, error: `Plugin '${pluginName}' not found` };
    }

    return { ok: true, data: buildPluginReport(pluginName, pluginData) };
  },

  async getPluginFailedMigrations(pluginName: string): Promise<Result<string>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const pluginData = report.plugins[pluginName];
    if (!pluginData) {
      return { ok: false, error: `Plugin '${pluginName}' not found` };
    }

    const migrations = pluginData.aggregatedMigrations?.migrations ?? [];
    const failed = migrations.filter((m) => m.migrationStatus === 'failure');

    const headers = ['migrationId', 'migrationName', 'migrationStatus', 'pluginVersion', 'timestamp', 'pullRequestUrl'];

    const rows = failed.map((m) =>
      [m.migrationId, m.migrationName, m.migrationStatus, m.pluginVersion, m.timestamp, m.pullRequestUrl ?? ''].join(
        ','
      )
    );

    return { ok: true, data: [headers.join(','), ...rows].join('\n') };
  },

  async getAllPlugins(): Promise<Result<PluginReport[]>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const plugins: PluginReport[] = Object.entries(report.plugins)
      .filter(([, pd]) => pd.aggregatedMigrations !== null)
      .map(([id, pd]) => buildPluginReport(id, pd));

    return { ok: true, data: plugins };
  },

  async getAllRecipes(): Promise<Result<RecipeReport[]>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    return { ok: true, data: Object.values(report.recipes) };
  },
};
