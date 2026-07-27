import { useState } from 'react'
import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { useLoaderData, useNavigate } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { NewRepoPageQuery } from './__generated__/NewRepoPageQuery.graphql'
import type { NewRepoPageCreateMutation } from './__generated__/NewRepoPageCreateMutation.graphql'
import * as stylex from '@stylexjs/stylex'
import { Lightbulb } from 'lucide-react'

import { Container } from '../ui/Container'
import { Card, CardBody } from '../ui/Card'
import { Text } from '../ui/Text'
import { Heading } from '../ui/Heading'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { FieldRoot, FieldTextarea } from '../ui/Field'
import { RadioCardRoot, RadioCardItem, radioCardRootStyle } from '../ui/RadioCard'
import { colors, fontWeights, fontSizes, radii, space } from '../theme/tokens.stylex'

export type { NewRepoPageQuery }

const styles = stylex.create({
  containerWarningPadding: {
    paddingVertical: space[4],
  },
  containerPagePadding: {
    paddingVertical: space[8],
  },
  labelMargin: {
    marginBottom: space[2],
  },
  header: {
    textAlign: 'center',
    marginBottom: space[5],
  },
  title: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes['2xl'],
  },
  subtitle: {
    marginTop: space[1],
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: space[4],
  },
  cardBody: {
    padding: space[4],
  },
  fieldBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: space[1],
  },
  fieldLabel: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  fieldLabelWithMargin: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
    marginBottom: space[2],
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.bgSubtle,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    paddingLeft: '14px',
    ':focus-within': {
      borderColor: colors.brandSolid,
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '-1px',
    },
  },
  prefix: {
    color: colors.fgMuted,
    fontWeight: fontWeights.medium,
    marginRight: space[1.5],
    userSelect: 'none',
  },
  innerInput: {
    flex: 1,
    minWidth: 0,
    outline: 'none',
    appearance: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    paddingBlock: '16.5px',
    paddingRight: '14px',
    fontSize: fontSizes.md,
    color: colors.fg,
    fontFamily: 'inherit',
  },
  hintText: {
    display: 'block',
    marginTop: space[1],
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
  },
  visibilitySection: {
    paddingTop: space[3],
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  radioGroup: {
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 600px)': '1fr 1fr',
    },
    gap: space[2],
  },
  actionsRow: {
    paddingTop: space[3],
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: space[2],
  },
  tipCard: {
    marginTop: space[4],
    backgroundColor: colors.bgSubtle,
    borderColor: colors.border,
  },
  tipCardBody: {
    padding: space[3],
    display: 'flex',
    gap: space[2],
  },
  tipIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: radii.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.brandFg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    flexShrink: 0,
    backgroundColor: colors.bg,
  },
  tipTitle: {
    fontWeight: fontWeights.bold,
  },
  tipText: {
    marginTop: space[0.5],
  },
})

const NewRepoPage = () => {
  const navigate = useNavigate()
  const { newRepoQueryRef } = useLoaderData() as {
    newRepoQueryRef: PreloadedQuery<NewRepoPageQuery>
  }

  const data = usePreloadedQuery<NewRepoPageQuery>(
    graphql`
      query NewRepoPageQuery {
        current_user {
          username
        }
      }
    `,
    newRepoQueryRef,
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [error, setError] = useState<string | null>(null)

  const [commitCreate, isCreating] = useMutation<NewRepoPageCreateMutation>(
    graphql`
      mutation NewRepoPageCreateMutation(
        $name: String!
        $description: String
        $visibility: RepositoryVisibility!
      ) {
        create_repository(
          name: $name
          description: $description
          visibility: $visibility
        ) {
          name
        }
      }
    `,
  )

  if (!data.current_user) {
    return (
      <Container maxWidth="sm" xstyle={styles.containerWarningPadding}>
        <Alert status="warning">
          You need to be logged in to create a repository.
        </Alert>
      </Container>
    )
  }
  const username = data.current_user.username

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    commitCreate({
      variables: { name, description: description || null, visibility },
      onCompleted: (response) => {
        if (response.create_repository) {
          navigate(`/${username}/${response.create_repository.name}`)
        }
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <Container maxWidth="sm" xstyle={styles.containerPagePadding}>
      <div {...stylex.props(styles.header)}>
        <Heading as="h1" size="2xl" xstyle={styles.title}>
          Create a new repository
        </Heading>
        <Text color="muted" xstyle={styles.subtitle}>
          A repository contains all your project files and revision history.
        </Text>
      </div>

      <Card>
        <CardBody xstyle={styles.cardBody}>
          <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
            {error && <Alert status="error">{error}</Alert>}

            <div {...stylex.props(styles.fieldBlock)}>
              <label {...stylex.props(styles.fieldLabel)}>
                Repository Name *
              </label>
              <div {...stylex.props(styles.inputWrapper)}>
                <span {...stylex.props(styles.prefix)}>{username} /</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  placeholder="my-awesome-project"
                  {...stylex.props(styles.innerInput)}
                />
              </div>
              <Text size="xs" color="muted" xstyle={styles.hintText}>
                Great repository names are short and memorable.
              </Text>
            </div>

            <div {...stylex.props(styles.fieldBlock)}>
              <label {...stylex.props(styles.fieldLabel)}>
                Description{' '}
                <span style={{ fontWeight: 400, color: colors.fgMuted }}>
                  (optional)
                </span>
              </label>
              <FieldRoot>
                <FieldTextarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="A brief description of your project..."
                />
              </FieldRoot>
            </div>

            <div {...stylex.props(styles.visibilitySection)}>
              <Text xstyle={styles.fieldLabelWithMargin}>
                Visibility
              </Text>
              <RadioCardRoot
                value={visibility}
                onValueChange={(val) => setVisibility(val as 'PUBLIC' | 'PRIVATE')}
                {...stylex.props(radioCardRootStyle, styles.radioGroup)}
              >
                <RadioCardItem
                  value="PUBLIC"
                  label="Public"
                  description="Anyone on the internet can see this repository."
                />
                <RadioCardItem
                  value="PRIVATE"
                  label="Private"
                  description="Only you and people you choose can see this."
                />
              </RadioCardRoot>
            </div>

            <div {...stylex.props(styles.actionsRow)}>
              <Button onClick={() => navigate(-1)} variant="subtle">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                disabled={isCreating || !name}
                size="lg"
              >
                {isCreating ? 'Creating…' : 'Create Repository'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card xstyle={styles.tipCard}>
        <CardBody xstyle={styles.tipCardBody}>
          <div {...stylex.props(styles.tipIconWrapper)}>
            <Lightbulb size={20} />
          </div>
          <div>
            <Text xstyle={styles.tipTitle}>Pro Tip</Text>
            <Text size="sm" color="muted" xstyle={styles.tipText}>
              You can initialize this repository with a README or an .hgignore
              file later using our CLI once it&apos;s created.
            </Text>
          </div>
        </CardBody>
      </Card>
    </Container>
  )
}

export default NewRepoPage
