import * as stylex from '@stylexjs/stylex';
import type { PropsWithChildren, HTMLAttributes } from 'react';
import { colors, radii, shadows, space } from '../theme/tokens.stylex';

// theme.ts's `MuiCard.styleOverrides`: `borderRadius: 4` (deliberately
// not the app's global 12px `shape.borderRadius`), `1px solid` border,
// a specific soft shadow, `backgroundImage: none`.
const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minWidth: 0,
    borderRadius: radii.card,
    color: colors.fg,
    textAlign: 'start',
    backgroundColor: colors.bg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  body: {
    padding: space[6],
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
});

export const cardStyles = (): stylex.CompiledStyles[] => [styles.root];

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  xstyle?: stylex.CompiledStyles;
}

export const Card = ({ xstyle, children, ...rest }: CardProps) => (
  <div {...rest} {...stylex.props(...cardStyles(), xstyle)}>
    {children}
  </div>
);

export interface CardBodyProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  xstyle?: stylex.CompiledStyles;
}

export const CardBody = ({ xstyle, children, ...rest }: CardBodyProps) => (
  <div {...rest} {...stylex.props(styles.body, xstyle)}>
    {children}
  </div>
);
