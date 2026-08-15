import { useState } from 'react'
import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { useLoaderData, useRevalidator } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { TokensPageQuery } from './__generated__/TokensPageQuery.graphql'
import type { TokensPageCreateMutation } from './__generated__/TokensPageCreateMutation.graphql'
import type { TokensPageRevokeMutation } from './__generated__/TokensPageRevokeMutation.graphql'

import { Info, Trash2, Key, TriangleAlert } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { cn } from '@/lib/utils'
import StatusBadge from '../components/StatusBadge'

const SIDEBAR_ITEMS = [
  'Profile',
  'Account',
  'Emails',
  'Access Tokens',
  'SSH Keys',
  'Billing',
]

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

  const [commitRevoke, isRevoking] = useMutation<TokensPageRevokeMutation>(graphql`
    mutation TokensPageRevokeMutation($id: ID!) {
      revoke_personal_access_token(id: $id)
    }
  `)

  const [revokeTarget, setRevokeTarget] = useState<{ id: string; label: string } | null>(null)

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

  const handleRevoke = () => {
    if (!revokeTarget) return
    commitRevoke({
      variables: { id: revokeTarget.id },
      onCompleted: () => {
        setRevokeTarget(null)
        revalidator.revalidate()
      },
    })
  }

  const tokens = data.my_personal_access_tokens ?? []

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <div className="flex flex-col gap-12 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-[260px]">
          <span className="mb-3 block px-3 text-xs font-bold text-muted-foreground uppercase">
            Account Settings
          </span>
          {SIDEBAR_ITEMS.map((item) => {
            const active = item === 'Access Tokens'
            return (
              <div
                key={item}
                className={cn(
                  'cursor-default rounded-full px-3 py-2 text-sm',
                  active
                    ? 'border border-border bg-background font-bold text-primary'
                    : 'border border-transparent font-medium text-muted-foreground',
                )}
              >
                {item}
              </div>
            )
          })}
        </aside>

        <div className="max-w-[720px] flex-1">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Personal Access Tokens</h1>
              <p className="mt-1 text-muted-foreground">
                Tokens you can use to authenticate with the API.
              </p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="shrink-0"
            >
              Generate Token
            </Button>
          </div>

          <div className="mb-8 flex gap-4 rounded-[4px] bg-[#eff6ff] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
            <Info className="size-6 shrink-0 text-primary" />
            <div>
              <p className="font-bold text-primary">Security Note</p>
              <p className="mt-1 text-sm text-primary">
                Treat these tokens like passwords. This app will only show you
                the full token string once, immediately after generation.
              </p>
            </div>
          </div>

          <div className="rounded-[4px] border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
            {tokens.length === 0 ? (
              <p className="p-6 text-muted-foreground">No tokens yet.</p>
            ) : (
              tokens.map((token, index) => (
                <div key={token.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4 p-6">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="font-bold">{token.label}</p>
                        <StatusBadge
                          label={token.last_used_time ? 'Active' : 'Never used'}
                          tone={token.last_used_time ? 'success' : 'neutral'}
                        />
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs text-muted-foreground">
                          Created{' '}
                          {new Date(
                            (token.created_time ?? 0) * 1000,
                          ).toLocaleDateString()}
                        </span>
                        {token.last_used_time && (
                          <span className="text-xs text-muted-foreground">
                            Last used{' '}
                            {new Date(
                              token.last_used_time * 1000,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-md"
                      onClick={() => setRevokeTarget({ id: token.id ?? '', label: token.label ?? '' })}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          {createdToken ? (
            <>
              <DialogHeader>
                <DialogTitle>Your new token</DialogTitle>
              </DialogHeader>
              <Alert variant="warning">
                <AlertDescription>
                  Copy this token now — you won&apos;t be able to see it again.
                </AlertDescription>
              </Alert>
              <Input
                value={createdToken}
                readOnly
                className="font-mono"
                onFocus={(e) => e.target.select()}
              />
              <DialogFooter>
                <Button onClick={handleCloseDialog}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="size-4" /> Generate a new token
                </DialogTitle>
              </DialogHeader>
              {error && (
                <Alert variant="danger">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <p className="mb-2 text-sm font-bold">Label</p>
                <Input
                  autoFocus
                  placeholder="e.g. MacBook Pro CLI"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button disabled={!label || isCreating} onClick={handleCreate}>
                  {isCreating ? 'Generating…' : 'Generate Token'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="size-5" /> Revoke token
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Are you sure you want to revoke <strong>{revokeTarget?.label}</strong>? Any tools using it will stop
            working immediately.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isRevoking} onClick={handleRevoke}>
              {isRevoking ? 'Revoking…' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TokensPage
