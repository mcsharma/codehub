import { useState } from 'react'
import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { useLoaderData, useRevalidator } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { TokensPageQuery } from './__generated__/TokensPageQuery.graphql'
import type { TokensPageCreateMutation } from './__generated__/TokensPageCreateMutation.graphql'
import type { TokensPageRevokeMutation } from './__generated__/TokensPageRevokeMutation.graphql'
import * as stylex from '@stylexjs/stylex'
import { Info, Edit2, Trash2, Key } from 'lucide-react'

import { Container } from '../ui/Container'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { Divider } from '../ui/Divider'
import { Alert } from '../ui/Alert'
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../ui/Dialog'
import { FieldRoot, FieldInput, FieldLabel } from '../ui/Field'
import StatusBadge from '../components/StatusBadge'
import { colors, fonts, fontSizes, fontWeights, radii, space } from '../theme/tokens.stylex'

const SIDEBAR_ITEMS = [
  'Profile',
  'Account',
  'Emails',
  'Access Tokens',
  'SSH Keys',
  'Billing',
]

const styles = stylex.create({
  containerPadding: {
    paddingVertical: space[5],
  },
  deleteButton: {
    color: colors.errorFg,
  },
  noTokensText: {
    padding: space[3],
  },
  monoFont: {
    fontFamily: fonts.mono,
  },
  dialogTitleText: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
  },
  generateButton: {
    flexShrink: 0,
  },
  container: {
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 1024px)': 'row',
    },
    gap: space[6],
  },
  sidebar: {
    width: {
      default: '100%',
      '@media (min-width: 1024px)': '260px',
    },
    flexShrink: 0,
  },
  sidebarLabel: {
    display: 'block',
    paddingInline: space[1.5],
    marginBottom: space[1.5],
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    color: colors.fgMuted,
  },
  sidebarItem: {
    paddingInline: space[1.5],
    paddingBlock: space[1],
    borderRadius: radii.md,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.fgMuted,
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  sidebarItemActive: {
    fontWeight: fontWeights.bold,
    color: colors.brandFg,
    backgroundColor: colors.bg,
    borderColor: colors.border,
  },
  main: {
    flex: 1,
    maxWidth: '720px',
  },
  mainHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[2],
    marginBottom: space[4],
  },
  title: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.xl,
  },
  subtitle: {
    marginTop: space[0.5],
  },
  securityCard: {
    padding: space[2.5],
    marginBottom: space[4],
    display: 'flex',
    gap: space[2],
    backgroundColor: colors.info,
    borderColor: 'transparent',
  },
  securityIcon: {
    color: colors.brandFg,
  },
  securityTitle: {
    fontWeight: fontWeights.bold,
    color: colors.brandFg,
  },
  securityText: {
    marginTop: space[0.5],
    color: colors.brandFg,
  },
  tokenRow: {
    padding: space[3],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  tokenInfo: {
    flex: 1,
    minWidth: 0,
  },
  tokenHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
    marginBottom: space[0.5],
  },
  tokenLabelText: {
    fontWeight: fontWeights.bold,
  },
  tokenDates: {
    display: 'flex',
    gap: space[2],
  },
  actions: {
    display: 'flex',
    gap: space[0.5],
  },
  alert: {
    marginBottom: space[2],
  },
  fieldWrapper: {
    marginBottom: space[3],
  },
})

