import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme/tokens.stylex';

// MUI's Divider: 1px solid border-color:"divider" (theme.ts's `border`
// palette value, `colors.border` here).
const styles = stylex.create({
  horizontal: {
    display: 'block',
    width: '100%',
    height: 0,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  vertical: {
    display: 'block',
    alignSelf: 'stretch',
    width: 0,
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
});

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  xstyle?: stylex.CompiledStyles;
}

export const Divider = ({ orientation = 'horizontal', xstyle }: DividerProps) => (
  <div
    role="separator"
    aria-orientation={orientation}
    {...stylex.props(orientation === 'horizontal' ? styles.horizontal : styles.vertical, xstyle)}
  />
);
