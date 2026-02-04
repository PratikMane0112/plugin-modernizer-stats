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
    migrationStatus: 'success' | 'failure' | 'pending';
    pullRequestUrl?: string;
    pullRequestStatus?: 'open' | 'closed' | 'merged';
    dryRun?: boolean;
    additions?: number;
    deletions?: number;
    changedFiles?: number;
    key: string;
    path?: string;
    checkRuns?: Record<string, string>;
    checkRunsSummary?: 'success' | 'failure';
    defaultBranch?: string;
    defaultBranchLatestCommitSha?: string;
    timestamp: string;
}

export interface PluginReport {
    pluginName: string;
    pluginRepository: string;
    migrations: Migration[];
}

export interface RecipeStats {
    name: string;
    total: number;
    success: number;
    fail: number;
}

export interface GlobalSummary {
    totalPlugins: number;
    totalMigrations: number;
    successfulMigrations: number;
    failedMigrations: number;
    recipes: Record<string, RecipeStats>;
}

export interface AppData {
    summary: GlobalSummary;
    plugins: PluginReport[];
}
