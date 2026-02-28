/**
 * consolidate.ts
 *
 * Reads raw metadata from public/metadata/ (downloaded from metadata-plugin-modernizer)
 * and generates consolidated JSON files for the UI in reports/site-data/.
 *
 * Output files:
 *   - reports/site-data/summary.json    — global overview, PR stats, recipe stats, timeline, tags
 *   - reports/site-data/plugins.json    — per-plugin report with all migrations
 *   - reports/site-data/recipes.json    — per-recipe report with plugin applications
 *   - reports/site-data/plugins-index.json — sorted list of plugin names
 *
 * Usage: npx tsx scripts/consolidate.ts [--metadata-dir public/metadata]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Types (mirror src/types.ts to stay in sync)
// ---------------------------------------------------------------------------

interface RawMigration {
    pluginName?: string;
    pluginRepository?: string;
    pluginVersion: string;
    jenkinsBaseline?: string;
    targetBaseline?: string;
    effectiveBaseline?: string;
    jenkinsVersion?: string;
    migrationName: string;
    migrationDescription?: string;
    tags?: string[];
    migrationId: string;
    migrationStatus: string;
    pullRequestUrl?: string;
    pullRequestStatus?: string;
    dryRun?: boolean;
    additions?: number;
    deletions?: number;
    changedFiles?: number;
    key?: string;
    path?: string;
    checkRuns?: Record<string, string | null>;
    checkRunsSummary?: string;
    defaultBranch?: string;
    defaultBranchLatestCommitSha?: string;
    timestamp?: string;
}

interface AggregatedFile {
    pluginName: string;
    pluginRepository: string;
    migrations: RawMigration[];
}

interface Migration {
    pluginVersion: string;
    jenkinsBaseline: string;
    targetBaseline: string;
    effectiveBaseline: string;
    jenkinsVersion: string;
    migrationName: string;
    migrationDescription: string;
    tags: string[];
    migrationId: string;
    migrationStatus: string;
    pullRequestUrl: string;
    pullRequestStatus: string;
    dryRun: boolean;
    additions: number;
    deletions: number;
    changedFiles: number;
    key: string;
    path: string;
    checkRuns: Record<string, string | null>;
    checkRunsSummary: string;
    defaultBranch: string;
    defaultBranchLatestCommitSha: string;
    timestamp: string;
}

interface PluginReport {
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

interface RecipePlugin {
    pluginName: string;
    status: string;
    timestamp: string;
}

interface RecipeReport {
    recipeId: string;
    totalApplications: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    plugins: RecipePlugin[];
}

interface RecipeStats {
    recipeId: string;
    total: number;
    success: number;
    fail: number;
    pending: number;
}

interface TimelineEntry {
    month: string;
    success: number;
    fail: number;
    total: number;
}

interface TagEntry {
    tag: string;
    count: number;
}

interface SiteSummary {
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJSON<T>(filePath: string): T | null {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function getDirs(parentDir: string): string[] {
    if (!fs.existsSync(parentDir)) return [];
    return fs.readdirSync(parentDir, { withFileTypes: true })
        .filter((d: fs.Dirent) => d.isDirectory())
        .map((d: fs.Dirent) => d.name);
}

function getFiles(dir: string, ext?: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter((f: string) => !ext || f.endsWith(ext))
        .sort();
}

/**
 * Parse a timestamp key like "2025-09-03T07-37-22" or filename "2025-09-03T07-37-22.json"
 * into an ISO-like string for display.
 */
function parseTimestampKey(key: string): string {
    return key.replace('.json', '');
}

/**
 * Parse timestamp to a month string "YYYY-MM" for timeline aggregation.
 */
