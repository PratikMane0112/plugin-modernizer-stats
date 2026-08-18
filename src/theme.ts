import { createTheme } from '@mui/material/styles';
import type { PluginStatusColor, StatusCardDef } from './types';
import type { RateTier } from './util/recipeStatus';

/**
 * Centralized color palette — single source of truth for colors & theme.
 *
 * ┌───────────────────────┬──────────────┬──────────────┬───────────────────────────────────────────────┐
 * │ Role                  │ Light Mode   │ Dark Mode    │ Dashboard Use Case                            │
 * ├───────────────────────┼──────────────┼──────────────┼───────────────────────────────────────────────┤
 * │ Red (error)           │ #DC2626     │ #EF4444    │ Critical alerts, errors, negative trends      │
 * │ Amber (warning)       │ #D97706     │ #F59E0B    │ Warnings, pending states, mid-tier alerts     │
 * │ Green (success)       │ #16A34A     │ #22C55E    │ Success states, positive trends, completions  │
 * │ Blue (primary)        │ #2563EB     │ #3B82F6    │ Primary actions, links, brand accent          │
 * │ Purple (secondary)    │ #7C3AED     │ #A855F7    │ Secondary series, user roles, highlights      │
 * │ Pink (pink)           │ #DB2777     │ #EC4899    │ Third data series, distinct categories        │
 * │ Orange (orange)       │ #EA580C     │ #F97316    │ Attention grabbers, alternate warnings        │
 * │ Cyan (cyan)           │ #0891B2     │ #06B6D4    │ Info banners, tooltips, neutral charts        │
 * │ Gray (neutral)        │ #4B5563     │ #9CA3AF    │ Subdued data, secondary lines, disabled       │
 * │ Slate (border, text)  │ #1E293B     │ #F1F5F9    │ Dark Slate (borders) / Light Slate (text)     │
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
    dark: '#F1F5F9', // Slate dark
    light: '#1E293B', // Slate light
    muted: '#94a3b8', // Muted labels, axis text
    disabled: '#4B5563', // Gray light — disabled controls
    body: '#cbd5e1', // Default paragraph/body text
    emphasis: '#e2e8f0', // Semi-bold callouts
  },

  primary: {
    main: '#1D4ED8', // Blue
    dark: '#3B82F6', // Blue Dark Mode
    light: '#2563EB', // Blue Light Mode
  },

  success: {
    main: '#15803D', // Green
    dark: '#22C55E', // Green Dark Mode
    light: '#16A34A', // Green Light Mode
  },

  error: {
    main: '#B91C1C', // Red
    dark: '#EF4444', // Red Dark Mode
    light: '#DC2626', // Red Light Mode
  },

  warning: {
    main: '#B45309', // Amber
    dark: '#F59E0B', // Amber Dark Mode
    light: '#D97706', // Amber Light Mode
  },

  secondary: {
    main: '#6D28D9', // Purple
    dark: '#A855F7', // Purple Dark Mode
    light: '#7C3AED', // Purple Light Mode
  },

  orange: {
    main: '#C2410C', // Orange
    dark: '#F97316', // Orange Dark Mode
    light: '#EA580C', // Orange Light Mode
  },

  cyan: {
    main: '#0E7490', // Cyan
    dark: '#06B6D4', // Cyan Dark Mode
    light: '#0891B2', // Cyan Light Mode
  },

  pink: {
    main: '#BE185D', // Pink
    dark: '#EC4899', // Pink Dark Mode
    light: '#DB2777', // Pink Light Mode
  },

  neutral: '#9CA3AF', // Gray

  chart: {
    tagsPalette: [
      '#3B82F6', // Blue Dark Mode
      '#16A34A', // Green Light Mode
      '#F59E0B', // Amber Dark Mode
      '#DC2626', // Red Light Mode
      '#A855F7', // Purple Dark Mode
      '#06B6D4', // Cyan Dark Mode
      '#EC4899', // Pink Dark Mode
      '#EA580C', // Orange Light Mode
    ],
  },
} as const;

export const statusColorMap: Record<PluginStatusColor, string> = {
  green: colors.success.light,
  red: colors.error.light,
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
  high: colors.success.light,
  medium: colors.warning.dark,
  low: colors.error.light,
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
      // Blue
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    success: {
      // Green
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    error: {
      // Red
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    warning: {
      // Amber
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    secondary: {
      // Purple
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    text: {
      primary: colors.text.dark,
      secondary: colors.text.muted,
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
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', // Dark mode background pattern
          backgroundSize: '24px 24px',
        },
      },
    },
  },
});
