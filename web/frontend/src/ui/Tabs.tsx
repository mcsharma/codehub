import * as stylex from '@stylexjs/stylex';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ComponentProps } from 'react';
import { colors, fontSizes, fontWeights, space } from '../theme/tokens.stylex';

// MUI's real Tabs "standard" (line) variant: theme.ts's `MuiTab`
// override sets `textTransform: 'none'` (beating MUI's own uppercase
// default); indicator is `primary.main` (brand blue), 2px, no
// theme.ts customization on `MuiTabs` itself beyond that.
//
// NOTE: RepoHeader uses this for URL-driven navigation (Code/Commits/
// Settings), not panel-switching — `value` is derived from the current
// route, each Tab wraps a react-router `Link` via the `render` prop, and
// no `Tabs.Panel` is rendered since the router (not Tabs) swaps the page
// content. Don't "simplify" this back to plain styled links — Tabs still
// buys real keyboard/ARIA tablist behavior (roving tabindex, arrow-key
// navigation between tabs) that plain links wouldn't have.
const styles = stylex.create({
  root: {
    position: 'relative',
  },
  list: {
    display: 'flex',
    position: 'relative',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  tab: {
    // Base UI's Tab renders a raw <button> when used without `render`
    // (this app's disabled "Issues" tab, which has nowhere to link to) —
    // reset native chrome so it looks identical to the `render`+`Link`
    // tabs regardless of which element it actually is.
    appearance: 'none',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    font: 'inherit',
    outline: 'none',
    // prod's real value: RepoHeader's own `sx={{ minHeight: 40 }}` on
    // both Tabs and each Tab (MUI's own default is 48px unmodified).
    minHeight: space[5],
    display: 'flex',
    alignItems: 'center',
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.sm,
    textTransform: 'none',
    position: 'relative',
    cursor: 'pointer',
    gap: space[1],
    // Prod uses paddingInline (not marginInline) for the hit-target so the
    // 2px bottom-indicator stretches to the full padded width. marginInline
    // was pushing tabs 24px apart on each side — too wide.
    paddingInline: space[2],
    marginInline: 0,
    color: colors.fgMuted,
    textDecoration: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    marginBottom: '-1px',
    // Base UI's Tab uses `data-active` for the selected tab, not Ark's
    // `data-selected` naming.
    ':is([data-active])': {
      color: colors.brandSolid,
      borderBottomColor: colors.brandSolid,
    },
    ':is([data-disabled])': {
      // MUI's real disabled color is action.disabled = rgba(0,0,0,0.38),
      // applied directly — NOT opacity:0.5 on the whole tab (which
      // also dims icons/children differently than prod).
      color: 'rgba(0, 0, 0, 0.38)',
      opacity: 1,
      cursor: 'default',
      pointerEvents: 'none',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '2px',
    },
  },
});

export interface TabsRootProps extends ComponentProps<typeof BaseTabs.Root> {
  xstyle?: stylex.CompiledStyles;
}

export const TabsRoot = ({ xstyle, children, ...rest }: TabsRootProps) => (
  <BaseTabs.Root {...rest} {...stylex.props(styles.root, xstyle)}>
    {children}
  </BaseTabs.Root>
);

export const TabsList = (props: ComponentProps<typeof BaseTabs.List>) => (
  <BaseTabs.List {...props} {...stylex.props(styles.list)} />
);

export interface TabsTriggerProps extends ComponentProps<typeof BaseTabs.Tab> {
  xstyle?: stylex.CompiledStyles;
}

export const TabsTrigger = ({ xstyle, children, ...rest }: TabsTriggerProps) => (
  <BaseTabs.Tab {...rest} {...stylex.props(styles.tab, xstyle)}>
    {children}
  </BaseTabs.Tab>
);
