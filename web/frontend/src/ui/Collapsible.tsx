import * as stylex from '@stylexjs/stylex';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type { ComponentProps } from 'react';

// Base UI sets the measured --collapsible-panel-height custom property on
// Panel while animating — CSS here just needs overflow:hidden and a
// transition on height for that to animate smoothly, matching MUI's
// `Collapse` component's intent without hand-rolling the same keyframes.
const styles = stylex.create({
  panel: {
    overflow: 'hidden',
    transitionProperty: 'height',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease',
  },
});

export const CollapsibleRoot = BaseCollapsible.Root;
export const CollapsibleTrigger = BaseCollapsible.Trigger;

export interface CollapsiblePanelProps extends ComponentProps<typeof BaseCollapsible.Panel> {
  xstyle?: stylex.CompiledStyles;
}

export const CollapsibleContent = ({ xstyle, children, ...rest }: CollapsiblePanelProps) => (
  <BaseCollapsible.Panel {...rest} {...stylex.props(styles.panel, xstyle)}>
    {children}
  </BaseCollapsible.Panel>
);
