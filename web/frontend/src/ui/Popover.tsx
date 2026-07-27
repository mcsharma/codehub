import * as stylex from '@stylexjs/stylex';
import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { colors, radii, shadows, space } from '../theme/tokens.stylex';

const styles = stylex.create({
  popup: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg,
    boxShadow: shadows.menu,
    borderRadius: radii.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    outline: 'none',
  },
  bodyMd: { padding: space[5] },
});

export const PopoverRoot = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;

export interface PopoverPopupProps extends ComponentProps<typeof BasePopover.Popup> {
  xstyle?: stylex.CompiledStyles;
}

export const PopoverContent = ({ xstyle, children, ...rest }: PopoverPopupProps) => (
  <BasePopover.Portal>
    <BasePopover.Positioner sideOffset={8}>
      <BasePopover.Popup {...rest} {...stylex.props(styles.popup, styles.bodyMd, xstyle)}>
        {children}
      </BasePopover.Popup>
    </BasePopover.Positioner>
  </BasePopover.Portal>
);
