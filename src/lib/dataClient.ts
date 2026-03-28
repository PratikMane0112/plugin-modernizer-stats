/**
 * dataClient.ts — Centralized data fetching layer.
 *
 * All data is sourced from a single `report.json` file produced by
 * consolidate.py. The file is fetched once per session (module-level cache)
 * and then sliced in-memory to satisfy individual requests.
 *
 * Every fetch has a 10s timeout via AbortController.
 */

import type {
    ReportJson, SummaryJson, PluginRecipesIndex,
    RecipeReport, RecipeStats, PluginReport, Migration, Result
} from '../types';

const BASE = '/plugin-modernizer-stats';
const TIMEOUT_MS = 10_000;

// Module-level cache: the single report.json promise
let reportPromise: Promise<Result<ReportJson>> | null = null;

async function fetchJson<T>(url: string): Promise<Result<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
            return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
        }
        const data = (await res.json()) as T;
        return { ok: true, data };
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            return { ok: false, error: `Request timed out after ${TIMEOUT_MS}ms` };
        }
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
    } finally {
        clearTimeout(timer);
    }
}

/** Fetch (and cache) the single report.json. */
function getReport(): Promise<Result<ReportJson>> {
    if (!reportPromise) {
        reportPromise = fetchJson<ReportJson>(`${BASE}/report.json`);
    }
    return reportPromise;
}

// ── Plugin report builder ────────────────────────────────────────────────────

function buildPluginReport(pluginId: string, pluginData: {
    sourceUrls?: { aggregatedMigrations: string; failedMigrations: string };
    aggregatedMigrations: {
        pluginName?: string;
        pluginRepository?: string;
        migrations?: Migration[];
    } | null;
    failedMigrations?: Record<string, string>[];
}): PluginReport {
    const agg = pluginData.aggregatedMigrations;
    const migrations = agg?.migrations ?? [];
    const successCount = migrations.filter(m => m.migrationStatus === 'success').length;
    const failCount = migrations.filter(m =>
        m.migrationStatus === 'fail' || m.migrationStatus === 'failure'
    ).length;

    let latestMigration: string | null = null;
    for (const m of migrations) {
        if (m.timestamp && (!latestMigration || m.timestamp > latestMigration)) {
            latestMigration = m.timestamp;
        }
    }

    return {
        pluginName: agg?.pluginName ?? pluginId,
        pluginRepository: agg?.pluginRepository ?? '',
        totalMigrations: migrations.length,
        successCount,
        failCount,
        latestMigration,
        migrations,
        sourceUrls: pluginData.sourceUrls,
        rawAggregatedMigrations: agg,
        rawFailedMigrations: pluginData.failedMigrations ?? [],
    };
}

// ── Public API ──────────────────────────────────────────────────────────────

export const dataClient = {
    /**
     * Return the top-level summary fields of report.json (without the large
     * plugins/recipes dicts). The `recipes` field is converted to a flat
     * RecipeStats[] for the widgets that expect that shape.
     */
    async getSummary(): Promise<Result<SummaryJson>> {
        const result = await getReport();
        if (!result.ok) return result;
        const r = result.data;
        const recipeStats: RecipeStats[] = Object.values(r.recipes).map(rec => ({
            recipeId: rec.recipeId,
            total: rec.totalApplications,
            success: rec.successCount,
            fail: rec.failureCount,
            pending: rec.pending,
        }));
        // SummaryJson = ReportJson without plugins dict, with recipes as flat list
        const summary: SummaryJson = {
            schemaVersion: r.schemaVersion,
            generatedAt: r.generatedAt,
            dataSource: r.dataSource,
            meta: r.meta,
            overview: r.overview,
            pullRequests: r.pullRequests,
            failuresByRecipe: r.failuresByRecipe,
            pluginsWithFailedMigrations: r.pluginsWithFailedMigrations,
            timeline: r.timeline,
            tags: r.tags,
            recipes: recipeStats,
        };
        return { ok: true, data: summary };
    },

    /**
     * Derive a PluginRecipesIndex from the report's plugin and recipe keys.
     * Shape is identical to the old plugin-recipes-index.json.
     */
    async getIndex(): Promise<Result<PluginRecipesIndex>> {
        const result = await getReport();
        if (!result.ok) return result;
        const r = result.data;
        return {
            ok: true,
            data: {
                schemaVersion: r.schemaVersion,
                generatedAt: r.generatedAt,
                plugins: Object.keys(r.plugins).sort(),
                recipes: Object.keys(r.recipes).sort(),
            },
        };
    },

    /** Return the full recipe data (including plugins[]) for a single recipe. */
    async getRecipe(recipeName: string): Promise<Result<RecipeReport>> {
        const result = await getReport();
        if (!result.ok) return result;
        const rec = result.data.recipes[recipeName];
        if (!rec) {
            return { ok: false, error: `HTTP 404: Recipe '${recipeName}' not found in report.json` };
        }
        // Ensure successRate is present (consolidate.py derives it, but guard anyway)
        if (rec.successRate === undefined || rec.successRate === null) {
            (rec as RecipeReport).successRate = rec.totalApplications > 0
                ? parseFloat(((rec.successCount / rec.totalApplications) * 100).toFixed(2))
                : 0;
        }
        return { ok: true, data: rec };
    },

    /** Build a PluginReport from the plugin's aggregatedMigrations in report.json. */
    async getPluginReport(pluginName: string): Promise<Result<PluginReport>> {
        const result = await getReport();
        if (!result.ok) return result;
        const pluginData = result.data.plugins[pluginName];
        if (!pluginData) {
            return { ok: false, error: `HTTP 404: Plugin '${pluginName}' not found in report.json` };
        }
        if (!pluginData.aggregatedMigrations) {
            return { ok: false, error: `Plugin '${pluginName}' has no aggregatedMigrations` };
        }
        return { ok: true, data: buildPluginReport(pluginName, pluginData) };
    },

    /**
     * Return failed migrations for a plugin as a formatted string (tab-separated)
     * so existing consumers (useFailedMigrations) keep working without changes.
     * The data is sourced from the JSON array in report.json — no CSV fetch needed.
     */
    async getPluginFailedMigrations(pluginName: string): Promise<Result<string>> {
        const result = await getReport();
        if (!result.ok) return result;
        const pluginData = result.data.plugins[pluginName];
        if (!pluginData) {
            return { ok: false, error: `HTTP 404: Plugin '${pluginName}' not found in report.json` };
        }
        const rows = pluginData.failedMigrations ?? [];
        if (rows.length === 0) {
            return { ok: false, error: 'No failed migrations data' };
        }
        // Reconstruct a CSV-like string: header row + data rows
        const headers = Object.keys(rows[0]);
        const lines = [
            headers.join(','),
            ...rows.map(row => headers.map(h => row[h] ?? '').join(',')),
        ];
        return { ok: true, data: lines.join('\n') };
    },

    /** Build PluginReport[] for all plugins in report.json. */
    async getAllPlugins(): Promise<Result<PluginReport[]>> {
        const result = await getReport();
        if (!result.ok) return result;
        const plugins: PluginReport[] = [];
        for (const [pluginId, pluginData] of Object.entries(result.data.plugins)) {
            if (!pluginData.aggregatedMigrations) continue;
            plugins.push(buildPluginReport(pluginId, pluginData));
        }
        return { ok: true, data: plugins };
    },

    /** Return RecipeReport[] for all recipes in report.json. */
    async getAllRecipes(): Promise<Result<RecipeReport[]>> {
        const result = await getReport();
        if (!result.ok) return result;
        return { ok: true, data: Object.values(result.data.recipes) };
    },
};