function toMonth(ts: string): string {
    // format: "2025-09-03T07-37-22"
    const parts = ts.split('T')[0];
    if (!parts) return 'unknown';
    const [year, month] = parts.split('-');
    return `${year}-${month}`;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    const args = process.argv.slice(2);
    let metadataDir = 'public/metadata';

    // Parse --metadata-dir argument
    const mdIdx = args.indexOf('--metadata-dir');
    if (mdIdx !== -1 && args[mdIdx + 1]) {
        metadataDir = args[mdIdx + 1];
    }

    // Resolve absolute
    metadataDir = path.resolve(metadataDir);

    if (!fs.existsSync(metadataDir)) {
        console.error(`[ERROR] Metadata directory not found: ${metadataDir}`);
        process.exit(1);
    }

    console.log(`[INFO] Processing metadata from: ${metadataDir}`);

    // Load opt-out plugins
    const optOutFile = path.join(metadataDir, 'opt-out-plugins.json');
    const optOutData = readJSON<{ opted_out_plugins: string[] }>(optOutFile);
    const optOutPlugins = new Set(optOutData?.opted_out_plugins ?? []);
    console.log(`[INFO] Opt-out plugins: ${[...optOutPlugins].join(', ') || 'none'}`);

    // -----------------------------------------------------------------------
    // Step 1: Discover plugin directories
    // -----------------------------------------------------------------------
    const allDirs = getDirs(metadataDir);
    // Filter to only directories that have reports/aggregated_migrations.json
    // OR modernization-metadata/ directory
    const pluginDirs = allDirs.filter(dir => {
        if (optOutPlugins.has(dir)) return false;
        // Skip non-plugin directories
        if (['reports', '.github', 'metadata-plugin-modernizer-main', '.git'].includes(dir)) return false;
        const hasAggregated = fs.existsSync(path.join(metadataDir, dir, 'reports', 'aggregated_migrations.json'));
        const hasModMeta = fs.existsSync(path.join(metadataDir, dir, 'modernization-metadata'));
        return hasAggregated || hasModMeta;
    }).sort();

    console.log(`[INFO] Found ${pluginDirs.length} plugin directories`);

    // -----------------------------------------------------------------------
    // Step 2: Build plugin reports
    // -----------------------------------------------------------------------
    const pluginReports: PluginReport[] = [];
    const allMigrations: Migration[] = [];
    let warnings = 0;

    for (const pluginDir of pluginDirs) {
        const aggFile = path.join(metadataDir, pluginDir, 'reports', 'aggregated_migrations.json');
        const modMetaDir = path.join(metadataDir, pluginDir, 'modernization-metadata');

        // Read aggregated file for plugin-level metadata and migration data
        const aggData = readJSON<AggregatedFile>(aggFile);

        const pluginName = aggData?.pluginName ?? pluginDir;
        const pluginRepository = aggData?.pluginRepository ?? '';

        // Build migration list
        // Strategy: Use aggregated migrations as primary (they have the 'timestamp' field).
        // Fall back to individual files if aggregated is missing.
        const migrations: Migration[] = [];
        const seenKeys = new Set<string>();

        if (aggData?.migrations) {
            for (const m of aggData.migrations) {
                const key = m.key ?? m.timestamp ?? '';
                seenKeys.add(key);
                migrations.push(normalizeMigration(m, key));
            }
        }

        // Check individual migration files for any that are NOT in aggregated
        if (fs.existsSync(modMetaDir)) {
            const indFiles = getFiles(modMetaDir, '.json');
            for (const indFile of indFiles) {
                const key = indFile; // "2025-09-03T07-37-22.json"
                if (seenKeys.has(key)) continue;

                const indData = readJSON<RawMigration>(path.join(modMetaDir, indFile));
                if (!indData) continue;

                // Individual files don't have 'timestamp', derive from filename
                const timestamp = parseTimestampKey(indFile);
                migrations.push(normalizeMigration({ ...indData, key, timestamp }, key));
                seenKeys.add(key);
            }

            if (indFiles.length !== (aggData?.migrations?.length ?? 0)) {
                const diff = indFiles.length - (aggData?.migrations?.length ?? 0);
                if (diff > 0) {
                    console.log(`[WARN] ${pluginName}: ${diff} migration(s) found in individual files but not in aggregated`);
                    warnings++;
                }
            }
        }

        // Sort migrations by timestamp (newest first)
        migrations.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        // Compute stats
        const successCount = migrations.filter(m => m.migrationStatus === 'success').length;
        const failCount = migrations.filter(m =>
            m.migrationStatus === 'failure' || m.migrationStatus === 'fail'
        ).length;
        const totalMigrations = migrations.length;
        const successRate = totalMigrations > 0 ? round2((successCount / totalMigrations) * 100) : 0;

        // PR stats (deduplicate by PR URL)
        const prUrls = new Map<string, string>();
        for (const m of migrations) {
            if (m.pullRequestUrl) {
                // Later entries (sorted newest first) take precedence for status
                if (!prUrls.has(m.pullRequestUrl)) {
                    prUrls.set(m.pullRequestUrl, m.pullRequestStatus);
                }
            }
        }
        const openPRs = [...prUrls.values()].filter(s => s === 'open').length;
        const mergedPRs = [...prUrls.values()].filter(s => s === 'merged').length;
        const closedPRs = [...prUrls.values()].filter(s => s === 'closed').length;

        const latestMigration = migrations.length > 0 ? migrations[0].timestamp : null;

        pluginReports.push({
            pluginName,
            pluginRepository,
            totalMigrations,
            successCount,
            failCount,
            successRate,
            openPRs,
            mergedPRs,
            closedPRs,
            latestMigration,
            migrations,
        });

        allMigrations.push(...migrations);
    }

    // Sort plugins alphabetically
    pluginReports.sort((a, b) => a.pluginName.localeCompare(b.pluginName));

    console.log(`[INFO] Processed ${pluginReports.length} plugins with ${allMigrations.length} total migrations`);
    if (warnings > 0) {
        console.log(`[WARN] ${warnings} plugin(s) had discrepancies between aggregated and individual files`);
    }

    // -----------------------------------------------------------------------
    // Step 3: Build recipe reports
    // -----------------------------------------------------------------------
    const recipesDir = path.join(metadataDir, 'reports', 'recipes');
    const recipeReports: RecipeReport[] = [];

    if (fs.existsSync(recipesDir)) {
        const recipeFiles = getFiles(recipesDir, '.json');
        for (const rf of recipeFiles) {
            const recipeData = readJSON<{
                recipeId: string;
                totalApplications: number;
                successCount: number;
                failureCount: number;
                plugins: RecipePlugin[];
            }>(path.join(recipesDir, rf));

            if (!recipeData) continue;

            const totalApps = recipeData.totalApplications;
            const successRate = totalApps > 0 ? round2((recipeData.successCount / totalApps) * 100) : 0;

            recipeReports.push({
                recipeId: recipeData.recipeId,
                totalApplications: totalApps,
                successCount: recipeData.successCount,
                failureCount: recipeData.failureCount,
                successRate,
                plugins: recipeData.plugins || [],
            });
        }
    }

    // Sort by total applications descending
    recipeReports.sort((a, b) => b.totalApplications - a.totalApplications);
    console.log(`[INFO] Processed ${recipeReports.length} recipes`);

    // -----------------------------------------------------------------------
    // Step 4: Build summary
    // -----------------------------------------------------------------------

    // Recipe stats for summary
    const recipeStats: RecipeStats[] = recipeReports.map(r => {
        const pending = r.plugins.filter(p => !['success', 'fail', 'failure'].includes(p.status)).length;
        return {
            recipeId: r.recipeId,
            total: r.totalApplications,
            success: r.successCount,
            fail: r.failureCount,
            pending,
        };
    });

    // Timeline: aggregate migrations by month
    const timelineMap = new Map<string, { success: number; fail: number; total: number }>();
    for (const m of allMigrations) {
        const month = toMonth(m.timestamp);
        if (month === 'unknown') continue;
        const entry = timelineMap.get(month) || { success: 0, fail: 0, total: 0 };
        entry.total++;
        if (m.migrationStatus === 'success') entry.success++;
        if (m.migrationStatus === 'fail' || m.migrationStatus === 'failure') entry.fail++;
        timelineMap.set(month, entry);
    }
    const timeline: TimelineEntry[] = [...timelineMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data }));

    // Tags aggregation
    const tagMap = new Map<string, number>();
    for (const m of allMigrations) {
        if (m.tags) {
            for (const tag of m.tags) {
                tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
            }
        }
    }
    const tags: TagEntry[] = [...tagMap.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([tag, count]) => ({ tag, count }));

    // Global PR stats (deduplicate across all plugins)
    const globalPRs = new Map<string, string>();
    for (const m of allMigrations) {
        if (m.pullRequestUrl) {
            if (!globalPRs.has(m.pullRequestUrl)) {
                globalPRs.set(m.pullRequestUrl, m.pullRequestStatus);
            }
        }
    }
    const totalPRs = globalPRs.size;
    const globalOpenPRs = [...globalPRs.values()].filter(s => s === 'open').length;
    const globalMergedPRs = [...globalPRs.values()].filter(s => s === 'merged').length;
    const globalClosedPRs = [...globalPRs.values()].filter(s => s === 'closed').length;
    const mergeRate = totalPRs > 0 ? round2((globalMergedPRs / totalPRs) * 100) : 0;

    // Overall stats
    const totalMigrations = allMigrations.length;
    const successfulMigrations = allMigrations.filter(m => m.migrationStatus === 'success').length;
    const failedMigrations = allMigrations.filter(m =>
        m.migrationStatus === 'fail' || m.migrationStatus === 'failure'
    ).length;
    const pendingMigrations = totalMigrations - successfulMigrations - failedMigrations;
    const overallSuccessRate = totalMigrations > 0
        ? round2((successfulMigrations / totalMigrations) * 100)
        : 0;

    const summary: SiteSummary = {
        generatedAt: new Date().toISOString(),
        overview: {
            totalPlugins: pluginReports.length,
            totalMigrations,
            successfulMigrations,
            failedMigrations,
            pendingMigrations,
            successRate: overallSuccessRate,
        },
        pullRequests: {
            totalPRs,
            openPRs: globalOpenPRs,
            closedPRs: globalClosedPRs,
            mergedPRs: globalMergedPRs,
            mergeRate,
        },
        recipes: recipeStats,
        timeline,
        tags,
    };

    // -----------------------------------------------------------------------
    // Step 5: Write output files
    // -----------------------------------------------------------------------
    const outDir = path.join(metadataDir, 'reports', 'site-data');
    fs.mkdirSync(outDir, { recursive: true });

    const writeJSON = (filename: string, data: unknown) => {
        const filePath = path.join(outDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        const sizeKB = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
        console.log(`[INFO] Wrote ${filePath} (${sizeKB} KB)`);
    };

    writeJSON('summary.json', summary);
    writeJSON('plugins.json', pluginReports);
    writeJSON('recipes.json', recipeReports);

    // Plugins index (just the list of plugin names)
    const pluginsIndex = pluginReports.map(p => p.pluginName);
    writeJSON('plugins-index.json', pluginsIndex);

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------
    console.log('\n--- Validation ---');
    console.log(`Total plugins: ${pluginReports.length}`);
    console.log(`Total migrations: ${totalMigrations}`);
    console.log(`  Success: ${successfulMigrations} | Failed: ${failedMigrations} | Pending: ${pendingMigrations}`);
    console.log(`  Success rate: ${overallSuccessRate}%`);
    console.log(`Total PRs: ${totalPRs} (Open: ${globalOpenPRs}, Merged: ${globalMergedPRs}, Closed: ${globalClosedPRs})`);
    console.log(`Merge rate: ${mergeRate}%`);
    console.log(`Recipes: ${recipeReports.length}`);
    console.log(`Timeline months: ${timeline.length}`);
    console.log(`Tags: ${tags.length}`);

    // Cross-validate migration totals
    const pluginMigTotal = pluginReports.reduce((sum, p) => sum + p.totalMigrations, 0);
    if (pluginMigTotal !== totalMigrations) {
        console.error(`[ERROR] Migration count mismatch: summary=${totalMigrations}, plugins sum=${pluginMigTotal}`);
        process.exit(1);
    }

    console.log('\n[SUCCESS] Consolidation complete!');
}

// ---------------------------------------------------------------------------
// Normalize a raw migration into the canonical shape
// ---------------------------------------------------------------------------
function normalizeMigration(raw: RawMigration, key: string): Migration {
    return {
        pluginVersion: raw.pluginVersion ?? '',
        jenkinsBaseline: raw.jenkinsBaseline ?? '',
        targetBaseline: raw.targetBaseline ?? '',
        effectiveBaseline: raw.effectiveBaseline ?? '',
        jenkinsVersion: raw.jenkinsVersion ?? '',
        migrationName: raw.migrationName ?? '',
        migrationDescription: raw.migrationDescription ?? '',
        tags: raw.tags ?? [],
        migrationId: raw.migrationId ?? '',
        migrationStatus: raw.migrationStatus ?? '',
        pullRequestUrl: raw.pullRequestUrl ?? '',
        pullRequestStatus: raw.pullRequestStatus ?? '',
        dryRun: raw.dryRun ?? false,
        additions: raw.additions ?? 0,
        deletions: raw.deletions ?? 0,
        changedFiles: raw.changedFiles ?? 0,
        key: key,
        path: raw.path ?? '',
        checkRuns: raw.checkRuns ?? {},
        checkRunsSummary: raw.checkRunsSummary ?? '',
        defaultBranch: raw.defaultBranch ?? '',
        defaultBranchLatestCommitSha: raw.defaultBranchLatestCommitSha ?? '',
        timestamp: raw.timestamp ?? parseTimestampKey(key),
    };
}

// Run
main();
