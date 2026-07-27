import { Fragment } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { useLoaderData } from 'react-router'
import type { RepoBlobPageQuery } from './__generated__/RepoBlobPageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import { FileText } from 'lucide-react'
import { formatFileSize } from '../utils/formatters'
import { languageFromPath } from '../utils/languageFromPath'

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
    return <p className="text-muted-foreground">This file doesn&apos;t exist.</p>
  }

  if (file.isBinary || file.isTooLarge) {
    return (
      <div className="flex items-center gap-4 rounded-[8px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <FileText size={16} className="text-muted-foreground" />
        <div>
          <p className="font-bold">
            {file.isBinary ? 'Binary file not shown' : 'File too large to display'}
          </p>
          <p className="text-sm text-muted-foreground">{formatFileSize(file.size ?? 0)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
      <pre className="m-0 overflow-x-auto p-0 font-mono text-[0.8125rem] leading-[1.6]">
        <code className="grid w-full grid-cols-[max-content_1fr]">
          {highlightedLines!.map((line, index) => (
            <Fragment key={index}>
              <span className="border-r border-border py-0 pr-2 pl-3 text-right text-[rgba(0,0,0,0.38)] select-none">
                {index + 1}
              </span>
              <span
                className="py-0 pr-6 pl-4 whitespace-pre"
                dangerouslySetInnerHTML={{
                  __html: line || '&nbsp;',
                }}
              />
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  )
}

export default RepoBlobPage
