import * as stylex from '@stylexjs/stylex';
import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps, ReactNode } from 'react';
import { colors, radii } from '../theme/tokens.stylex';

// MUI's default Avatar: full-round, `background.default`-on-grey
// fallback bg (grey[400]/grey[600] used elsewhere in the app for its
// single avatar use case — see UserAvatar.tsx).
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    verticalAlign: 'top',
    flexShrink: 0,
    userSelect: 'none',
    borderRadius: radii.full,
    backgroundColor: colors.bgMuted,
    color: colors.fgMuted,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});

export interface AvatarProps extends Omit<ComponentProps<typeof BaseAvatar.Root>, 'style'> {
  size?: number;
  fallback?: ReactNode;
  src?: string;
  alt?: string;
  xstyle?: stylex.CompiledStyles;
}

export const Avatar = ({ size = 32, fallback, src, alt, xstyle, ...rest }: AvatarProps) => {
  const rootProps = stylex.props(styles.root, xstyle);
  return (
    <BaseAvatar.Root
      {...rest}
      {...rootProps}
      style={{ ...rootProps.style, width: size, height: size }}
    >
      {src && <BaseAvatar.Image src={src} alt={alt} {...stylex.props(styles.image)} />}
      <BaseAvatar.Fallback {...stylex.props(styles.fallback)}>{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
};
