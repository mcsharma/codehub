import * as stylex from '@stylexjs/stylex';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { colors, radii } from '../theme/tokens.stylex';
import type { ButtonVariant, ButtonSize } from './Button';

// MUI's real IconButton sizes buttons by padding around the icon, not a
// fixed box: `padding: 8` (medium, default), `padding: 5` (small),
// `padding: 12` (large) — theme.ts doesn't customize `MuiIconButton`.
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    borderRadius: radii.full,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'inherit',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: '120ms',
    outline: 'none',
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '2px',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  sizeXs: { padding: '3px' },
  sizeSm: { padding: '5px' },
  sizeMd: { padding: '8px' },
  sizeLg: { padding: '12px' },

  solid: {
    backgroundColor: colors.solid,
    color: colors.solidContrast,
    borderRadius: radii.md,
    ':hover': { backgroundColor: colors.solidHover },
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    color: colors.fg,
    borderRadius: radii.md,
    ':hover': { backgroundColor: colors.bgSubtle },
  },
  subtle: {
    backgroundColor: colors.bgMuted,
    color: colors.fg,
    borderRadius: radii.md,
    ':hover': { backgroundColor: colors.bgEmphasized },
  },
  // MUI's real IconButton is unfilled + circular by default (no bg/border
  // at rest) — this app's most common usage.
  ghost: {
    backgroundColor: 'transparent',
    color: colors.fgMuted,
    ':hover': { backgroundColor: colors.bgSubtle, color: colors.fg },
  },
});

const sizeStyles: Record<ButtonSize, stylex.CompiledStyles> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const variantStyles: Record<ButtonVariant, stylex.CompiledStyles> = {
  solid: styles.solid,
  outline: styles.outline,
  subtle: styles.subtle,
  ghost: styles.ghost,
};

export interface IconButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  'aria-label': string;
  xstyle?: stylex.CompiledStyles;
}

export const IconButton = ({
  variant = 'ghost',
  size = 'md',
  xstyle,
  children,
  ...rest
}: IconButtonProps) => (
  <button
    {...rest}
    {...stylex.props(styles.base, sizeStyles[size], variantStyles[variant], xstyle)}
  >
    {children}
  </button>
);
