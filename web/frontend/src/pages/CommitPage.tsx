import { useMemo, useState } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { CommitPageQuery } from './__generated__/CommitPageQuery.graphql'
import { DiffView, DiffModeEnum } from '@git-diff-view/react'
import '@git-diff-view/react/styles/diff-view.css'
import './CommitPage.css'
import * as stylex from '@stylexjs/stylex'
import { ChevronLeft, FileText } from 'lucide-react'

import { Container } from '../ui/Container'
import { Card, CardBody } from '../ui/Card'
import { Text } from '../ui/Text'
import { buttonStyles } from '../ui/Button'
import { Divider } from '../ui/Divider'
import { SegmentGroup } from '../ui/SegmentGroup'
import UserAvatar from '../components/UserAvatar'
import CommitFileTree from '../components/CommitFileTree'
import CollapsibleSidebarPane from '../components/CollapsibleSidebarPane'
import { formatCommitAuthor } from '../utils/formatters'
import { parseUnifiedDiff, countDiffStats } from '../utils/parseUnifiedDiff'
import { colors, fonts, fontSizes, fontWeights, radii, space } from '../theme/tokens.stylex'

const styles = stylex.create({
  containerPadding: {
    paddingVertical: space[6],
  },
  cardMarginBottom: {
    marginBottom: space[4],
  },
  dividerMargin: {
    marginBlock: space[3],
  },
  root: {
    paddingVertical: space[3],
    paddingHorizontal: '20px',
  },
  subHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  ownerLink: {
    color: colors.brandFg,
    textDecoration: 'none',
    fontWeight: fontWeights.bold,
    ':hover': { textDecoration: 'underline' },
  },
  repoLink: {
    color: colors.brandFg,
    textDecoration: 'none',
    fontWeight: fontWeights.bold,
    ':hover': { textDecoration: 'underline' },
  },
  breadcrumbText: {
    color: colors.fgMuted,
  },
  shortNode: {
    fontFamily: fonts.mono,
    backgroundColor: colors.bg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    paddingInline: space[1],
    paddingBlock: space[0.25],
    borderRadius: radii.sm,
    color: colors.brandFg,
  },
  backButton: {
    color: colors.fg,
  },
  cardBody: {
    padding: space[4],
  },
  commitMetaRow: {
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 768px)': 'row',
    },
    justifyContent: 'space-between',
    gap: space[3],
  },
  metaLeft: {
    flex: 1,
    minWidth: 0,
  },
  commitDescription: {
    fontWeight: fontWeights.normal,
    marginBottom: space[2],
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1.5],
  },
  authorName: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  committedOnText: {
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
  },
  metaRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: {
      default: 'flex-start',
      '@media (min-width: 768px)': 'flex-end',
    },
    gap: space[1],
    flexShrink: 0,
  },
  metaRightRow: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
  },
  metaLabel: {
    fontWeight: fontWeights.bold,
  },
  fullNode: {
    fontFamily: fonts.mono,
    fontWeight: fontWeights.bold,
    backgroundColor: colors.bg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    paddingInline: space[1.5],
    paddingBlock: space[0.5],
    borderRadius: radii.md,
  },
  parentNodeLink: {
    fontFamily: fonts.mono,
    fontWeight: fontWeights.bold,
    color: colors.brandFg,
    textDecoration: 'none',
    ':hover': { textDecoration: 'underline' },
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsText: {
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
  },
  filesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: space[3],
  },
  fileCard: {
    overflow: 'hidden',
    scrollMarginTop: '16px',
  },
  fileCardHeader: {
    backgroundColor: colors.bg,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    paddingInline: space[2.5],
    paddingBlock: space[1.5],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1.5],
  },
  fileIcon: {
    color: colors.fgMuted,
  },
  filePath: {
    fontFamily: fonts.mono,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  statusAdded: {
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    color: colors.successFg,
  },
  statusDeleted: {
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    color: colors.errorFg,
  },
  statsRight: {
    display: 'flex',
    gap: space[1.5],
  },
  additions: {
    fontWeight: fontWeights.bold,
    color: colors.successFg,
  },
  deletions: {
    fontWeight: fontWeights.bold,
    color: colors.errorFg,
  },
  binaryFallback: {
    padding: space[2.5],
  },
})

