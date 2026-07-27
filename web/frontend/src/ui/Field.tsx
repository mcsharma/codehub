import * as stylex from '@stylexjs/stylex';
import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens.stylex';

// MUI's real `TextField`/`OutlinedInput` look: theme.ts's
// `MuiOutlinedInput.styleOverrides` (`borderRadius: 12`, `backgroundColor:
// surface`) — approximated here as a plain bordered input rather than a
// literal port of MUI's fieldset/legend "notched outline" technique
// (the label-cutout animation), which is complex enough to fall back to
// the next-best-thing on: a simple top-aligned label + bordered input
// reads the same to a user, just without that specific notch animation.
const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: space[0.5],
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'start',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    gap: space[1],
    userSelect: 'none',
  },
  helperText: {
    color: colors.fgMuted,
    fontSize: fontSizes.xs,
  },
  errorText: {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: fontWeights.medium,
    gap: space[1],
    color: colors.errorFg,
    fontSize: fontSizes.xs,
  },
  input: {
    width: '100%',
    minWidth: 0,
    outline: 'none',
    appearance: 'none',
    textAlign: 'start',
    borderRadius: radii.md,
    // MUI's real OutlinedInput padding (theme.ts only overrides
    // borderRadius/backgroundColor on MuiOutlinedInput, not padding) —
    // the input sizes itself from this, not a fixed height.
    padding: '16.5px 14px',
    fontSize: fontSizes.md,
    backgroundColor: colors.bgSubtle,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    color: colors.fg,
    fontFamily: 'inherit',
    ':focus-visible': {
      borderColor: colors.brandSolid,
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '-1px',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  // Sizes itself off the native `rows` attribute (set per call site),
  // same as prod's `<TextField multiline rows={3} />` usage — no fixed
  // CSS height needed.
  textarea: {
    resize: 'vertical',
  },
});

export interface FieldRootProps extends ComponentProps<typeof BaseField.Root> {
  xstyle?: stylex.CompiledStyles;
}

export const FieldRoot = ({ xstyle, ...rest }: FieldRootProps) => (
  <BaseField.Root {...rest} {...stylex.props(styles.root, xstyle)} />
);

export const FieldLabel = (props: ComponentProps<typeof BaseField.Label>) => (
  <BaseField.Label {...props} {...stylex.props(styles.label)} />
);

export const FieldHelperText = (props: ComponentProps<typeof BaseField.Description>) => (
  <BaseField.Description {...props} {...stylex.props(styles.helperText)} />
);

export const FieldErrorText = (props: ComponentProps<typeof BaseField.Error>) => (
  <BaseField.Error {...props} {...stylex.props(styles.errorText)} />
);

export interface FieldInputProps extends ComponentProps<typeof BaseField.Control> {
  xstyle?: stylex.CompiledStyles;
}

export const FieldInput = ({ xstyle, ...rest }: FieldInputProps) => (
  <BaseField.Control {...rest} {...stylex.props(styles.input, xstyle)} />
);

export interface FieldTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  xstyle?: stylex.CompiledStyles;
}

export const FieldTextarea = ({ xstyle, ...rest }: FieldTextareaProps) => (
  <BaseField.Control
    render={(props) => <textarea {...props} {...rest} />}
    {...stylex.props(styles.input, styles.textarea, xstyle)}
  />
);

// For plain inputs used outside a Field context (e.g. CloneButton's
// read-only clone-command box) — same visual styling without the
// label/error wiring.
export const bareInputStyle = styles.input;

export { styles as fieldStyles };
