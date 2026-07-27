import * as stylex from '@stylexjs/stylex';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Radio } from '@base-ui/react/radio';
import type { ComponentProps, ReactNode } from 'react';
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens.stylex';

// Prod's real pattern, read directly from `NewRepoPage.tsx`'s visibility
// picker (this app's hand-rolled "Card + visible Radio dot + label", not
// Chakra's hidden-input card recipe): a Card — using `MuiCard`'s own
// `borderRadius: 4` override — with a 2px border that swaps to brand
// blue + a light blue fill (`colors.info`, prod's literal `#eff6ff`)
// when selected, containing a real visible radio dot plus a bold title /
// muted caption pair.
const styles = stylex.create({
  root: {
    display: 'grid',
    gap: space[2],
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: space[1],
    userSelect: 'none',
    position: 'relative',
    borderRadius: radii.card,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: 'transparent',
    padding: space[2],
    cursor: 'pointer',
    ':is([data-checked])': {
      borderColor: colors.brandSolid,
      backgroundColor: colors.info,
    },
    // The real focusable element is the visually-hidden radio input, not
    // this card — style *this* box when that input has keyboard focus.
    ':has(input:focus-visible)': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '2px',
    },
  },
  dotRing: {
    flexShrink: 0,
    marginTop: '2px',
    width: '20px',
    height: '20px',
    borderRadius: radii.full,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.fgSubtle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Base UI's Radio.Indicator is only mounted while checked (its default
  // `keepMounted={false}`) — a static filled dot is enough, no separate
  // checked/unchecked style branch needed.
  dotIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: radii.full,
    backgroundColor: colors.brandSolid,
  },
  itemText: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  itemDescription: {
    color: colors.fgMuted,
    fontSize: fontSizes.xs,
  },
});

export const RadioCardRoot = RadioGroup;

export interface RadioCardItemProps extends ComponentProps<typeof Radio.Root> {
  label: ReactNode;
  description?: ReactNode;
  xstyle?: stylex.CompiledStyles;
}

export const RadioCardItem = ({ label, description, xstyle, value, ...rest }: RadioCardItemProps) => (
  <Radio.Root
    value={value}
    {...rest}
    render={(props: ComponentProps<'div'>) => (
      <div {...props} {...stylex.props(styles.item, xstyle)}>
        <span {...stylex.props(styles.dotRing)}>
          <Radio.Indicator {...stylex.props(styles.dotIndicator)} />
        </span>
        <div>
          <div {...stylex.props(styles.itemText)}>{label}</div>
          {description && <div {...stylex.props(styles.itemDescription)}>{description}</div>}
        </div>
      </div>
    )}
  />
);

export const radioCardRootStyle = styles.root;
