import * as stylex from '@stylexjs/stylex';
import type { PropsWithChildren, HTMLAttributes, ReactNode } from 'react';
import { colors, fontSizes, radii, space } from '../theme/tokens.stylex';

// MUI's Alert, "standard" variant (its default) — this app's only
// variant. Border radius follows theme.ts's global `shape.borderRadius`
// override (12px) since `theme.ts` doesn't customize `MuiAlert`.
const styles = stylex.create({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    position: 'relative',
    borderRadius: radii.md,
    gap: space[3],
    paddingInline: space[4],
    paddingBlock: space[3],
    fontSize: fontSizes.sm,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: space[1],
  },
  error: { backgroundColor: colors.errorBg, color: colors.errorFg },
  warning: { backgroundColor: colors.warningBg, color: colors.warningFg },
  success: { backgroundColor: colors.successBg, color: colors.successFg },
  info: { backgroundColor: colors.info, color: colors.infoFg },
});

type Status = 'error' | 'warning' | 'success' | 'info';

const statusStyles: Record<Status, stylex.CompiledStyles> = {
  error: styles.error,
  warning: styles.warning,
  success: styles.success,
  info: styles.info,
};

export interface AlertProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  status?: Status;
  icon?: ReactNode;
  xstyle?: stylex.CompiledStyles;
}

export const Alert = ({ status = 'info', icon, xstyle, children, ...rest }: AlertProps) => (
  <div {...rest} {...stylex.props(styles.root, statusStyles[status], xstyle)}>
    {icon}
    <div {...stylex.props(styles.content)}>{children}</div>
  </div>
);
