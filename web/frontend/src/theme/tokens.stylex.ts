import * as stylex from '@stylexjs/stylex';

// Design tokens sourced directly from prod's actual look: this app's own
// `theme.ts` (MUI `createTheme()` config — palette/shape/typography +
// its 8 `MuiXxx.styleOverrides` blocks) for anything the app customizes,
// and MUI's real framework defaults (fetched live from
// raw.githubusercontent.com/mui/material-ui, not guessed) for anything
// `theme.ts` doesn't touch. Two tiers, same shape as MUI's own
// palette/typography split: `rawColors` (the literal values) and
// `colors` (semantic aliases that reference them) — semantic tokens must
// reference the *already-compiled* `var(--xHASH)` string from a separate
// defineVars() call, not a hand-written CSS variable name, since StyleX
// doesn't resolve string literals across keys within the same
// defineVars() call.
//
// This is a deliberate second attempt at this migration — the first
// (branch `ark_ui_exploration`) targeted Chakra UI's default theme
// instead of prod's actual look; that's why `solid`/brand below is blue
// (`theme.ts`'s real `primary.main`), not the neutral gray that attempt
// used.

export const rawColors = stylex.defineVars({
  white: '#ffffff',
  black: '#111827', // theme.ts palette.text.primary
  textMuted: '#6b7280', // theme.ts palette.text.secondary
  surface: '#f9fafb', // theme.ts palette.surface (OutlinedInput bg / body bg)
  borderGray: '#e5e7eb', // theme.ts palette.divider/border

  // MUI's real default grey scale — for anything theme.ts doesn't
  // customize (hover/disabled fills, neutral chip backgrounds, etc.)
  grey50: '#fafafa',
  grey100: '#f5f5f5',
  grey200: '#eeeeee',
  grey300: '#e0e0e0',
  grey400: '#bdbdbd',
  grey500: '#9e9e9e',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  blue50: '#eff6ff', // app's real literal, used verbatim across the app for the active-row/"info" highlight background
  blue600: '#1d4ed8', // theme.ts palette.primary.main
  blue700: '#173ead', // MUI's auto-computed primary.dark == darken(primary.main, 0.2)

  // MUI's real default light-mode status colors (theme.ts doesn't
  // override error/warning/success, so these are the framework defaults)
  red50: '#ffebee',
  red400: '#ef5350', // error.light
  red700: '#d32f2f', // error.main

  orange50: '#fff3e0',
  orange500: '#ff9800', // warning.light
  orange700: '#ed6c02', // warning.main (MUI hardcodes this exact value, not a literal orange[700])

  green50: '#e8f5e9',
  green500: '#4caf50', // success.light
  green800: '#2e7d32', // success.main
});

export const colors = stylex.defineVars({
  bg: rawColors.white,
  bgSubtle: rawColors.surface,
  bgMuted: rawColors.grey100,
  bgEmphasized: rawColors.grey200,
  fg: rawColors.black,
  fgMuted: rawColors.textMuted,
  fgSubtle: rawColors.grey500,
  border: rawColors.borderGray,
  borderMuted: rawColors.grey100,
  borderSubtle: rawColors.grey50,
  borderEmphasized: rawColors.grey300,
  focusRing: rawColors.grey400,

  // Prod's real default button/UI accent IS brand blue (MuiButton's
  // "contained" variant defaults to `color="primary"` everywhere in this
  // app) — unlike the Chakra-targeting attempt's neutral-gray choice,
  // `solid` here is brand blue on purpose.
  solid: rawColors.blue600,
  solidHover: rawColors.blue700,
  solidContrast: rawColors.white,

  brandSolid: rawColors.blue600,
  brandContrast: rawColors.white,
  brandFg: rawColors.blue600,
  // Prod only ever uses one blue tint (`#eff6ff`) — no distinct
  // 100/200-style steps exist in the real app, so these three
  // intentionally collapse to the same value rather than inventing a
  // ramp that doesn't exist in prod.
  brandSubtle: rawColors.blue50,
  brandMuted: rawColors.blue50,
  brandEmphasized: rawColors.blue50,
  brandFocusRing: rawColors.blue600,
  brandBorder: rawColors.blue600,

  errorBg: rawColors.red50,
  errorFg: rawColors.red700,
  errorBorder: rawColors.red400,
  warningBg: rawColors.orange50,
  warningFg: rawColors.orange700,
  warningBorder: rawColors.orange500,
  successBg: rawColors.green50,
  successFg: rawColors.green800,
  successBorder: rawColors.green800,
  info: rawColors.blue50,
  infoFg: rawColors.blue600,
  infoBorder: rawColors.blue600,
});

// MUI's spacing function is a flat `theme.spacing(n) = 8n` px multiplier
// (unmodified in theme.ts), not a token scale — so these keys are just
// that formula pre-computed for every multiple actually used across the
// app's current `sx` props (confirmed via grep), letting call sites
// transcribe e.g. `sx={{ mb: 1, gap: 2 }}` as `space[1]`/`space[2]`
// directly with no value translation.
export const space = stylex.defineVars({
  0: '0px',
  0.25: '2px',
  0.5: '4px',
  0.75: '6px',
  1: '8px',
  1.25: '10px',
  1.5: '12px',
  2: '16px',
  2.5: '20px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  8: '64px',
});

export const radii = stylex.defineVars({
  none: '0',
  sm: '4px',
  md: '12px', // theme.ts shape.borderRadius — the global default (Button, OutlinedInput, Menu/Dialog Paper)
  card: '4px', // MuiCard's own override — deliberately not shape.borderRadius, see MuiCard.styleOverrides in theme.ts
  full: '9999px',
});

export const shadows = stylex.defineVars({
  none: 'none', // MuiButton/MuiAppBar explicitly remove the default MUI elevation shadow
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', // theme.ts MuiCard.styleOverrides' literal shadow
  menu: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)', // MUI's real shadows[8], the default Menu/Popover Paper elevation
  dialog: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)', // MUI's real shadows[24], the default Dialog Paper elevation
});

export const fontSizes = stylex.defineVars({
  xs: '0.75rem', // 12px — MUI's caption variant
  sm: '0.875rem', // 14px — MUI's body2/subtitle2/button variants
  md: '1rem', // 16px — MUI's body1 variant
  lg: '1.25rem', // 20px — MUI's h6 variant
  xl: '1.5rem', // 24px — MUI's h5 variant
  '2xl': '2.125rem', // 34px — MUI's h4 variant
});

export const fontWeights = stylex.defineVars({
  normal: '400',
  medium: '500',
  bold: '700', // theme.ts forces this on MuiButton/MuiChip; MUI's own fontWeightBold default
});

export const lineHeights = stylex.defineVars({
  tight: '1.2',
  normal: '1.5', // MUI's body1 line-height
  relaxed: '1.75', // MUI's button variant line-height
});

export const fonts = stylex.defineVars({
  sans: `"Inter", ui-sans-serif, system-ui, sans-serif`, // theme.ts typography.fontFamily, verbatim
  mono: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`, // theme.ts's monoFontFamily, verbatim
});
