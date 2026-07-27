import * as stylex from '@stylexjs/stylex';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps, ReactNode } from 'react';
import { colors, fontSizes, radii, shadows, space } from '../theme/tokens.stylex';

// MUI's default Menu Paper: `shadows[8]` elevation, `shape.borderRadius`
// (12px, theme.ts's global override), 1px border isn't part of MUI's
// default Menu — its Paper has no border, just the elevation shadow.
const styles = stylex.create({
  popup: {
    outline: 'none',
    backgroundColor: colors.bg,
    boxShadow: shadows.menu,
    color: colors.fg,
    borderRadius: radii.md,
    overflow: 'hidden',
    overflowY: 'auto',
    minWidth: '8rem',
    paddingBlock: space[1],
  },
  item: {
    textDecoration: 'none',
    color: colors.fg,
    userSelect: 'none',
    width: '100%',
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    textAlign: 'start',
    gap: space[2],
    fontSize: fontSizes.md,
    paddingBlock: space[0.75], // 6px
    paddingInline: space[2], // 16px
    outline: 'none',
    appearance: 'none',
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    ':is([data-highlighted])': {
      backgroundColor: colors.bgMuted,
    },
    ':is([data-disabled])': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  separator: {
    height: '1px',
    backgroundColor: colors.border,
    marginBlock: 0,
  },
  label: {
    paddingInline: space[2],
    paddingBlock: space[1], // 8px
    fontSize: fontSizes.xs,
    color: colors.fgMuted,
  },
});

export const MenuRoot = BaseMenu.Root;

export interface MenuTriggerProps extends ComponentProps<typeof BaseMenu.Trigger> {
  xstyle?: stylex.CompiledStyles;
}

// Base UI's Trigger renders a raw <button> when used without `render` —
// reset native chrome up front (appearance/border/background/outline)
// plus an explicit :focus-visible ring, rather than discovering the
// missing reset later from a screenshot.
const triggerStyles = stylex.create({
  base: {
    appearance: 'none',
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '2px',
    },
  },
});

export const MenuTrigger = ({ xstyle, ...rest }: MenuTriggerProps) => (
  <BaseMenu.Trigger {...rest} {...stylex.props(triggerStyles.base, xstyle)} />
);

export interface MenuPopupProps extends ComponentProps<typeof BaseMenu.Popup> {
  xstyle?: stylex.CompiledStyles;
}

export const MenuContent = ({ xstyle, children, ...rest }: MenuPopupProps) => (
  <BaseMenu.Portal>
    <BaseMenu.Positioner sideOffset={4}>
      <BaseMenu.Popup {...rest} {...stylex.props(styles.popup, xstyle)}>
        {children}
      </BaseMenu.Popup>
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
);

export interface MenuItemProps extends ComponentProps<typeof BaseMenu.Item> {
  xstyle?: stylex.CompiledStyles;
}

export const MenuItem = ({ xstyle, children, ...rest }: MenuItemProps) => (
  <BaseMenu.Item {...rest} {...stylex.props(styles.item, xstyle)}>
    {children}
  </BaseMenu.Item>
);

export const MenuSeparator = () => <BaseMenu.Separator {...stylex.props(styles.separator)} />;

export const MenuLabel = ({ children }: { children: ReactNode }) => (
  <div {...stylex.props(styles.label)}>{children}</div>
);
