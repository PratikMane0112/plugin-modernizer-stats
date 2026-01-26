import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_DIR = path.resolve(__dirname, '../../metadata-plugin-modernizer');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/modernization-stats.json');

console.log(`Reading metadata from: ${METADATA_DIR}`);

function ingestData() {
    if (!fs.existsSync(METADATA_DIR)) {
        console.error(`Metadata directory not found: ${METADATA_DIR}`);
        process.exit(1);
    }

    const plugins = [];
    const entries = fs.readdirSync(METADATA_DIR, { withFileTypes: true });

    const summary = {
        totalPlugins: 0,
        totalMigrations: 0,
        successfulMigrations: 0,
        failedMigrations: 0,
        recipes: {}
    };

    for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
            const pluginName = entry.name;
            const reportPath = path.join(METADATA_DIR, pluginName, 'reports', 'aggregated_migrations.json');

            if (fs.existsSync(reportPath)) {
                try {
                    const reportContent = fs.readFileSync(reportPath, 'utf-8');
                    const report = JSON.parse(reportContent);

                    plugins.push(report);
                    summary.totalPlugins++;

                    if (report.migrations) {
                        report.migrations.forEach(migration => {
                            summary.totalMigrations++;
                            if (migration.migrationStatus === 'success') {
                                summary.successfulMigrations++;
                            } else {
                                summary.failedMigrations++;
                            }

                            const recipeId = migration.migrationId;
                            if (!summary.recipes[recipeId]) {
                                summary.recipes[recipeId] = { name: recipeId, total: 0, success: 0, fail: 0 };
                            }
                            summary.recipes[recipeId].total++;
                            if (migration.migrationStatus === 'success') {
                                summary.recipes[recipeId].success++;
                            } else {
                                summary.recipes[recipeId].fail++;
                            }
                        });
                    }

                } catch (e) {
                    console.error(`Error parsing report for ${pluginName}:`, e.message);
                }
            }
        }
    }

    const output = {
        summary,
        plugins
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Successfully ingested data for ${summary.totalPlugins} plugins.`);
    console.log(`Output written to: ${OUTPUT_FILE}`);
}

ingestData();
