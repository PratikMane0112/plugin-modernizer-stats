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

export interface PluginReport {
    pluginName: string;
    pluginRepository: string;
    totalMigrations: number;
    successCount: number;
    failCount: number;
    successRate: number;
    openPRs: number;
    mergedPRs: number;
    closedPRs: number;
    latestMigration: string | null;
    migrations: Migration[];
}

export interface RecipeStats {
    recipeId: string;
    total: number;
    success: number;
    fail: number;
    pending: number;
}

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

export interface TimelineEntry {
    month: string;
    success: number;
    fail: number;
    total: number;
}

export interface TagEntry {
    tag: string;
    count: number;
}

export interface SiteSummary {
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
    recipes: RecipeStats[];
    timeline: TimelineEntry[];
    tags: TagEntry[];
}

export interface AppData {
    summary: SiteSummary;
    plugins: PluginReport[];
    recipes: RecipeReport[];
}

