import * as stylex from '@stylexjs/stylex';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { colors, fontWeights, radii, space } from '../theme/tokens.stylex';

// MUI's real default Tooltip (theme.ts doesn't customize MuiTooltip):
// `alpha(grey[700], 0.92)` bg, white text, `padding: '4px 8px'`,
// `fontSize: 11px`, `borderRadius: shape.borderRadius` (12px override).
const styles = stylex.create({
  popup: {
    backgroundColor: 'rgba(97, 97, 97, 0.92)',
    color: colors.bg,
    paddingInline: space[1],
    paddingBlock: space[0.5],
    borderRadius: radii.md,
    fontWeight: fontWeights.medium,
    fontSize: '0.6875rem',
    maxWidth: '18.75rem',
  },
});

export interface TooltipProps extends PropsWithChildren {
  content: ReactNode;
  disabled?: boolean;
}

export const Tooltip = ({ content, disabled, children }: TooltipProps) => {
  if (disabled || !content) return children;
  return (
    <BaseTooltip.Provider delay={300} closeDelay={100}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={children as ReactElement} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={6}>
            <BaseTooltip.Popup {...stylex.props(styles.popup)}>{content}</BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
};
