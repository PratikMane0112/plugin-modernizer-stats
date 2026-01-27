export interface Migration {
    pluginVersion: string;
    jenkinsVersion?: string;
    migrationName: string;
    migrationId: string;
    migrationStatus: 'success' | 'failure' | 'pending'; // Adjust based on actual data
    pullRequestUrl?: string;
    key: string;
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
