import * as stylex from '@stylexjs/stylex';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { colors, fontSizes, fontWeights, radii, shadows, space } from '../theme/tokens.stylex';

// Prod's real button look. MUI sizes buttons by padding + line-height,
// not a fixed height — these paddings are MUI's real "contained"-variant
// values per size (this app's only variants in real use are "contained"/
// "outlined", both sized identically here; MUI's own 1px outlined-padding
// adjustment is a sub-pixel detail not worth replicating). `borderRadius:
// 12` (shape.borderRadius), `fontWeight: 700`, `textTransform: none`, no
// box-shadow — all from theme.ts's `MuiButton.styleOverrides` — and
// "contained" (this app's `solid`) defaults to `color="primary"` (brand
// blue) everywhere it's used, not a neutral gray.
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    position: 'relative',
    borderRadius: radii.md,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    minWidth: '64px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1.75,
    fontWeight: fontWeights.bold,
    fontFamily: 'inherit',
    boxShadow: shadows.none,
    transitionProperty: 'background-color, border-color, color, box-shadow',
    transitionDuration: '120ms',
    textDecoration: 'none',
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
  sizeXs: { padding: '3px 9px', fontSize: fontSizes.xs, gap: space[1] },
  sizeSm: { padding: '4px 10px', fontSize: fontSizes.sm, gap: space[1] },
  sizeMd: { padding: '6px 16px', fontSize: fontSizes.sm, gap: space[1] },
  sizeLg: { padding: '8px 22px', fontSize: fontSizes.md, gap: space[1.5] },

  solid: {
    backgroundColor: colors.solid,
    color: colors.solidContrast,
    ':hover': { backgroundColor: colors.solidHover },
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.brandSolid,
    color: colors.brandFg,
    ':hover': { backgroundColor: colors.info },
  },
  subtle: {
    backgroundColor: colors.bgMuted,
    color: colors.fg,
    ':hover': { backgroundColor: colors.bgEmphasized },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.fg,
    ':hover': { backgroundColor: colors.bgSubtle },
  },
});

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonVariant = 'solid' | 'outline' | 'subtle' | 'ghost';

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

// Exported so call sites that need a styled *link* (react-router `Link`,
// not a real `<button>`) can compose it directly — e.g.
// `<Link {...stylex.props(...buttonStyles('outline', 'sm'))}>` — instead
// of Button needing a polymorphic `as`/`render` system baked in.
export const buttonStyles = (
  variant: ButtonVariant = 'solid',
  size: ButtonSize = 'md',
): stylex.CompiledStyles[] => [styles.base, sizeStyles[size], variantStyles[variant]];

export interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  xstyle?: stylex.CompiledStyles;
}

export const Button = ({
  variant = 'solid',
  size = 'md',
  xstyle,
  children,
  ...rest
}: ButtonProps) => (
  <button {...rest} {...stylex.props(...buttonStyles(variant, size), xstyle)}>
    {children}
  </button>
);
