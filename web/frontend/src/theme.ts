import { createTheme } from '@mui/material/styles'

// Palette pulled directly from the mockups' Tailwind config.
const palette = {
  primary: '#1d4ed8',
  surface: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.primary,
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: palette.text,
      secondary: palette.textMuted,
    },
    divider: palette.border,
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: palette.surface,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: `1px solid ${palette.border}`,
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: palette.text,
          boxShadow: 'none',
          borderBottom: `1px solid ${palette.border}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          // Tab spreads `theme.typography.button` (textTransform:
          // 'uppercase' by default) straight into its own base styles —
          // per-instance `sx` on the Tab doesn't reliably beat that, so
          // neutralize it here the same way MuiButton above does.
          textTransform: 'none',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: '16px',
          // Container's own built-in default bumps horizontal gutters to
          // 24px at this breakpoint regardless of the flat padding above
          // (confirmed in devtools — a `@media (min-width: 600px)` rule
          // baked into the component itself). Only overriding left/right
          // here, not the `padding` shorthand, so this can't reintroduce
          // the earlier bug where a shorthand override here beat a more
          // specific per-instance `sx={{ pb: 0 }}`.
          '@media (min-width: 600px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
  },
})

export const monoFontFamily =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
