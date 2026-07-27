import { Fragment } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { useLoaderData } from 'react-router'
import type { RepoBlobPageQuery } from './__generated__/RepoBlobPageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import RepoCodeLayout from '../components/RepoCodeLayout'
import RepoNotFound from '../components/RepoNotFound'
import { resolveOwnerName } from '../utils/repoOwner'
import { formatFileSize } from '../utils/formatters'
import { languageFromPath } from '../utils/languageFromPath'
import { monoFontFamily } from '../theme'

const RepoBlobPage = () => {
  const { repoBlobQueryRef } = useLoaderData() as {
    repoBlobQueryRef: PreloadedQuery<RepoBlobPageQuery>
  }

  const data = usePreloadedQuery<RepoBlobPageQuery>(
    graphql`
      query RepoBlobPageQuery(
        $owner_username: String!
        $name: String!
        $rev: String!
        $path: String!
      ) {
        current_user {
          username
        }
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          name
          visibility
          owner {
            __typename
            ... on User {
              username
            }
            ... on Organization {
              name
            }
          }
          file(rev: $rev, path: $path) {
            path
            size
            isBinary
            isTooLarge
            content
          }
        }
      }
    `,
    repoBlobQueryRef,
  )

  const repository = data.repository_by_owner_and_name
  const { owner_username, name: repoName, rev } = repoBlobQueryRef.variables

  if (!repository) {
    return <RepoNotFound ownerUsername={owner_username} repoName={repoName} />
  }

  const ownerName = resolveOwnerName(repository.owner, owner_username)
  const isOwner = data.current_user?.username === ownerName
  const file = repository.file

  let highlightedLines: string[] | null = null
  if (file && !file.isBinary && !file.isTooLarge && file.content != null) {
    // Trim exactly one trailing newline before splitting — otherwise a
    // normal trailing-newline-terminated file renders one phantom blank
    // line at the end (files are conventionally described as having N
    // lines, not N+1, when the last line ends with \n).
    const content = file.content.replace(/\n$/, '')
    const language = languageFromPath(file.path ?? '')
    const result =
      language && hljs.getLanguage(language)
        ? hljs.highlight(content, { language })
        : hljs.highlightAuto(content)
    highlightedLines = result.value.split('\n')
  }

  return (
    <RepoCodeLayout
      ownerUsername={ownerName}
      repoName={repository.name ?? repoName}
      visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
      isOwner={isOwner}
      rev={rev}
      activePath={file?.path ?? ''}
    >
      {!file ? (
        <Typography color="text.secondary">
          This file doesn&apos;t exist.
        </Typography>
      ) : file.isBinary || file.isTooLarge ? (
        <Card
          sx={{
            borderRadius: '8px',
            p: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <InsertDriveFileOutlinedIcon
            fontSize="small"
            sx={{ color: 'text.secondary' }}
          />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              {file.isBinary
                ? 'Binary file not shown'
                : 'File too large to display'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatFileSize(file.size ?? 0)}
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 0,
              overflowX: 'auto',
              fontFamily: monoFontFamily,
              fontSize: '0.8125rem',
              lineHeight: 1.6,
            }}
          >
            <Box
              component="code"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'max-content 1fr',
                width: '100%',
              }}
            >
              {highlightedLines!.map((line, index) => (
                <Fragment key={index}>
                  <Box
                    component="span"
                    sx={{
                      textAlign: 'right',
                      pl: 1.5,
                      pr: 1,
                      userSelect: 'none',
                      color: 'text.disabled',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      pl: 2,
                      pr: 3,
                      whiteSpace: 'pre',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: line || '&nbsp;',
                    }}
                  />
                </Fragment>
              ))}
            </Box>
          </Box>
        </Card>
      )}
    </RepoCodeLayout>
  )
}

export default RepoBlobPage
