/**
 * dataClient.ts — Centralized data fetching layer.
 *
 * All fetch() calls go through this module. Uses a module-level in-memory
 * cache (Map<string, Promise<unknown>>) so the same file is never fetched
 * twice per session. Every fetch has a 10s timeout via AbortController.
 */

import type { SummaryJson, PluginRecipesIndex, RecipeReport, PluginReport, Migration, Result } from '../types';

const BASE = '/plugin-modernizer-stats';
const TIMEOUT_MS = 10_000;

// Module-level cache: URL → Promise of the result
const cache = new Map<string, Promise<Result<unknown>>>();

async function fetchJson<T>(url: string): Promise<Result<T>> {
    const cached = cache.get(url);
    if (cached) {
        return cached as Promise<Result<T>>;
    }

    const promise = (async (): Promise<Result<T>> => {
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
    })();

    cache.set(url, promise as Promise<Result<unknown>>);
    return promise;
}

async function fetchText(url: string): Promise<Result<string>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
            return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
        }
        const text = await res.text();
        return { ok: true, data: text };
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            return { ok: false, error: `Request timed out after ${TIMEOUT_MS}ms` };
        }
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
    } finally {
        clearTimeout(timer);
    }
}

// ── Aggregated plugin report builder ────────────────────────────────────────
// The upstream aggregated_migrations.json has { pluginName, pluginRepository, migrations[] }
// We need to derive our PluginReport fields from the migrations array.
interface RawAggregatedMigrations {
    pluginName: string;
    pluginRepository: string;
    migrations: Migration[];
}

function buildPluginReport(raw: RawAggregatedMigrations): PluginReport {
    const migrations = raw.migrations ?? [];
    const total = migrations.length;
    const successCount = migrations.filter(m => m.migrationStatus === 'success').length;
    const failCount = migrations.filter(m =>
        m.migrationStatus === 'fail' || m.migrationStatus === 'failure'
    ).length;

    // Latest migration timestamp
    let latestMigration: string | null = null;
    for (const m of migrations) {
        if (m.timestamp && (!latestMigration || m.timestamp > latestMigration)) {
            latestMigration = m.timestamp;
        }
    }

    return {
        pluginName: raw.pluginName,
        pluginRepository: raw.pluginRepository,
        totalMigrations: total,
        successCount,
        failCount,
        latestMigration,
        migrations,
    };
}

// ── Public API ──────────────────────────────────────────────────────────────

export const dataClient = {
    getSummary(): Promise<Result<SummaryJson>> {
        return fetchJson<SummaryJson>(`${BASE}/summary.json`);
    },

    getIndex(): Promise<Result<PluginRecipesIndex>> {
        return fetchJson<PluginRecipesIndex>(`${BASE}/plugin-recipes-index.json`);
    },

    async getRecipe(recipeName: string): Promise<Result<RecipeReport>> {
        const result = await fetchJson<RecipeReport>(`${BASE}/recipes/${encodeURIComponent(recipeName)}.json`);
        if (!result.ok) return result;
        const r = result.data;
        // Derive successRate if missing from upstream data
        if (r.successRate === undefined || r.successRate === null) {
            r.successRate = r.totalApplications > 0
                ? parseFloat(((r.successCount / r.totalApplications) * 100).toFixed(2))
                : 0;
        }
        return { ok: true, data: r };
    },

    async getPluginReport(pluginName: string): Promise<Result<PluginReport>> {
        const url = `${BASE}/plugins-reports/${encodeURIComponent(pluginName)}/reports/aggregated_migrations.json`;
        const result = await fetchJson<RawAggregatedMigrations>(url);
        if (!result.ok) return result;
        return { ok: true, data: buildPluginReport(result.data) };
    },

    async getPluginFailedMigrations(pluginName: string): Promise<Result<string>> {
        const url = `${BASE}/plugins-reports/${encodeURIComponent(pluginName)}/reports/failed_migrations.csv`;
        return fetchText(url);
    },

    async getAllPlugins(): Promise<Result<PluginReport[]>> {
        const indexResult = await this.getIndex();
        if (!indexResult.ok) return indexResult;

        const results = await Promise.all(
            indexResult.data.plugins.map(name => this.getPluginReport(name))
        );

        const plugins: PluginReport[] = [];
        for (const r of results) {
            if (r.ok) {
                plugins.push(r.data);
            } else {
                console.warn(`[dataClient] Failed to load plugin: ${r.error}`);
            }
        }

        return { ok: true, data: plugins };
    },

    async getAllRecipes(): Promise<Result<RecipeReport[]>> {
        const indexResult = await this.getIndex();
        if (!indexResult.ok) return indexResult;

        const results = await Promise.all(
            indexResult.data.recipes.map(name => this.getRecipe(name))
        );

        const recipes: RecipeReport[] = [];
        for (const r of results) {
            if (r.ok) {
                recipes.push(r.data);
            } else {
                console.warn(`[dataClient] Failed to load recipe: ${r.error}`);
            }
        }

        return { ok: true, data: recipes };
    },
};
