import { createTheme } from '@mui/material/styles';
import type { PluginStatusColor, StatusCardDef } from './types';

/**
 * Single source of truth for all colors used across the application.
 * MUI sx props should reference theme palette paths (e.g. 'background.paper').
 * ECharts configs and inline styles should import from this `colors` object.
 */
export const colors = {
  bg: {
    default: '#15171a',
    paper: '#1e2329',
    sidebar: '#1a1d21',
    hoverSubtle: '#1a1c20',
  },

  border: {
    default: '#1e293b',
    hover: '#334155',
  },

  white: '#ffffff',

  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    disabled: '#475569',
    body: '#cbd5e1',
    muted: '#64748b',
    emphasis: '#e2e8f0',
  },

  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },

  success: {
    main: '#22c55e',
    light: '#4ade80',
  },

  error: {
    main: '#ef4444',
    light: '#f87171',
    detail: '#fca5a5',
  },

  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
  },

  secondary: {
    main: '#a855f7',
    light: '#c084fc',
  },

  accent: {
    indigo: '#6366f1',
    indigoLight: '#818cf8',
    cyan: '#06b6d4',
    pink: '#ec4899',
    lime: '#84cc16',
  },

  chart: {
    tagsPalette: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'],
  },
} as const;

export const statusColorMap: Record<PluginStatusColor, string> = {
  green: colors.success.main,
  red: colors.error.main,
  blue: colors.primary.main,
  yellow: colors.warning.main,
  white: colors.accent.cyan,
};

export const statusDefaultLabels: Record<PluginStatusColor, string> = {
  green: 'Success',
  red: 'Fail',
  blue: 'Mostly Success',
  yellow: 'Mostly Fail',
  white: 'Not Reported',
};

export const STATUS_CARD_DEFS: StatusCardDef[] = [
  { key: 'green', label: 'All Passed', desc: 'Every migration succeeded' },
  { key: 'red', label: 'All Failed', desc: 'Every migration failed' },
  { key: 'blue', label: 'Mostly Passed', desc: 'Migration failures are under 50%' },
  { key: 'yellow', label: 'Mostly Failed', desc: 'Migration failures at 50% or more' },
];

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: colors.bg.default,
      paper: colors.bg.paper,
    },
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },
  typography: {
    fontFamily:
      'system-ui, "Segoe UI", roboto, "Noto Sans", oxygen, ubuntu, cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg.default,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        },
      },
    },
  },
});
