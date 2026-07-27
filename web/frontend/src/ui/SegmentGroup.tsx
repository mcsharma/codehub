import * as stylex from '@stylexjs/stylex';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import type { ComponentProps, ReactNode } from 'react';
import { colors, radii } from '../theme/tokens.stylex';

// MUI's real `ToggleButtonGroup`/`ToggleButton` `size="small"` (this
// app's only usage, CommitPage's Split/Unified toggle): `padding: 7px`,
// `fontSize: 13px`, 1px `divider` borders between buttons, selected bg
// `alpha(text.primary, 0.08)` — no color prop set, so selected stays
// neutral gray/black, not brand blue. No sliding indicator in prod's
// real ToggleButtonGroup (nor does Base UI's ToggleGroup have one) —
// flat background swap only.
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    borderRadius: radii.md,
    boxShadow: `inset 0 0 0 1px ${colors.border}`,
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    appearance: 'none',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: '0.8125rem',
    color: colors.fgMuted,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '7px 11px',
    ':not(:first-child)': {
      borderInlineStartWidth: '1px',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: colors.border,
    },
    ':hover': {
      backgroundColor: colors.bgSubtle,
    },
    ':is([data-pressed])': {
      backgroundColor: colors.bgMuted,
      color: colors.fg,
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '-2px',
    },
  },
});

export interface SegmentGroupProps
  extends Omit<ComponentProps<typeof ToggleGroup>, 'value' | 'defaultValue' | 'onValueChange'> {
  options: { value: string; label: ReactNode }[];
  value: string;
  onValueChange: (value: string) => void;
  xstyle?: stylex.CompiledStyles;
}

// This app only ever needs single-select (Split/Unified) — flattens
// ToggleGroup's array-based `value`/`onValueChange` (built for
// multi-select) to a plain single string.
export const SegmentGroup = ({ options, value, onValueChange, xstyle, ...rest }: SegmentGroupProps) => (
  <ToggleGroup
    {...rest}
    value={[value]}
    onValueChange={(next) => {
      const picked = next.find((v) => v !== value);
      if (picked !== undefined) onValueChange(picked);
    }}
    {...stylex.props(styles.root, xstyle)}
  >
    {options.map((option) => (
      <Toggle key={option.value} value={option.value} {...stylex.props(styles.item)}>
        {option.label}
      </Toggle>
    ))}
  </ToggleGroup>
);
