import { useState, useEffect } from 'react';
import { dataClient } from '../lib/dataClient';
import type { AppData, PluginRecipesIndex, PluginReport, RecipeReport, Result } from '../types';

interface HookState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface KeyedState<T> extends HookState<T> {
  key: string;
}

function settle<T>(result: Result<T>): HookState<T> {
  if (result.ok === true) {
    return { data: result.data, error: null, loading: false };
  }
  return { data: null, error: result.error, loading: false };
}

export function useIndex(): HookState<PluginRecipesIndex> {
  const [state, setState] = useState<HookState<PluginRecipesIndex>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    dataClient.getIndex().then((r) => {
      if (!cancelled) setState(settle(r));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function usePluginData(pluginId: string): HookState<PluginReport> {
  const [state, setState] = useState<KeyedState<PluginReport>>({
    key: pluginId,
    data: null,
    error: null,
    loading: true,
  });

  let current = state;
  if (state.key !== pluginId) {
    current = { key: pluginId, data: null, error: null, loading: true };
    setState(current);
  }

  useEffect(() => {
    let cancelled = false;
    dataClient.getPluginReport(pluginId).then((r) => {
      if (cancelled) return;
      if (r.ok === true) {
        setState((prev) => ({ ...prev, data: r.data, error: null, loading: false }));
      } else {
        setState((prev) => ({ ...prev, data: null, error: r.error, loading: false }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pluginId]);

  return current;
}

export function useFailedMigrations(pluginId: string): HookState<string> {
  const [state, setState] = useState<KeyedState<string>>({
    key: pluginId,
    data: null,
    error: null,
    loading: true,
  });

  let current = state;
  if (state.key !== pluginId) {
    current = { key: pluginId, data: null, error: null, loading: true };
    setState(current);
  }

  useEffect(() => {
    let cancelled = false;
    dataClient.getPluginFailedMigrations(pluginId).then((r) => {
      if (cancelled) return;
      if (r.ok === true) {
        setState((prev) => ({ ...prev, data: r.data, error: null, loading: false }));
      } else {
        setState((prev) => ({ ...prev, data: null, error: r.error, loading: false }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pluginId]);

  return current;
}

export function useAllPlugins(): HookState<PluginReport[]> {
  const [state, setState] = useState<HookState<PluginReport[]>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    dataClient.getAllPlugins().then((r) => {
      if (!cancelled) setState(settle(r));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useAllRecipes(): HookState<RecipeReport[]> {
  const [state, setState] = useState<HookState<RecipeReport[]>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    dataClient.getAllRecipes().then((r) => {
      if (!cancelled) setState(settle(r));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useAppData(): HookState<AppData> {
  const [state, setState] = useState<HookState<AppData>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([dataClient.getSummary(), dataClient.getAllPlugins(), dataClient.getAllRecipes()]).then(
      ([sr, pr, rr]) => {
        if (cancelled) return;
        if (sr.ok === false) {
          setState({ data: null, error: sr.error, loading: false });
        } else if (pr.ok === false) {
          setState({ data: null, error: pr.error, loading: false });
        } else if (rr.ok === false) {
          setState({ data: null, error: rr.error, loading: false });
        } else {
          setState({
            data: { summary: sr.data, plugins: pr.data, recipes: rr.data },
            error: null,
            loading: false,
          });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