const CommitPage = () => {
  const { commitQueryRef } = useLoaderData() as {
    commitQueryRef: PreloadedQuery<CommitPageQuery>
  }

  const data = usePreloadedQuery<CommitPageQuery>(
    graphql`
      query CommitPageQuery(
        $owner_username: String!
        $name: String!
        $node: String!
      ) {
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          name
          commit(node: $node) {
            node
            short_node
            description
            author
            date
            parents
            files {
              path
              status
            }
            diff
          }
        }
      }
    `,
    commitQueryRef,
  )

  const [mode, setMode] = useState<'unified' | 'split'>('split')
  const [activePath, setActivePath] = useState<string | null>(null)

  const handleSelectFile = (path: string) => {
    setActivePath(path)
    document
      .getElementById(path)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { owner_username: ownerUsername, name: repoName } =
    commitQueryRef.variables
  const repository = data.repository_by_owner_and_name
  const commit = repository?.commit

  const diffChunksByPath = useMemo(
    () => parseUnifiedDiff(commit?.diff ?? ''),
    [commit?.diff],
  )

  if (!repository || !commit) {
    return (
      <Container maxWidth="lg" xstyle={styles.containerPadding}>
        <Text color="muted">Commit not found.</Text>
      </Container>
    )
  }

  const files = commit.files ?? []
  let totalAdditions = 0
  let totalDeletions = 0
  for (const file of files) {
    const { additions, deletions } = countDiffStats(
      diffChunksByPath.get(file.path ?? '') ?? '',
    )
    totalAdditions += additions
    totalDeletions += deletions
  }

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.subHeader)}>
        <div {...stylex.props(styles.breadcrumbs)}>
          <Link to={`/${ownerUsername}`} {...stylex.props(styles.ownerLink)}>
            {ownerUsername}
          </Link>
          <span {...stylex.props(styles.breadcrumbText)}>/</span>
          <Link
            to={`/${ownerUsername}/${repoName}`}
            {...stylex.props(styles.repoLink)}
          >
            {repoName}
          </Link>
          <span {...stylex.props(styles.breadcrumbText)}>/ commit /</span>
          <span {...stylex.props(styles.shortNode)}>
            {commit.short_node}
          </span>
        </div>
        <Link
          to={`/${ownerUsername}/${repoName}`}
          {...stylex.props(...buttonStyles('outline', 'sm'), styles.backButton)}
        >
          <ChevronLeft size={16} style={{ marginRight: 4 }} />
          Back to commits
        </Link>
      </div>

      <Card xstyle={styles.cardMarginBottom}>
        <CardBody xstyle={styles.cardBody}>
          <div {...stylex.props(styles.commitMetaRow)}>
            <div {...stylex.props(styles.metaLeft)}>
              <Text xstyle={styles.commitDescription}>
                {commit.description}
              </Text>
              <div {...stylex.props(styles.authorRow)}>
                <UserAvatar />
                <span {...stylex.props(styles.authorName)}>
                  {formatCommitAuthor(commit.author ?? '')}
                </span>
                <Text
                  size="xs"
                  color="muted"
                  xstyle={styles.committedOnText}
                >
                  Committed on{' '}
                  {commit.date
                    ? new Date(commit.date * 1000).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'unknown date'}
                </Text>
              </div>
            </div>
            <div {...stylex.props(styles.metaRight)}>
              <div {...stylex.props(styles.metaRightRow)}>
                <Text size="xs" color="muted" xstyle={styles.metaLabel}>
                  Commit
                </Text>
                <span {...stylex.props(styles.fullNode)}>
                  {commit.node}
                </span>
              </div>
              {commit.parents && commit.parents.length > 0 && (
                <div {...stylex.props(styles.metaRightRow)}>
                  <Text size="xs" color="muted" xstyle={styles.metaLabel}>
                    Parent
                  </Text>
                  <Link
                    to={`/${ownerUsername}/${repoName}/commit/${commit.parents[0]}`}
                    {...stylex.props(styles.parentNodeLink)}
                  >
                    {commit.parents[0]!.slice(0, 12)}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Divider xstyle={styles.dividerMargin} />

          <div {...stylex.props(styles.statsRow)}>
            <Text
              size="xs"
              color="muted"
              xstyle={styles.statsText}
            >
              Showing {files.length} changed file{files.length === 1 ? '' : 's'}{' '}
              with {totalAdditions} addition
              {totalAdditions === 1 ? '' : 's'} and {totalDeletions} deletion
              {totalDeletions === 1 ? '' : 's'}
            </Text>
            <SegmentGroup
              options={[
                { value: 'split', label: 'Split' },
                { value: 'unified', label: 'Unified' },
              ]}
              value={mode}
              onValueChange={(val) => setMode(val as 'split' | 'unified')}
            />
          </div>
        </CardBody>
      </Card>

      <Divider />

      <CollapsibleSidebarPane
        label={`Files (${files.length})`}
        sidebar={
          <CommitFileTree
            files={files
              .filter(
                (f): f is { path: string; status: string | null } => !!f.path,
              )
              .map((f) => ({ path: f.path, status: f.status ?? 'modified' }))}
            activePath={activePath}
            onSelectFile={handleSelectFile}
          />
        }
      >
        <div {...stylex.props(styles.filesContainer)}>
          {files.map((file) => {
            const chunk = diffChunksByPath.get(file.path ?? '')
            const { additions, deletions } = countDiffStats(chunk ?? '')
            return (
              <Card
                key={file.path}
                id={file.path ?? undefined}
                xstyle={styles.fileCard}
              >
                <div {...stylex.props(styles.fileCardHeader)}>
                  <div {...stylex.props(styles.fileHeaderLeft)}>
                    <FileText size={16} {...stylex.props(styles.fileIcon)} />
                    <span {...stylex.props(styles.filePath)}>
                      {file.path}
                    </span>
                    {file.status && file.status !== 'modified' && (
                      <span
                        {...stylex.props(
                          file.status === 'added'
                            ? styles.statusAdded
                            : styles.statusDeleted,
                        )}
                      >
                        {file.status}
                      </span>
                    )}
                  </div>
                  <div {...stylex.props(styles.statsRight)}>
                    <span {...stylex.props(styles.additions)}>
                      +{additions}
                    </span>
                    <span {...stylex.props(styles.deletions)}>
                      -{deletions}
                    </span>
                  </div>
                </div>
                {chunk ? (
                  <DiffView
                    data={{
                      oldFile: { fileName: file.path },
                      newFile: { fileName: file.path },
                      hunks: [chunk],
                    }}
                    diffViewMode={
                      mode === 'split'
                        ? DiffModeEnum.Split
                        : DiffModeEnum.Unified
                    }
                    diffViewHighlight
                    diffViewWrap
                    diffViewFontSize={13}
                  />
                ) : (
                  <Text color="muted" xstyle={styles.binaryFallback}>
                    Binary file not shown.
                  </Text>
                )}
              </Card>
            )
          })}
        </div>
      </CollapsibleSidebarPane>
    </div>
  )
}

export default CommitPage
