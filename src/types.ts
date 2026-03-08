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
// PR counts (open/merged/closed) are NOT included because pullRequestStatus
// is a stale snapshot — it does not reflect the current state on GitHub.
export interface PluginReport {
    pluginName: string;
    pluginRepository: string;
    totalMigrations: number;
    successCount: number;
    failCount: number;
    latestMigration: string | null;
    migrations: Migration[];
}

// ── Recipe stats used in summary ────────────────────────────────────────────
export interface RecipeStats {
    recipeId: string;
    total: number;
    success: number;
    fail: number;
    pending: number;
}

// ── Recipe report (upstream reports/recipes/<name>.json) ────────────────────
export interface RecipeReport {
    recipeId: string;
    totalApplications: number;
    successCount: number;
    failureCount: number;
    successRate: number;
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

// ── summary.json — parsed from reports/summary.md ───────────────────────────
export interface SummaryJson {
    schemaVersion: string;
    generatedAt: string;
    overview: {
        totalPlugins: number;
        totalMigrations: number;
        successfulMigrations: number;
        failedMigrations: number;
        pendingMigrations: number;
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
    recipes: RecipeStats[];
    timeline: TimelineEntry[];
    tags: TagEntry[];
}

// ── plugin-recipes-index.json ───────────────────────────────────────────────
export interface PluginRecipesIndex {
    schemaVersion: string;
    generatedAt: string;
    plugins: string[];
    recipes: string[];
}

// ── Plugin status — derived client-side from migrations ─────────────────────
export type PluginStatus = 'success' | 'partial' | 'failed' | 'pending';

// ── Failed migration row (from failed_migrations.csv) ───────────────────────
// Actual CSV columns: migrationId,migrationStatus
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

