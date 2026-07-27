import * as stylex from '@stylexjs/stylex';
import type { PropsWithChildren, HTMLAttributes } from 'react';
import { colors, fontSizes, fontWeights, lineHeights } from '../theme/tokens.stylex';

// MUI's Typography component splits by `variant` (h1-h6/body1/body2/
// caption/etc); this app only ever pairs it with a handful of those
// variants for body copy (body1/body2/caption/subtitle2) — headings get
// their own primitive (Heading.tsx), matching how the app's actual
// Typography usage already splits along that line.
const styles = stylex.create({
  base: {
    margin: 0,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.normal,
    color: colors.fg,
  },
  sizeXs: { fontSize: fontSizes.xs },
  sizeSm: { fontSize: fontSizes.sm },
  sizeMd: { fontSize: fontSizes.md },
  sizeLg: { fontSize: fontSizes.lg },
  weightNormal: { fontWeight: fontWeights.normal },
  weightMedium: { fontWeight: fontWeights.medium },
  weightBold: { fontWeight: fontWeights.bold },
  colorFg: { color: colors.fg },
  colorMuted: { color: colors.fgMuted },
  colorSubtle: { color: colors.fgSubtle },
  colorError: { color: colors.errorFg },
  colorSuccess: { color: colors.successFg },
  colorBrand: { color: colors.brandFg },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

type Size = 'xs' | 'sm' | 'md' | 'lg';
type Weight = 'normal' | 'medium' | 'bold';
type Color = 'fg' | 'muted' | 'subtle' | 'error' | 'success' | 'brand';

const sizeStyles: Record<Size, stylex.CompiledStyles> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const weightStyles: Record<Weight, stylex.CompiledStyles> = {
  normal: styles.weightNormal,
  medium: styles.weightMedium,
  bold: styles.weightBold,
};

const colorStyles: Record<Color, stylex.CompiledStyles> = {
  fg: styles.colorFg,
  muted: styles.colorMuted,
  subtle: styles.colorSubtle,
  error: styles.colorError,
  success: styles.colorSuccess,
  brand: styles.colorBrand,
};

export interface TextProps
  extends PropsWithChildren<Omit<HTMLAttributes<HTMLElement>, 'color'>> {
  as?: 'p' | 'span' | 'div';
  size?: Size;
  weight?: Weight;
  color?: Color;
  truncate?: boolean;
  xstyle?: stylex.CompiledStyles;
}

export const Text = ({
  as: Component = 'p',
  size = 'md',
  weight,
  color = 'fg',
  truncate,
  xstyle,
  children,
  ...rest
}: TextProps) => (
  <Component
    {...rest}
    {...stylex.props(
      styles.base,
      sizeStyles[size],
      weight && weightStyles[weight],
      colorStyles[color],
      truncate && styles.truncate,
      xstyle,
    )}
  >
    {children}
  </Component>
);
