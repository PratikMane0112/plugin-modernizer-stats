import { createTheme } from '@mui/material/styles';
import type { PluginStatusColor, StatusCardDef } from './types';
import type { RateTier } from './util/recipeStatus';

/**
 * Centralized color palette — single source of truth for colors & theme.
 *
 * ┌───────────────────────┬──────────────┬──────────────┬───────────────────────────────────────────────┐
 * │ Role                  │ Light Mode   │ Dark Mode    │ Dashboard Use Case                            │
 * ├───────────────────────┼──────────────┼──────────────┼───────────────────────────────────────────────┤
 * │ Red (error)           │ #DC2626    │ #EF4444    │ Critical alerts, errors, negative trends      │
 * │ Amber (warning)       │ #D97706    │ #F59E0B    │ Warnings, pending states, mid-tier alerts     │
 * │ Green (success)       │ #16A34A    │ #22C55E    │ Success states, positive trends, completions  │
 * │ Blue (primary)        │ #2563EB    │ #3B82F6    │ Primary actions, links, brand accent          │
 * │ Purple (secondary)    │ #7C3AED    │ #A855F7    │ Secondary series, user roles, highlights      │
 * │ Pink (pink)           │ #DB2777    │ #EC4899    │ Third data series, distinct categories        │
 * │ Orange (orange)       │ #EA580C    │ #F97316    │ Attention grabbers, alternate warnings        │
 * │ Cyan (cyan)           │ #0891B2    │ #06B6D4    │ Info banners, tooltips, neutral charts        │
 * │ Gray (neutral)        │ #4B5563    │ #9CA3AF    │ Subdued data, secondary lines, disabled       │
 * │ Slate (border, text)  │ #1E293B    │ #F1F5F9    │ Dark Slate (borders) / Light Slate (text)     │
 * └───────────────────────┴──────────────┴──────────────┴───────────────────────────────────────────────┘
 */

export const colors = {
  bg: {
    default: '#15171a', // App background
    paper: '#1e2329', // Card/panel background
    hoverSubtle: '#1a1c20', // Subtle hover state
  },

  border: {
    default: '#1E293B', // Slate light — panel borders
    hover: '#334155', // Elevated border on hover
  },

  text: {
    primary: '#F1F5F9', // Slate dark — headings, high-emphasis text
    secondary: '#94a3b8', // Muted labels, axis text
    disabled: '#4B5563', // Gray light — disabled controls
    body: '#cbd5e1', // Default paragraph/body text
    muted: '#64748b', // Low-emphasis, hints
    emphasis: '#e2e8f0', // Semi-bold callouts
  },

  primary: {
    dark: '#3B82F6', // Blue dark — links, brand accent
    light: '#60a5fa', // Blue lighter — hover/focus states
  },

  success: {
    dark: '#16A34A', // Green light-mode — positive trends, completions
    light: '#22C55E', // Green dark-mode — small badges, indicators
  },

  error: {
    dark: '#DC2626', // Red light-mode — critical alerts, failures
    light: '#EF4444', // Red dark-mode — error borders, highlights
  },

  warning: {
    dark: '#F59E0B', // Amber dark — pending states, mid-tier alerts
    light: '#fbbf24', // Amber lighter — warning accents
  },

  secondary: {
    dark: '#A855F7', // Purple dark — feature highlights, user roles
    light: '#c084fc', // Purple lighter — secondary data series
  },

  orange: {
    dark: '#EA580C', // Orange light-mode — attention grabbers, alt warnings
    light: '#F97316', // Orange dark-mode — hover/accent states
  },

  cyan: {
    dark: '#06B6D4', // Cyan dark — info banners, tooltips
    light: '#22d3ee', // Cyan lighter — info links, neutral charts
  },

  pink: {
    dark: '#EC4899', // Pink dark — third data series, categories
    light: '#f472b6', // Pink lighter — hover/accent states
  },

  neutral: '#9CA3AF', // Gray dark — subdued data, secondary lines

  chart: {
    tagsPalette: [
      '#3B82F6', // Blue dark
      '#16A34A', // Green light-mode
      '#F59E0B', // Amber dark
      '#DC2626', // Red light-mode
      '#A855F7', // Purple dark
      '#06B6D4', // Cyan dark
      '#EC4899', // Pink dark
      '#EA580C', // Orange light-mode
    ],
  },
} as const;

export const statusColorMap: Record<PluginStatusColor, string> = {
  green: colors.success.dark,
  red: colors.error.dark,
  blue: colors.primary.dark,
  yellow: colors.warning.dark,
  white: colors.cyan.dark,
};

export const statusDefaultLabels: Record<PluginStatusColor, string> = {
  green: 'Success',
  red: 'Fail',
  blue: 'Mostly Success',
  yellow: 'Mostly Fail',
  white: 'Not Reported',
};

export const rateTierColorMap: Record<RateTier, string> = {
  high: colors.success.dark,
  medium: colors.warning.dark,
  low: colors.error.dark,
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
      main: colors.primary.dark,
      light: colors.primary.light,
    },
    success: {
      main: colors.success.dark,
      light: colors.success.light,
    },
    error: {
      main: colors.error.dark,
      light: colors.error.light,
    },
    warning: {
      main: colors.warning.dark,
      light: colors.warning.light,
    },
    secondary: {
      main: colors.secondary.dark,
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
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', // Light mode background pattern
          backgroundSize: '24px 24px',
        },
      },
    },
  },
});
