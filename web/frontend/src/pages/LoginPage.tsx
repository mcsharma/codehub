import * as stylex from '@stylexjs/stylex'
import { Card, CardBody } from '../ui/Card'
import { Heading } from '../ui/Heading'
import { Text } from '../ui/Text'
import { buttonStyles } from '../ui/Button'
import { colors, fontWeights, radii, space } from '../theme/tokens.stylex'

const styles = stylex.create({
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: space[2],
    backgroundColor: colors.bgSubtle,
  },
  inner: {
    width: '100%',
    maxWidth: '384px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: space[4],
  },
  logoMark: {
    width: '48px',
    height: '48px',
    borderRadius: radii.md,
    backgroundColor: colors.brandSolid,
    color: colors.brandContrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: {
    marginBottom: space[0.5],
  },
  cardBody: {
    padding: space[4],
  },
  button: {
    width: '100%',
    color: colors.fg,
  },
  caption: {
    display: 'block',
    textAlign: 'center',
    marginTop: space[3],
    color: colors.fgMuted,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
})

const LoginPage = () => {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.inner)}>
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.logoMark)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4V12M12 12L7 7M12 12L17 7M12 12V20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <Heading as="h1" size="xl" xstyle={styles.title}>
            Welcome back to CodeHub
          </Heading>
          <Text size="sm" color="muted">
            Simple, modern source control.
          </Text>
        </div>

        <Card>
          <CardBody xstyle={styles.cardBody}>
            <a
              href="/auth/google"
              {...stylex.props(...buttonStyles('outline', 'lg'), styles.button)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>

            <Text size="xs" xstyle={styles.caption}>
              Secure authentication powered by Google.
            </Text>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
