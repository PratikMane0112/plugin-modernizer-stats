import { useState, useEffect } from 'react';
import type { AppData, PluginReport, SiteSummary, RecipeReport } from '../types';

/**
 * Hook to fetch the consolidated summary and plugin data.
 * Uses pre-consolidated JSON bundles from reports/site-data/ instead
 * of fetching individual files for each plugin.
 */
export const useMetadata = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setLoading(true);

                // Fetch pre-consolidated data files in parallel
                const [summaryRes, pluginsRes, recipesRes] = await Promise.all([
                    fetch('/metadata/reports/site-data/summary.json'),
                    fetch('/metadata/reports/site-data/plugins.json'),
                    fetch('/metadata/reports/site-data/recipes.json'),
                ]);

                if (!summaryRes.ok) throw new Error('Failed to load summary data');
                if (!pluginsRes.ok) throw new Error('Failed to load plugins data');
                if (!recipesRes.ok) throw new Error('Failed to load recipes data');

                const summary: SiteSummary = await summaryRes.json();
                const plugins: PluginReport[] = await pluginsRes.json();
                const recipes: RecipeReport[] = await recipesRes.json();

                setData({ summary, plugins, recipes });
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
 * Hook to fetch data for a specific plugin from the consolidated plugins.json
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

                // Try consolidated data first, fall back to individual file
                const pluginsRes = await fetch('/metadata/reports/site-data/plugins.json');
                if (pluginsRes.ok) {
                    const plugins: PluginReport[] = await pluginsRes.json();
                    const found = plugins.find(p => p.pluginName === pluginName);
                    if (found) {
                        setPlugin(found);
                        setError(null);
                        return;
                    }
                }

                // Fallback: try individual aggregated_migrations.json
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
