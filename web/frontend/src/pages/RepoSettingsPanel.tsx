import { useState } from 'react'
import { graphql, useMutation } from 'react-relay'
import { useNavigate, useRevalidator } from 'react-router'
import { TriangleAlert } from 'lucide-react'
import type { RepoSettingsPanelUpdateVisibilityMutation } from './__generated__/RepoSettingsPanelUpdateVisibilityMutation.graphql'
import type { RepoSettingsPanelDeleteMutation } from './__generated__/RepoSettingsPanelDeleteMutation.graphql'

import { Button } from '../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Alert, AlertDescription } from '../components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { cn } from '@/lib/utils'

interface RepoSettingsPanelProps {
  repositoryId: string
  ownerUsername: string
  repoName: string
  visibility: 'PUBLIC' | 'PRIVATE'
}

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', helper: 'Anyone on the internet can see this repository.' },
  { value: 'PRIVATE', label: 'Private', helper: 'Only you and people you choose can see this.' },
] as const

const RepoSettingsPanel = ({ repositoryId, ownerUsername, repoName, visibility }: RepoSettingsPanelProps) => {
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  const [selectedVisibility, setSelectedVisibility] = useState<'PUBLIC' | 'PRIVATE'>(visibility)
  const [visibilityError, setVisibilityError] = useState<string | null>(null)

  const [commitUpdateVisibility, isSavingVisibility] = useMutation<RepoSettingsPanelUpdateVisibilityMutation>(graphql`
    mutation RepoSettingsPanelUpdateVisibilityMutation($id: ID!, $visibility: RepositoryVisibility!) {
      update_repository_visibility(id: $id, visibility: $visibility) {
        id
        visibility
      }
    }
  `)

  const [commitDelete, isDeleting] = useMutation<RepoSettingsPanelDeleteMutation>(graphql`
    mutation RepoSettingsPanelDeleteMutation($id: ID!) {
      delete_repository(id: $id)
    }
  `)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleSaveVisibility = () => {
    setVisibilityError(null)
    commitUpdateVisibility({
      variables: { id: repositoryId, visibility: selectedVisibility },
      onCompleted: () => {
        revalidator.revalidate()
      },
      onError: (err) => setVisibilityError(err.message),
    })
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setConfirmText('')
    setDeleteError(null)
  }

  const handleDelete = () => {
    setDeleteError(null)
    commitDelete({
      variables: { id: repositoryId },
      onCompleted: () => {
        navigate(`/${ownerUsername}`)
      },
      onError: (err) => setDeleteError(err.message),
    })
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-8">
      <div className="rounded-[4px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <h2 className="mb-1 text-xl font-bold">General</h2>
        <p className="mb-6 text-muted-foreground">Control who can see this repository.</p>

        {visibilityError && (
          <Alert variant="danger" className="mb-4">
            <AlertDescription>{visibilityError}</AlertDescription>
          </Alert>
        )}

        <RadioGroup
          value={selectedVisibility}
          onValueChange={(value) => setSelectedVisibility(value as 'PUBLIC' | 'PRIVATE')}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-2 rounded-[4px] border-2 p-4',
                selectedVisibility === option.value ? 'border-primary bg-[#eff6ff]' : 'border-border bg-transparent',
              )}
            >
              <RadioGroupItem value={option.value} className="mt-0.5" />
              <div>
                <p className="font-bold">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.helper}</p>
              </div>
            </label>
          ))}
        </RadioGroup>

        <div className="flex justify-end">
          <Button
            disabled={selectedVisibility === visibility || isSavingVisibility}
            onClick={handleSaveVisibility}
          >
            {isSavingVisibility ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="rounded-[4px] border border-destructive bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <h2 className="mb-1 text-xl font-bold text-destructive">Danger Zone</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">Delete this repository</p>
            <p className="text-sm text-muted-foreground">
              Once deleted, this repository and its history are gone for good. There is no undo.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="shrink-0 border-destructive text-destructive hover:bg-destructive/10"
          >
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && handleCloseDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="size-5" /> Delete {ownerUsername}/{repoName}
            </DialogTitle>
          </DialogHeader>

          {deleteError && (
            <Alert variant="danger">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <Alert variant="warning">
            <AlertDescription>
              This permanently deletes the repository, including all commits. This cannot be undone.
            </AlertDescription>
          </Alert>

          <p className="text-sm">
            Type <strong>{repoName}</strong> to confirm.
          </p>
          <Input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={repoName}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== repoName || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting…' : 'Delete this repository'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RepoSettingsPanel
