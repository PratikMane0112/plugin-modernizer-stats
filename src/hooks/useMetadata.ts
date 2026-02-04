import { useState, useEffect } from 'react';
import type { AppData, PluginReport, GlobalSummary } from '../types';

/**
 * Hook to fetch and aggregate all plugin metadata
 */
export const useMetadata = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setLoading(true);

                // Fetch the list of all plugins from the generated index
                const indexResponse = await fetch('/metadata/plugins-index.json');
                if (!indexResponse.ok) {
                    throw new Error('Failed to load plugins index');
                }
                const pluginNames: string[] = await indexResponse.json();

                // Fetch aggregated data for each plugin
                const pluginPromises = pluginNames.map(async (pluginName) => {
                    try {
                        const reportResponse = await fetch(`/metadata/${pluginName}/reports/aggregated_migrations.json`);
                        if (!reportResponse.ok) return null;

                        // Validate it's actually JSON before parsing
                        const contentType = reportResponse.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            return null; // Skip non-JSON responses silently
                        }

                        const pluginData: PluginReport = await reportResponse.json();

                        // Validate the structure
                        if (!pluginData.pluginName || !Array.isArray(pluginData.migrations)) {
                            return null; // Skip invalid data structure
                        }

                        return pluginData;
                    } catch (err) {
                        // Silently skip plugins with errors - this is expected for some plugins
                        return null;
                    }
                });

                const pluginResults = await Promise.all(pluginPromises);
                const plugins = pluginResults.filter((p): p is PluginReport => p !== null);

                // Calculate global summary
                const summary: GlobalSummary = {
                    totalPlugins: plugins.length,
                    totalMigrations: 0,
                    successfulMigrations: 0,
                    failedMigrations: 0,
                    recipes: {}
                };

                plugins.forEach(plugin => {
                    plugin.migrations?.forEach(migration => {
                        summary.totalMigrations++;

                        if (migration.migrationStatus === 'success') {
                            summary.successfulMigrations++;
                        } else {
                            summary.failedMigrations++;
                        }

                        // Aggregate recipe stats
                        const recipeName = migration.migrationId;
                        if (!summary.recipes[recipeName]) {
                            summary.recipes[recipeName] = {
                                name: recipeName,
                                total: 0,
                                success: 0,
                                fail: 0
                            };
                        }

                        summary.recipes[recipeName].total++;
                        if (migration.migrationStatus === 'success') {
                            summary.recipes[recipeName].success++;
                        } else {
                            summary.recipes[recipeName].fail++;
                        }
                    });
                });

                setData({ summary, plugins });
                setError(null);
            } catch (err) {
                console.error('Error fetching metadata:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch metadata'));
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, []);

    return { data, loading, error };
};

/**
 * Hook to fetch data for a specific plugin
 */
export const usePluginData = (pluginName: string) => {
    const [plugin, setPlugin] = useState<PluginReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!pluginName) {
            setLoading(false);
            return;
        }

        const fetchPluginData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/metadata/${pluginName}/reports/aggregated_migrations.json`);

                if (!response.ok) {
                    throw new Error(`Plugin not found: ${pluginName}`);
                }

                const pluginData: PluginReport = await response.json();
                setPlugin(pluginData);
                setError(null);
            } catch (err) {
                console.error(`Error fetching plugin data for ${pluginName}:`, err);
                setError(err instanceof Error ? err : new Error('Failed to fetch plugin data'));
            } finally {
                setLoading(false);
            }
        };

        fetchPluginData();
    }, [pluginName]);

    return { plugin, loading, error };
};
