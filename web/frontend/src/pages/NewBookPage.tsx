import { useState } from 'react'
import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { useLoaderData, useNavigate } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { NewBookPageQuery } from './__generated__/NewBookPageQuery.graphql'
import type { NewBookPageCreateMutation } from './__generated__/NewBookPageCreateMutation.graphql'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Alert, AlertDescription } from '../components/ui/alert'
import { cn } from '@/lib/utils'

const NewBookPage = () => {
  const navigate = useNavigate()
  const { newBookQueryRef } = useLoaderData() as {
    newBookQueryRef: PreloadedQuery<NewBookPageQuery>
  }

  const data = usePreloadedQuery<NewBookPageQuery>(
    graphql`
      query NewBookPageQuery {
        current_user {
          username
        }
        publishers {
          id
          name
        }
        authors {
          id
          name
        }
      }
    `,
    newBookQueryRef,
  )

  const [title, setTitle] = useState('')
  const [publicationYear, setPublicationYear] = useState('')
  const [publisherId, setPublisherId] = useState('')
  const [authorIds, setAuthorIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [commitCreate, isCreating] = useMutation<NewBookPageCreateMutation>(graphql`
    mutation NewBookPageCreateMutation(
      $title: String!
      $publication_year: Int
      $publisher_id: ID!
      $author_ids: [ID!]!
    ) {
      create_book(
        title: $title
        publication_year: $publication_year
        publisher_id: $publisher_id
        author_ids: $author_ids
      ) {
        id
      }
    }
  `)

  if (!data.current_user) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-8">
        <Alert variant="warning">
          <AlertDescription>You need to be logged in to add a book.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const toggleAuthor = (id: string) => {
    setAuthorIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    commitCreate({
      variables: {
        title,
        publication_year: publicationYear ? Number(publicationYear) : null,
        publisher_id: publisherId,
        author_ids: authorIds,
      },
      onCompleted: (response) => {
        if (response.create_book) {
          navigate(`/books/${response.create_book.id}`)
        }
      },
      onError: (err) => setError(err.message),
    })
  }

  const publishers = data.publishers ?? []
  const authors = data.authors ?? []

  return (
    <div className="mx-auto max-w-[600px] px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-[2.125rem] font-bold">Add a book</h1>
      </div>

      <div className="rounded-[4px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <p className="mb-2 font-bold">Title *</p>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>

          <div>
            <p className="mb-2 font-bold">
              Publication year <span className="font-normal text-muted-foreground">(optional)</span>
            </p>
            <Input
              type="number"
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              placeholder="2024"
            />
          </div>

          <div>
            <p className="mb-2 font-bold">Publisher *</p>
            {publishers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No publishers yet — create one first.</p>
            ) : (
              <select
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                required
                className="h-9 w-full rounded-md border border-input bg-[#f9fafb] px-3 text-sm outline-none"
              >
                <option value="" disabled>
                  Select a publisher
                </option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id ?? ''}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <p className="mb-2 font-bold">Authors</p>
            <div className="flex flex-col gap-2">
              {authors.map((author) => (
                <label
                  key={author.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-[4px] border p-2 text-sm',
                    authorIds.includes(author.id ?? '') ? 'border-primary bg-[#eff6ff]' : 'border-border',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={authorIds.includes(author.id ?? '')}
                    onChange={() => toggleAuthor(author.id ?? '')}
                  />
                  {author.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-border pt-6">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !title || !publisherId}>
              {isCreating ? 'Creating…' : 'Create Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewBookPage
