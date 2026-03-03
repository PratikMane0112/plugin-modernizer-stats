/**
 * consolidate.ts — Pure Node.js data transformation script.
 *
 * Reads raw data from .tmp/metadata-plugin-modernizer-main/
 * and produces structured JSON files in public/plugin-modernizer-stats/.
 *
 * Outputs:
 *   - summary.json
 *   - plugin-recipes-index.json
 *   - recipes/<recipe-name>.json  (verbatim copies)
 *   - plugins-reports/<plugin-name>/  (verbatim directory copies)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Constants ───────────────────────────────────────────────────────────────
const SRC_DIR = path.resolve('.tmp/metadata-plugin-modernizer-main');
const OUT_DIR = path.resolve('public/plugin-modernizer-stats');
const REPORTS_DIR = path.join(SRC_DIR, 'reports');
const RECIPES_SRC = path.join(REPORTS_DIR, 'recipes');
const SUMMARY_MD = path.join(REPORTS_DIR, 'summary.md');
const RECIPES_OUT = path.join(OUT_DIR, 'recipes');
const PLUGINS_OUT = path.join(OUT_DIR, 'plugins-reports');
const SKIP_DIRS = new Set(['.github', 'reports', '.git']);

let errorCount = 0;
let totalItems = 0;

// ── Helpers ─────────────────────────────────────────────────────────────────
function ensureDir(dirPath: string): void {
    fs.mkdirSync(dirPath, { recursive: true });
}

function warn(msg: string): void {
    console.warn(`[WARN] ${msg}`);
    errorCount++;
}

function copyDirRecursive(src: string, dest: string): void {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        try {
            if (entry.isDirectory()) {
                copyDirRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        } catch (err) {
            warn(`Failed to copy ${srcPath}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
}

// ── 2.2 Parse summary.md ───────────────────────────────────────────────────
interface FailureByRecipe {
    recipeId: string;
    failures: number;
}

interface SummaryOutput {
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
    failuresByRecipe: FailureByRecipe[];
    pluginsWithFailedMigrations: string[];
}

function parseSummaryMd(mdContent: string): SummaryOutput {
    const generatedAtMatch = mdContent.match(/Generated on:\s*(.+?)(?:\n|$)/);
    const generatedAt = generatedAtMatch
        ? new Date(generatedAtMatch[1].trim()).toISOString()
        : new Date().toISOString();

    // Overview section
    const totalMigrationsMatch = mdContent.match(/\*\*Total Migrations\*\*:\s*([\d,]+)/);
    const failedMigrationsMatch = mdContent.match(/\*\*Failed Migrations\*\*:\s*([\d,]+)/);
    const successRateMatch = mdContent.match(/\*\*Success Rate\*\*:\s*([\d.]+)%/);

    const totalMigrations = totalMigrationsMatch ? parseInt(totalMigrationsMatch[1].replace(/,/g, ''), 10) : 0;
    const failedMigrations = failedMigrationsMatch ? parseInt(failedMigrationsMatch[1].replace(/,/g, ''), 10) : 0;
    const successRate = successRateMatch ? parseFloat(successRateMatch[1]) : 0;
    const successfulMigrations = totalMigrations - failedMigrations;

    // Failures by Recipe
    const failuresByRecipe: FailureByRecipe[] = [];
    const recipeFailureRegex = /^-\s+([\w.]+):\s+(\d+)\s+failures?/gm;
    let recipeMatch: RegExpExecArray | null;
    while ((recipeMatch = recipeFailureRegex.exec(mdContent)) !== null) {
        failuresByRecipe.push({
            recipeId: recipeMatch[1],
            failures: parseInt(recipeMatch[2], 10),
        });
    }

    // Plugins with failed migrations
    const pluginsWithFailedMigrations: string[] = [];
    const pluginFailRegex = /^\s*-\s+\[([^\]]+)\]\([^)]+failed_migrations\.csv\)/gm;
    let pluginMatch: RegExpExecArray | null;
    while ((pluginMatch = pluginFailRegex.exec(mdContent)) !== null) {
        pluginsWithFailedMigrations.push(pluginMatch[1]);
    }

    // PR Statistics table
    const totalPRsMatch = mdContent.match(/Total PRs\s*\|\s*(\d+)/);
    const openPRsMatch = mdContent.match(/Open PRs\s*\|\s*(\d+)/);
    const closedPRsMatch = mdContent.match(/Closed PRs\s*\|\s*(\d+)/);
    const mergedPRsMatch = mdContent.match(/Merged PRs\s*\|\s*(\d+)/);

    const totalPRs = totalPRsMatch ? parseInt(totalPRsMatch[1], 10) : 0;
    const openPRs = openPRsMatch ? parseInt(openPRsMatch[1], 10) : 0;
    const closedPRs = closedPRsMatch ? parseInt(closedPRsMatch[1], 10) : 0;
    const mergedPRs = mergedPRsMatch ? parseInt(mergedPRsMatch[1], 10) : 0;
    const mergeRate = totalPRs > 0 ? (mergedPRs / totalPRs) * 100 : 0;

    const fieldCount = [
        totalMigrationsMatch, failedMigrationsMatch, successRateMatch,
        totalPRsMatch, openPRsMatch, closedPRsMatch, mergedPRsMatch,
    ].filter(Boolean).length;

    if (fieldCount < 5) {
        console.error(`WARNING: summary.md may have changed format. Only ${fieldCount} fields parsed.`);
    }

    console.log(`[INFO] Parsed summary.md: ${fieldCount} fields, ${failuresByRecipe.length} recipe failures, ${pluginsWithFailedMigrations.length} failed plugins.`);

    return {
        schemaVersion: '1.0',
        generatedAt,
        overview: {
            totalPlugins: 0, // Will be set after plugin enumeration
            totalMigrations,
            successfulMigrations,
            failedMigrations,
            pendingMigrations: 0,
            successRate,
        },
        pullRequests: {
            totalPRs,
            openPRs,
            closedPRs,
            mergedPRs,
            mergeRate: parseFloat(mergeRate.toFixed(2)),
        },
        failuresByRecipe,
        pluginsWithFailedMigrations,
    };
}

// ── 2.3 Copy recipes ───────────────────────────────────────────────────────
function copyRecipes(): string[] {
    ensureDir(RECIPES_OUT);
    const recipeNames: string[] = [];

    if (!fs.existsSync(RECIPES_SRC)) {
        warn('reports/recipes/ directory not found.');
        return recipeNames;
    }

    const files = fs.readdirSync(RECIPES_SRC);
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        totalItems++;
        const srcPath = path.join(RECIPES_SRC, file);
        const destPath = path.join(RECIPES_OUT, file);
        try {
            const content = fs.readFileSync(srcPath, 'utf-8');
            JSON.parse(content); // validate JSON
            fs.writeFileSync(destPath, content, 'utf-8');
            recipeNames.push(file.replace(/\.json$/, ''));
        } catch (err) {
            warn(`Skipping invalid recipe file ${file}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    recipeNames.sort();
    console.log(`[INFO] Copied ${recipeNames.length} recipe files.`);
    return recipeNames;
}

// ── 2.4 Copy plugin directories ────────────────────────────────────────────
function copyPlugins(): string[] {
    ensureDir(PLUGINS_OUT);
    const pluginNames: string[] = [];

    const entries = fs.readdirSync(SRC_DIR, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (SKIP_DIRS.has(entry.name)) continue;

        totalItems++;
        const srcPath = path.join(SRC_DIR, entry.name);
        const destPath = path.join(PLUGINS_OUT, entry.name);

        try {
            copyDirRecursive(srcPath, destPath);
            pluginNames.push(entry.name);
        } catch (err) {
            warn(`Failed to copy plugin directory ${entry.name}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    pluginNames.sort();
    console.log(`[INFO] Copied ${pluginNames.length} plugin directories.`);
    return pluginNames;
}

// ── 2.5 Generate plugin-recipes-index.json ─────────────────────────────────
interface PluginRecipesIndex {
    schemaVersion: string;
    generatedAt: string;
    plugins: string[];
    recipes: string[];
}

function writeIndex(plugins: string[], recipes: string[], generatedAt: string): void {
    const index: PluginRecipesIndex = {
        schemaVersion: '1.0',
        generatedAt,
        plugins,
        recipes,
    };
    const outPath = path.join(OUT_DIR, 'plugin-recipes-index.json');
    fs.writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`[INFO] Wrote plugin-recipes-index.json (${plugins.length} plugins, ${recipes.length} recipes).`);
}

// ── 2.6 Generate enriched summary.json with recipe stats + timeline ────────
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

interface Migration {
    migrationStatus?: string;
    pullRequestStatus?: string;
    timestamp?: string;
    tags?: string[];
}

interface AggregatedMigrations {
    pluginName: string;
    migrations: Migration[];
}

function buildRecipeStatsFromFiles(recipeNames: string[]): RecipeStats[] {
    const stats: RecipeStats[] = [];
    for (const name of recipeNames) {
        const filePath = path.join(RECIPES_OUT, `${name}.json`);
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw) as {
                recipeId?: string;
                totalApplications?: number;
                successCount?: number;
                failureCount?: number;
                plugins?: { status: string }[];
            };
            const total = data.totalApplications ?? 0;
            const success = data.successCount ?? 0;
            const fail = data.failureCount ?? 0;
            const pending = total - success - fail;
            stats.push({
                recipeId: data.recipeId ?? name,
                total,
                success,
                fail,
                pending: pending > 0 ? pending : 0,
            });
        } catch {
            warn(`Could not read recipe stats for ${name}`);
        }
    }
    return stats;
}

function buildTimelineAndTags(pluginNames: string[]): { timeline: TimelineEntry[]; tags: TagEntry[] } {
    const monthMap = new Map<string, { success: number; fail: number }>();
    const tagMap = new Map<string, number>();

    for (const pluginName of pluginNames) {
        const aggrPath = path.join(PLUGINS_OUT, pluginName, 'reports', 'aggregated_migrations.json');
        if (!fs.existsSync(aggrPath)) continue;

        try {
            const raw = fs.readFileSync(aggrPath, 'utf-8');
            const data = JSON.parse(raw) as AggregatedMigrations;
            if (!Array.isArray(data.migrations)) continue;

            for (const m of data.migrations) {
                // Timeline
                const ts = m.timestamp ?? '';
                const month = ts.substring(0, 7); // "YYYY-MM"
                if (month && month.length === 7) {
                    const entry = monthMap.get(month) ?? { success: 0, fail: 0 };
                    if (m.migrationStatus === 'success') entry.success++;
                    else entry.fail++;
                    monthMap.set(month, entry);
                }

                // Tags
                if (Array.isArray(m.tags)) {
                    for (const tag of m.tags) {
                        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
                    }
                }
            }
        } catch {
            // Skip unreadable files
        }
    }

    const timeline: TimelineEntry[] = [...monthMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, counts]) => ({
            month,
            success: counts.success,
            fail: counts.fail,
            total: counts.success + counts.fail,
        }));

    const tags: TagEntry[] = [...tagMap.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([tag, count]) => ({ tag, count }));

    return { timeline, tags };
}

// ── 2.6 Validation pass ────────────────────────────────────────────────────
function validate(recipeNames: string[], pluginNames: string[]): void {
    const summaryPath = path.join(OUT_DIR, 'summary.json');
    const indexPath = path.join(OUT_DIR, 'plugin-recipes-index.json');

    // summary.json must be valid JSON with at least 3 top-level keys
    try {
        const raw = fs.readFileSync(summaryPath, 'utf-8');
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (Object.keys(parsed).length < 3) {
            throw new Error('summary.json has fewer than 3 top-level keys.');
        }
    } catch (err) {
        console.error(`[ERROR] Validation failed for summary.json: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    }

    // plugin-recipes-index.json must have non-empty plugins and recipes
    try {
        const raw = fs.readFileSync(indexPath, 'utf-8');
        const parsed = JSON.parse(raw) as { plugins?: unknown[]; recipes?: unknown[] };
        if (!parsed.plugins?.length || !parsed.recipes?.length) {
            throw new Error('plugin-recipes-index.json has empty plugins or recipes arrays.');
        }
    } catch (err) {
        console.error(`[ERROR] Validation failed for plugin-recipes-index.json: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    }

    // plugins-reports/ must contain at least 10 subdirectories
    if (pluginNames.length < 10) {
        console.error(`[ERROR] Validation failed: plugins-reports/ has only ${pluginNames.length} directories (need >= 10).`);
        process.exit(1);
    }

    // recipes/ must contain at least 1 .json file
    if (recipeNames.length < 1) {
        console.error('[ERROR] Validation failed: recipes/ has no .json files.');
        process.exit(1);
    }

    console.log('[INFO] All validations passed.');
}

// ── Main ────────────────────────────────────────────────────────────────────
function main(): void {
    console.log('[INFO] Starting consolidation...');

    if (!fs.existsSync(SRC_DIR)) {
        console.error(`[ERROR] Source directory not found: ${SRC_DIR}`);
        console.error('       Run the fetch script first: npm run fetch');
        process.exit(1);
    }

    // Clean output directory
    if (fs.existsSync(OUT_DIR)) {
        fs.rmSync(OUT_DIR, { recursive: true });
    }
    ensureDir(OUT_DIR);

    // Parse summary.md
    let summary: SummaryOutput;
    try {
        const mdContent = fs.readFileSync(SUMMARY_MD, 'utf-8');
        summary = parseSummaryMd(mdContent);
    } catch (err) {
        console.error(`[ERROR] Failed to parse summary.md: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    }

    // Copy recipes
    const recipeNames = copyRecipes();

    // Copy plugin directories
    const pluginNames = copyPlugins();

    // Update plugin count in summary
    summary.overview.totalPlugins = pluginNames.length;

    // Build recipe stats from copied recipe files
    const recipeStats = buildRecipeStatsFromFiles(recipeNames);

    // Build timeline and tags from plugin data
    const { timeline, tags } = buildTimelineAndTags(pluginNames);

    // Compute pending migrations
    let totalPending = 0;
    for (const rs of recipeStats) {
        totalPending += rs.pending;
    }
    summary.overview.pendingMigrations = totalPending;

    // Write enriched summary.json
    const enrichedSummary = {
        ...summary,
        recipes: recipeStats,
        timeline,
        tags,
    };
    fs.writeFileSync(
        path.join(OUT_DIR, 'summary.json'),
        JSON.stringify(enrichedSummary, null, 2),
        'utf-8'
    );
    console.log('[INFO] Wrote summary.json');

    // Write plugin-recipes-index.json
    writeIndex(pluginNames, recipeNames, summary.generatedAt);

    // Validation
    validate(recipeNames, pluginNames);

    // Error rate check
    if (totalItems > 0 && errorCount / totalItems > 0.1) {
        console.error(`[ERROR] Error rate too high: ${errorCount}/${totalItems} (${((errorCount / totalItems) * 100).toFixed(1)}%) — something is systematically wrong.`);
        process.exit(1);
    }

    console.log(`\n[DONE] Processed ${pluginNames.length} plugins, ${recipeNames.length} recipes, ${errorCount} errors encountered.`);

    // Clean up .tmp/ — raw upstream data is no longer needed after consolidation
    const tmpDir = path.resolve('.tmp');
    if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true });
        console.log('[INFO] Cleaned up .tmp/ directory.');
    }
}

main();