const TokensPage = () => {
  const { tokensQueryRef } = useLoaderData() as {
    tokensQueryRef: PreloadedQuery<TokensPageQuery>
  }
  const revalidator = useRevalidator()

  const data = usePreloadedQuery<TokensPageQuery>(
    graphql`
      query TokensPageQuery {
        my_personal_access_tokens {
          id
          label
          created_time
          last_used_time
        }
      }
    `,
    tokensQueryRef,
  )

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [commitCreate, isCreating] = useMutation<TokensPageCreateMutation>(
    graphql`
      mutation TokensPageCreateMutation($label: String!) {
        create_personal_access_token(label: $label) {
          token
        }
      }
    `,
  )

  const [commitRevoke] = useMutation<TokensPageRevokeMutation>(graphql`
    mutation TokensPageRevokeMutation($id: ID!) {
      revoke_personal_access_token(id: $id)
    }
  `)

  const handleCreate = () => {
    setError(null)
    commitCreate({
      variables: { label },
      onCompleted: (response) => {
        if (response.create_personal_access_token) {
          setCreatedToken(response.create_personal_access_token.token ?? null)
        }
      },
      onError: (err) => setError(err.message),
    })
  }

  const handleCloseDialog = () => {
    setCreateDialogOpen(false)
    setLabel('')
    setCreatedToken(null)
    setError(null)
    if (createdToken) {
      revalidator.revalidate()
    }
  }

  const handleRevoke = (id: string) => {
    commitRevoke({
      variables: { id },
      onCompleted: () => {
        revalidator.revalidate()
      },
    })
  }

  const tokens = data.my_personal_access_tokens ?? []

  return (
    <Container maxWidth="lg" xstyle={styles.containerPadding}>
      <div {...stylex.props(styles.container)}>
        <aside {...stylex.props(styles.sidebar)}>
          <Text size="xs" color="muted" xstyle={styles.sidebarLabel}>
            Account Settings
          </Text>
          {SIDEBAR_ITEMS.map((item) => {
            const active = item === 'Access Tokens'
            return (
              <div
                key={item}
                {...stylex.props(
                  styles.sidebarItem,
                  active && styles.sidebarItemActive,
                )}
              >
                {item}
              </div>
            )
          })}
        </aside>

        <div {...stylex.props(styles.main)}>
          <div {...stylex.props(styles.mainHeader)}>
            <div>
              <Text xstyle={styles.title}>
                Personal Access Tokens
              </Text>
              <Text color="muted" size="sm" xstyle={styles.subtitle}>
                Tokens you can use to authenticate with the CodeHub CLI or API.
              </Text>
            </div>
            <Button
              variant="solid"
              onClick={() => setCreateDialogOpen(true)}
              xstyle={styles.generateButton}
            >
              Generate Token
            </Button>
          </div>

          <Card xstyle={styles.securityCard}>
            <Info size={20} {...stylex.props(styles.securityIcon)} />
            <div>
              <Text xstyle={styles.securityTitle}>
                Security Note
              </Text>
              <Text size="sm" xstyle={styles.securityText}>
                Treat these tokens like passwords. CodeHub will only show you
                the full token string once, immediately after generation.
              </Text>
            </div>
          </Card>

          <Card>
            {tokens.length === 0 ? (
              <Text color="muted" xstyle={styles.noTokensText}>
                No tokens yet.
              </Text>
            ) : (
              tokens.map((token, index) => (
                <div key={token.id}>
                  {index > 0 && <Divider />}
                  <div {...stylex.props(styles.tokenRow)}>
                    <div {...stylex.props(styles.tokenInfo)}>
                      <div {...stylex.props(styles.tokenHeader)}>
                        <Text xstyle={styles.tokenLabelText}>
                          {token.label}
                        </Text>
                        <StatusBadge
                          label={token.last_used_time ? 'Active' : 'Never used'}
                          tone={token.last_used_time ? 'success' : 'neutral'}
                        />
                      </div>
                      <div {...stylex.props(styles.tokenDates)}>
                        <Text size="xs" color="muted">
                          Created{' '}
                          {new Date(
                            (token.created_time ?? 0) * 1000,
                          ).toLocaleDateString()}
                        </Text>
                        {token.last_used_time && (
                          <Text size="xs" color="muted">
                            Last used{' '}
                            {new Date(
                              token.last_used_time * 1000,
                            ).toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div {...stylex.props(styles.actions)}>
                      <IconButton size="sm" disabled aria-label="Edit token">
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton
                        size="sm"
                        onClick={() => handleRevoke(token.id ?? '')}
                        xstyle={styles.deleteButton}
                        aria-label="Revoke token"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      <DialogRoot open={createDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          {createdToken ? (
            <>
              <DialogHeader>
                <DialogTitle>Your new token</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Alert status="warning" xstyle={styles.alert}>
                  Copy this token now — you won&apos;t be able to see it again.
                </Alert>
                <FieldRoot>
                  <FieldInput
                    value={createdToken}
                    readOnly
                    xstyle={styles.monoFont}
                    onFocus={(e) => e.target.select()}
                  />
                </FieldRoot>
              </DialogBody>
              <DialogFooter>
                <Button variant="solid" onClick={handleCloseDialog}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  <span {...stylex.props(styles.dialogTitleText)}>
                    <Key size={18} /> Generate a new token
                  </span>
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                {error && (
                  <Alert status="error" xstyle={styles.alert}>
                    {error}
                  </Alert>
                )}
                <FieldRoot xstyle={styles.fieldWrapper}>
                  <FieldLabel>Label</FieldLabel>
                  <FieldInput
                    autoFocus
                    placeholder="e.g. MacBook Pro CLI"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </FieldRoot>
              </DialogBody>
              <DialogFooter>
                <Button onClick={handleCloseDialog} variant="subtle">
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  disabled={!label || isCreating}
                  onClick={handleCreate}
                >
                  {isCreating ? 'Generating…' : 'Generate Token'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogRoot>
    </Container>
  )
}

export default TokensPage
