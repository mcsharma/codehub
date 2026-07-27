import { useState } from 'react'
import { graphql, useMutation } from 'react-relay'
import { useNavigate, useRevalidator } from 'react-router'
import type { RepoSettingsPanelUpdateVisibilityMutation } from './__generated__/RepoSettingsPanelUpdateVisibilityMutation.graphql'
import type { RepoSettingsPanelDeleteMutation } from './__generated__/RepoSettingsPanelDeleteMutation.graphql'
import * as stylex from '@stylexjs/stylex'
import { AlertTriangle } from 'lucide-react'

import { Card, CardBody } from '../ui/Card'
import { Text } from '../ui/Text'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../ui/Dialog'
import { FieldRoot, FieldInput } from '../ui/Field'
import { RadioCardRoot, RadioCardItem, radioCardRootStyle } from '../ui/RadioCard'
import { colors, fontWeights, fontSizes, space } from '../theme/tokens.stylex'

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

const styles = stylex.create({
  boldText: {
    fontWeight: fontWeights.bold,
  },
  deleteConfirmButton: {
    backgroundColor: colors.errorFg,
    color: colors.solidContrast,
  },
  root: {
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: space[4],
  },
  cardBody: {
    padding: space[4],
  },
  title: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.lg,
    marginBottom: space[0.5],
  },
  titleDanger: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.lg,
    marginBottom: space[0.5],
    color: colors.errorFg,
  },
  description: {
    marginBottom: space[3],
  },
  alert: {
    marginBottom: space[2],
  },
  radioGroup: {
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 600px)': '1fr 1fr',
    },
    marginBottom: space[3],
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  dangerCard: {
    borderColor: colors.errorFg,
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  dangerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    marginTop: space[2],
  },
  deleteButton: {
    flexShrink: 0,
  },
  dialogTitleText: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
    color: colors.errorFg,
  },
  dialogMessage: {
    marginBottom: space[1],
  },
})

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
    <div {...stylex.props(styles.root)}>
      <Card>
        <CardBody xstyle={styles.cardBody}>
          <Text size="lg" xstyle={styles.title}>
            General
          </Text>
          <Text color="muted" xstyle={styles.description}>
            Control who can see this repository.
          </Text>

          {visibilityError && (
            <Alert status="error" xstyle={styles.alert}>
              {visibilityError}
            </Alert>
          )}

          <RadioCardRoot
            value={selectedVisibility}
            onValueChange={(val) => setSelectedVisibility(val as 'PUBLIC' | 'PRIVATE')}
            {...stylex.props(radioCardRootStyle, styles.radioGroup)}
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <RadioCardItem
                key={option.value}
                value={option.value}
                label={option.label}
                description={option.helper}
              />
            ))}
          </RadioCardRoot>

          <div {...stylex.props(styles.buttonRow)}>
            <Button
              variant="solid"
              disabled={selectedVisibility === visibility || isSavingVisibility}
              onClick={handleSaveVisibility}
            >
              {isSavingVisibility ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card xstyle={styles.dangerCard}>
        <CardBody xstyle={styles.cardBody}>
          <Text size="lg" xstyle={styles.titleDanger}>
            Danger Zone
          </Text>
          <div {...stylex.props(styles.dangerRow)}>
            <div>
              <Text xstyle={styles.boldText}>Delete this repository</Text>
              <Text size="sm" color="muted">
                Once deleted, this repository and its history are gone for good. There is no undo.
              </Text>
            </div>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              xstyle={styles.deleteButton}
            >
              Delete
            </Button>
          </div>
        </CardBody>
      </Card>

      <DialogRoot open={deleteDialogOpen} onOpenChange={(open) => !open && handleCloseDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span {...stylex.props(styles.dialogTitleText)}>
                <AlertTriangle size={18} /> Delete {ownerUsername}/{repoName}
              </span>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {deleteError && (
              <Alert status="error" xstyle={styles.alert}>
                {deleteError}
              </Alert>
            )}
            <Alert status="warning" xstyle={styles.alert}>
              This permanently deletes the repository, including all commits. This cannot be undone.
            </Alert>
            <Text xstyle={styles.dialogMessage}>
              Type <strong>{repoName}</strong> to confirm.
            </Text>
            <FieldRoot>
              <FieldInput
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={repoName}
              />
            </FieldRoot>
          </DialogBody>
          <DialogFooter>
            <Button onClick={handleCloseDeleteDialog} variant="subtle">
              Cancel
            </Button>
            <Button
              variant="solid"
              disabled={confirmText !== repoName || isDeleting}
              onClick={handleDelete}
              xstyle={styles.deleteConfirmButton}
            >
              {isDeleting ? 'Deleting…' : 'Delete this repository'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  )
}

export default RepoSettingsPanel
