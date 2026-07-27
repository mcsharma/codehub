import * as stylex from '@stylexjs/stylex';
import type { PropsWithChildren, HTMLAttributes } from 'react';
import { colors, fonts, fontSizes, fontWeights } from '../theme/tokens.stylex';

// Every h4/h5/h6 usage in the current app explicitly overrides MUI's
// Typography default weight to 700 via `sx={{ fontWeight: 700 }}` — a
// completely consistent convention across every call site (verified by
// grep, not assumed) — so `bold` is this primitive's default weight
// rather than something every caller has to opt into individually.
const styles = stylex.create({
  base: {
    margin: 0,
    fontFamily: fonts.sans,
    fontWeight: fontWeights.bold,
    color: colors.fg,
  },
  sizeSm: { fontSize: fontSizes.sm },
  sizeMd: { fontSize: fontSizes.md },
  sizeLg: { fontSize: fontSizes.lg }, // MUI h6
  sizeXl: { fontSize: fontSizes.xl }, // MUI h5
  size2xl: { fontSize: fontSizes['2xl'] }, // MUI h4
  weightMedium: { fontWeight: fontWeights.medium },
  weightNormal: { fontWeight: fontWeights.normal },
});

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Weight = 'normal' | 'medium' | 'bold';

const sizeStyles: Record<Size, stylex.CompiledStyles> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  '2xl': styles.size2xl,
};

const weightStyles: Record<Exclude<Weight, 'bold'>, stylex.CompiledStyles> = {
  normal: styles.weightNormal,
  medium: styles.weightMedium,
};

export interface HeadingProps
  extends PropsWithChildren<Omit<HTMLAttributes<HTMLHeadingElement>, 'color'>> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: Size;
  weight?: Weight;
  xstyle?: stylex.CompiledStyles;
}

export const Heading = ({
  as: Component = 'h2',
  size = 'lg',
  weight,
  xstyle,
  children,
  ...rest
}: HeadingProps) => (
  <Component
    {...rest}
    {...stylex.props(
      styles.base,
      sizeStyles[size],
      weight && weight !== 'bold' && weightStyles[weight],
      xstyle,
    )}
  >
    {children}
  </Component>
);
