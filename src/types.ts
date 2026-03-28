// ── Result type for dataClient ──────────────────────────────────────────────
export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string };

// ── Migration (single entry in a plugin's aggregated_migrations.json) ───────
export interface Migration {
    pluginVersion: string;
    jenkinsBaseline?: string;
    targetBaseline?: string;
    effectiveBaseline?: string;
    jenkinsVersion?: string;
    migrationName: string;
    migrationDescription?: string;
    tags?: string[];
    migrationId: string;
    migrationStatus: 'success' | 'failure' | 'fail' | 'pending' | '';
    pullRequestUrl?: string;
    pullRequestStatus?: 'open' | 'closed' | 'merged' | '';
    dryRun?: boolean;
    additions?: number;
    deletions?: number;
    changedFiles?: number;
    key: string;
    path?: string;
    checkRuns?: Record<string, string | null>;
    checkRunsSummary?: 'success' | 'failure' | 'pending' | 'neutral';
    defaultBranch?: string;
    defaultBranchLatestCommitSha?: string;
    timestamp: string;
}

// ── Plugin report (aggregated_migrations.json at plugin level) ──────────────
// Only fields directly from upstream data or reliably derived from migrationStatus.
export interface PluginReport {
    pluginName: string;
    pluginRepository: string;
    totalMigrations: number;
    successCount: number;
    failCount: number;
    latestMigration: string | null;
    migrations: Migration[];
}

// ── Recipe stats (summary-level, in overview widgets) ───────────────────────
export interface RecipeStats {
    recipeId: string;
    total: number;
    success: number;
    fail: number;
    pending: number;
}

// ── Recipe report (full upstream recipes/<name>.json, embedded in report.json) ──
// Contains the per-plugin application rows used by RecipeDetail.
export interface RecipeReport {
    recipeId: string;
    totalApplications: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    pending: number;      // derived by consolidate.py
    plugins: {
        pluginName: string;
        status: string;
        timestamp: string;
    }[];
}

// ── Timeline entry for dashboard chart ──────────────────────────────────────
export interface TimelineEntry {
    month: string;
    success: number;
    fail: number;
    total: number;
}

// ── Tag entry for dashboard chart ───────────────────────────────────────────
export interface TagEntry {
    tag: string;
    count: number;
}

// ── Top-level report.json shape ──────────────────────────────────────────────
// This is the single file produced by consolidate.py.
export interface ReportJson {
    schemaVersion: string;
    generatedAt: string;
    dataSource: string;
    meta: {
        source_sha256: string;
        parsed_at: string;
    };
    overview: {
        totalPlugins: number;
        totalMigrations: number;
        successfulMigrations: number;
        failedMigrations: number;
        pendingMigrations: number | null;
        successRate: number;
    };
    pullRequests: {
        totalPRs: number;
        openPRs: number;
        closedPRs: number;
        mergedPRs: number;
        mergeRate: number;
    };
    failuresByRecipe: { recipeId: string; failures: number }[];
    pluginsWithFailedMigrations: string[];
    timeline: TimelineEntry[];
    tags: TagEntry[];
    /** Keyed by recipeId — full upstream recipe data + derived `pending` */
    recipes: Record<string, RecipeReport>;
    /** Keyed by pluginId */
    plugins: Record<string, PluginData>;
}

// ── SummaryJson — view of ReportJson without the large plugins/recipes dicts ─
// Kept for backwards-compatibility with hooks/pages that import SummaryJson.
export type SummaryJson = Omit<ReportJson, 'plugins' | 'recipes'> & {
    /** Flat list of recipe stats for widgets (derived client-side) */
    recipes: RecipeStats[];
};

// ── Per-plugin data shape embedded in report.json ───────────────────────────
export interface AggregatedMigrations {
    pluginName: string;
    pluginRepository: string;
    migrations: Migration[];
}

export interface PluginData {
    aggregatedMigrations: AggregatedMigrations | null;
    failedMigrations: Record<string, string>[];   // CSV rows as key-value dicts
    modernizationMetadata: unknown[];
}

// ── plugin-recipes-index — derived client-side from report.json ──────────────
export interface PluginRecipesIndex {
    schemaVersion: string;
    generatedAt: string;
    plugins: string[];
    recipes: string[];
}

// ── Plugin status — derived client-side from migrations ─────────────────────
export type PluginStatus = 'success' | 'partial' | 'failed' | 'pending';

// ── Failed migration row (from failedMigrations in report.json) ──────────────
// Each row is a dict of CSV column → value.
export interface FailedMigration {
    migrationId: string;
    migrationStatus: string;
}

// ── App-level aggregated data (used by useMetadata hook) ────────────────────
export interface AppData {
    summary: SummaryJson;
    plugins: PluginReport[];
    recipes: RecipeReport[];
}
