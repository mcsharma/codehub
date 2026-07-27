import * as stylex from '@stylexjs/stylex';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps, PropsWithChildren, HTMLAttributes } from 'react';
import { colors, fontSizes, fontWeights, radii, shadows, space } from '../theme/tokens.stylex';

// MUI's real Dialog defaults (theme.ts doesn't customize MuiDialog/
// MuiDialogTitle/MuiDialogContent/MuiDialogActions): backdrop
// `rgba(0,0,0,0.5)`, Paper `shape.borderRadius` (12px) + `shadows[24]`,
// `maxWidth="sm"` (600px) + `fullWidth` (both call sites in this app use
// that combination). Title is Typography `variant="h6"` (20px/500) with
// `padding:'16px 24px'`; Content `padding:'20px 24px'`; Actions
// `padding: 8px` flex-end row.
const styles = stylex.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    inset: 0,
    zIndex: 1400,
  },
  viewport: {
    display: 'flex',
    width: '100dvw',
    height: '100dvh',
    position: 'fixed',
    inset: 0,
    zIndex: 1400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[4],
  },
  popup: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    maxWidth: '37.5rem', // MUI's "sm" breakpoint, 600px
    outline: 'none',
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    boxShadow: shadows.dialog,
  },
  header: {
    paddingInline: space[3],
    paddingBlock: space[2],
  },
  body: {
    flex: 1,
    paddingInline: space[3],
    paddingBlock: space[2.5],
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: space[1],
    padding: space[1],
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    margin: 0,
  },
  description: {
    color: colors.fgMuted,
  },
});

export const DialogRoot = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogCloseTrigger = BaseDialog.Close;

export interface DialogPopupProps extends ComponentProps<typeof BaseDialog.Popup> {
  xstyle?: stylex.CompiledStyles;
}

export const DialogContent = ({ xstyle, children, ...rest }: DialogPopupProps) => (
  <BaseDialog.Portal>
    <BaseDialog.Backdrop {...stylex.props(styles.backdrop)} />
    <BaseDialog.Viewport {...stylex.props(styles.viewport)}>
      <BaseDialog.Popup {...rest} {...stylex.props(styles.popup, xstyle)}>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Viewport>
  </BaseDialog.Portal>
);

export const DialogHeader = ({ children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div {...rest} {...stylex.props(styles.header)}>
    {children}
  </div>
);

export const DialogBody = ({ children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div {...rest} {...stylex.props(styles.body)}>
    {children}
  </div>
);

export const DialogFooter = ({ children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div {...rest} {...stylex.props(styles.footer)}>
    {children}
  </div>
);

export const DialogTitle = (props: ComponentProps<typeof BaseDialog.Title>) => (
  <BaseDialog.Title {...props} {...stylex.props(styles.title)} />
);

export const DialogDescription = (props: ComponentProps<typeof BaseDialog.Description>) => (
  <BaseDialog.Description {...props} {...stylex.props(styles.description)} />
);
