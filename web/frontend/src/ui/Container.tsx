import * as stylex from '@stylexjs/stylex';
import type { PropsWithChildren, HTMLAttributes } from 'react';

// theme.ts's `MuiContainer.styleOverrides`: `padding: '16px'` on *all
// four sides* (not just horizontal), with a media query that re-asserts
// only left/right at 16px — explicitly overriding MUI's own built-in
// bump to 24px at the 600px breakpoint (see theme.ts's comment on that
// override). Net effect: a flat 16px on every side, every breakpoint.
const styles = stylex.create({
  base: {
    position: 'relative',
    width: '100%',
    marginInline: 'auto',
    padding: '16px',
  },
  maxWidthSm: { maxWidth: '640px' },
  maxWidthMd: { maxWidth: '768px' },
  maxWidthLg: { maxWidth: '1024px' },
  maxWidthFull: { maxWidth: '100%' },
});

type MaxWidth = 'sm' | 'md' | 'lg' | 'full';

const maxWidthStyles: Record<MaxWidth, stylex.CompiledStyles> = {
  sm: styles.maxWidthSm,
  md: styles.maxWidthMd,
  lg: styles.maxWidthLg,
  full: styles.maxWidthFull,
};

export interface ContainerProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  maxWidth?: MaxWidth;
  xstyle?: stylex.CompiledStyles;
}

export const Container = ({ maxWidth = 'lg', xstyle, children, ...rest }: ContainerProps) => (
  <div {...rest} {...stylex.props(styles.base, maxWidthStyles[maxWidth], xstyle)}>
    {children}
  </div>
);
