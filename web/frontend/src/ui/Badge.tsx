import * as stylex from '@stylexjs/stylex';
import type { PropsWithChildren, HTMLAttributes } from 'react';
import { colors, fontWeights, radii, space } from '../theme/tokens.stylex';

// Prod's real `StatusBadge`/MUI `Chip` recipe (`size="small"` + theme.ts's
// `MuiChip.styleOverrides`), read directly from the current
// `StatusBadge.tsx`: 24px height, 8px label padding, full pill radius,
// `fontWeight:700`/`fontSize:0.65rem`/uppercase/`letterSpacing:0.05em`.
// Tone backgrounds are prod's literal per-tone values, not MUI's generic
// Chip `color` palette (the app never uses that) — "neutral" additionally
// gets a 1px border, "brand"/"success" don't (verified in `StatusBadge.tsx`).
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    fontWeight: fontWeights.bold,
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingInline: space[1],
    height: space[3],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  neutral: {
    backgroundColor: colors.bgMuted,
    color: colors.fgMuted,
    borderColor: colors.border,
  },
  brand: {
    backgroundColor: colors.info,
    color: colors.brandFg,
  },
  // Not MUI's generic success green (`colors.successFg` — used by Alert
  // and the file-tree status dots) — `StatusBadge.tsx`'s "Active" tone
  // hardcodes these exact literals directly (verified by reading the
  // component), a separate one-off value the same way `FOLDER_BLUE` is
  // handled elsewhere, not something to route through the shared
  // semantic success token.
  success: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
  },
});

type Tone = 'neutral' | 'brand' | 'success';

const toneStyles: Record<Tone, stylex.CompiledStyles> = {
  neutral: styles.neutral,
  brand: styles.brand,
  success: styles.success,
};

export interface BadgeProps extends PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {
  tone?: Tone;
  xstyle?: stylex.CompiledStyles;
}

export const Badge = ({ tone = 'neutral', xstyle, children, ...rest }: BadgeProps) => (
  <span {...rest} {...stylex.props(styles.base, toneStyles[tone], xstyle)}>
    {children}
  </span>
);
