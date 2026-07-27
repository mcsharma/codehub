import { Fragment } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { useLoaderData } from 'react-router'
import type { RepoBlobPageQuery } from './__generated__/RepoBlobPageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { FileText } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'

import { Card, CardBody } from '../ui/Card'
import { Text } from '../ui/Text'
import { formatFileSize } from '../utils/formatters'
import { languageFromPath } from '../utils/languageFromPath'
import { colors, fonts, fontWeights, radii, space } from '../theme/tokens.stylex'

const styles = stylex.create({
  card: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  binaryCardBody: {
    padding: space[4],
    display: 'flex',
    alignItems: 'center',
    gap: space[2],
  },
  binaryIcon: {
    color: colors.fgMuted,
  },
  boldText: {
    fontWeight: fontWeights.bold,
  },
  pre: {
    margin: 0,
    padding: 0,
    overflowX: 'auto',
    fontFamily: fonts.mono,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
  },
  code: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    width: '100%',
  },
  lineNumber: {
    textAlign: 'right',
    paddingLeft: space[1.5],
    paddingRight: space[1],
    userSelect: 'none',
    color: colors.fgSubtle,
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  lineContent: {
    paddingLeft: space[2],
    paddingRight: space[3],
    whiteSpace: 'pre',
  },
})

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
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
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
  const file = repository?.file

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

  if (!file) {
    return (
      <Text color="muted">
        This file doesn&apos;t exist.
      </Text>
    )
  }

  if (file.isBinary || file.isTooLarge) {
    return (
      <Card xstyle={styles.card}>
        <CardBody xstyle={styles.binaryCardBody}>
          <FileText size={20} {...stylex.props(styles.binaryIcon)} />
          <div>
            <Text xstyle={styles.boldText}>
              {file.isBinary
                ? 'Binary file not shown'
                : 'File too large to display'}
            </Text>
            <Text size="sm" color="muted">
              {formatFileSize(file.size ?? 0)}
            </Text>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card xstyle={styles.card}>
      <pre {...stylex.props(styles.pre)}>
        <code {...stylex.props(styles.code)}>
          {highlightedLines!.map((line, index) => (
            <Fragment key={index}>
              <span {...stylex.props(styles.lineNumber)}>
                {index + 1}
              </span>
              <span
                {...stylex.props(styles.lineContent)}
                dangerouslySetInnerHTML={{
                  __html: line || '&nbsp;',
                }}
              />
            </Fragment>
          ))}
        </code>
      </pre>
    </Card>
  )
}

export default RepoBlobPage
