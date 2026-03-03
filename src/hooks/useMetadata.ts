import { useState, useEffect } from 'react';
import { dataClient } from '../lib/dataClient';
import type { SummaryJson, PluginRecipesIndex, PluginReport, RecipeReport } from '../types';

// ── Re-export AppData shape for consumers ───────────────────────────────────
export interface AppData {
    summary: SummaryJson;
    plugins: PluginReport[];
    recipes: RecipeReport[];
}

/**
 * Hook to fetch summary + all recipes.
 */
export const useMetadata = () => {
    const [summary, setSummary] = useState<SummaryJson | null>(null);
    const [recipes, setRecipes] = useState<RecipeReport[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            const [summaryResult, recipesResult] = await Promise.all([
                dataClient.getSummary(),
                dataClient.getAllRecipes(),
            ]);

            if (cancelled) return;

            if (!summaryResult.ok) {
                setError(new Error(summaryResult.error));
                setLoading(false);
                return;
            }

            setSummary(summaryResult.data);

            if (recipesResult.ok) {
                setRecipes(recipesResult.data);
            } else {
                console.warn('[useMetadata] Failed to load recipes:', recipesResult.error);
                setRecipes([]);
            }

            setError(null);
            setLoading(false);
        };

        load();
        return () => { cancelled = true; };
    }, []);

    return { summary, recipes, loading, error };
};

/**
 * Hook to fetch the plugin-recipes index.
 */
export const useIndex = () => {
    const [index, setIndex] = useState<PluginRecipesIndex | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const result = await dataClient.getIndex();
            if (cancelled) return;
            if (result.ok) {
                setIndex(result.data);
                setError(null);
            } else {
                setError(new Error(result.error));
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return { index, loading, error };
};

/**
 * Hook to fetch data for a specific plugin.
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

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const result = await dataClient.getPluginReport(pluginName);
            if (cancelled) return;
            if (result.ok) {
                setPlugin(result.data);
                setError(null);
            } else {
                setError(new Error(result.error));
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [pluginName]);

    return { plugin, loading, error };
};

/**
 * Hook to fetch a single recipe by name.
 */
export const useRecipeData = (recipeName: string) => {
    const [recipe, setRecipe] = useState<RecipeReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!recipeName) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const result = await dataClient.getRecipe(recipeName);
            if (cancelled) return;
            if (result.ok) {
                setRecipe(result.data);
                setError(null);
            } else {
                setError(new Error(result.error));
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [recipeName]);

    return { recipe, loading, error };
};

/**
 * Hook to fetch failed migrations CSV for a plugin.
 */
export const useFailedMigrations = (pluginName: string) => {
    const [csvData, setCsvData] = useState<string[][] | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pluginName) return;

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const result = await dataClient.getPluginFailedMigrations(pluginName);
            if (cancelled) return;
            if (result.ok) {
                const lines = result.data.trim().split('\n');
                if (lines.length > 0) {
                    setHeaders(lines[0].split(','));
                    setCsvData(lines.slice(1).map(line => line.split(',')));
                }
            } else {
                // 404 is normal — many plugins don't have failed migrations
                setCsvData(null);
                setHeaders([]);
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [pluginName]);

    return { csvData, headers, loading };
};

/**
 * Hook to fetch all plugin reports for the plugins list page.
 */
export const useAllPlugins = () => {
    const [plugins, setPlugins] = useState<PluginReport[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const result = await dataClient.getAllPlugins();
            if (cancelled) return;
            if (result.ok) {
                setPlugins(result.data);
                setError(null);
            } else {
                setError(new Error(result.error));
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return { plugins, loading, error };
};

/**
 * Hook to fetch the full AppData bundle (summary + plugins + recipes).
 * Used by pages that need access to all three datasets.
 */
export const useAppData = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const [summaryResult, pluginsResult, recipesResult] = await Promise.all([
                dataClient.getSummary(),
                dataClient.getAllPlugins(),
                dataClient.getAllRecipes(),
            ]);

            if (cancelled) return;

            if (!summaryResult.ok) {
                setError(new Error(summaryResult.error));
                setLoading(false);
                return;
            }

            setData({
                summary: summaryResult.data,
                plugins: pluginsResult.ok ? pluginsResult.data : [],
                recipes: recipesResult.ok ? recipesResult.data : [],
            });
            setError(null);
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return { data, loading, error };
};