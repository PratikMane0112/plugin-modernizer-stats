export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type PluginStatus = 'success' | 'fail';

export type PluginStatusColor = 'green' | 'red' | 'blue' | 'yellow' | 'white';

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
  migrationStatus?: 'success' | 'fail';
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
  latestMigration: string | null;
  migrations: Migration[];
  sourceUrls?: PluginSourceUrls;
  rawAggregatedMigrations?: Migration[];
  rawFailedMigrations?: FailedMigration[];
}

export interface RecipeStats {
  recipeId: string;
  total: number;
  success: number;
  fail: number;
}

export interface RecipeReport {
  recipeId: string;
  totalApplications: number;
  successCount: number;
  failureCount: number;
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
  recipes: Record<string, RecipeReport>;
  plugins: Record<string, PluginData>;
}

export type SummaryJson = Omit<ReportJson, 'plugins' | 'recipes'> & {
  recipes: RecipeStats[];
};

export interface PluginSourceUrls {
  repository: string;
  upstreamMetadata: string;
}

export interface PluginData {
  sourceUrls?: PluginSourceUrls;
  aggregatedMigrations: Migration[];
  failedMigrations: FailedMigration[];
  modernizationMetadata: unknown[];
}

export interface PluginRecipesIndex {
  schemaVersion: string;
  generatedAt: string;
  plugins: string[];
  recipes: string[];
}

export interface FailedMigration {
  migrationId: string;
  migrationStatus: string;
}

export interface AppData {
  summary: SummaryJson;
  plugins: PluginReport[];
  recipes: RecipeReport[];
}

export type StatusCounts = Record<PluginStatusColor, number>;

export interface StatusCardDef {
  key: PluginStatusColor;
  label: string;
  desc: string;
}
