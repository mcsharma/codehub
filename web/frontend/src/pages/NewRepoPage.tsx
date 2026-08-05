import { useState } from 'react'
import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { useLoaderData, useNavigate } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { NewRepoPageQuery } from './__generated__/NewRepoPageQuery.graphql'
import type { NewRepoPageCreateMutation } from './__generated__/NewRepoPageCreateMutation.graphql'

import { Lightbulb } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Alert, AlertDescription } from '../components/ui/alert'
import { cn } from '@/lib/utils'

export type { NewRepoPageQuery }

const VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC',
    label: 'Public',
    helper: 'Anyone on the internet can see this repository.',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    helper: 'Only you and people you choose can see this.',
  },
] as const

const VCS_OPTIONS = [
  {
    value: 'GIT',
    label: 'Git',
    helper: 'Use plain git or Sapling — no CodeHub-specific CLI needed.',
  },
  {
    value: 'HG',
    label: 'Mercurial',
    helper: 'Review-gated commits via the ch CLI.',
  },
] as const

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
  const [kind, setKind] = useState<'HG' | 'GIT'>('GIT')
  const [error, setError] = useState<string | null>(null)

  const [commitCreate, isCreating] = useMutation<NewRepoPageCreateMutation>(
    graphql`
      mutation NewRepoPageCreateMutation(
        $name: String!
        $description: String
        $visibility: RepositoryVisibility!
        $kind: VcsKind!
      ) {
        create_repository(
          name: $name
          description: $description
          visibility: $visibility
          kind: $kind
        ) {
          name
        }
      }
    `,
  )

  if (!data.current_user) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-8">
        <Alert variant="warning">
          <AlertDescription>
            You need to be logged in to create a repository.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  const username = data.current_user.username

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    commitCreate({
      variables: { name, description: description || null, visibility, kind },
      onCompleted: (response) => {
        if (response.create_repository) {
          navigate(`/${username}/${response.create_repository.name}`)
        }
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="mx-auto max-w-[600px] px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-[2.125rem] font-bold">Create a new repository</h1>
        <p className="mt-2 text-muted-foreground">
          A repository contains all your project files and revision history.
        </p>
      </div>

      <div className="rounded-[4px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <p className="mb-2 font-bold">Repository Name *</p>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-[#f9fafb] px-3 shadow-xs transition-[color,box-shadow,border-color] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                {username} /
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="my-awesome-project"
                className="ml-1 h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
            </div>
            <p className="mt-2 text-xs font-bold text-muted-foreground uppercase">
              Great repository names are short and memorable.
            </p>
          </div>

          <div>
            <p className="mb-2 font-bold">
              Description{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief description of your project..."
            />
          </div>

          <div className="border-t border-border pt-6">
            <p className="mb-4 font-bold">Version control</p>
            <RadioGroup
              value={kind}
              onValueChange={(value) => setKind(value as 'HG' | 'GIT')}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {VCS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-[4px] border-2 p-4',
                    kind === option.value
                      ? 'border-primary bg-[#eff6ff]'
                      : 'border-border bg-transparent',
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div>
                    <p className="font-bold">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.helper}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="border-t border-border pt-6">
            <p className="mb-4 font-bold">Visibility</p>
            <RadioGroup
              value={visibility}
              onValueChange={(value) =>
                setVisibility(value as 'PUBLIC' | 'PRIVATE')
              }
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-[4px] border-2 p-4',
                    visibility === option.value
                      ? 'border-primary bg-[#eff6ff]'
                      : 'border-border bg-transparent',
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div>
                    <p className="font-bold">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.helper}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-4 border-t border-border pt-6">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name}>
              {isCreating ? 'Creating…' : 'Create Repository'}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex gap-4 rounded-[4px] border border-border bg-[#fafafa] p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-primary">
          <Lightbulb size={16} />
        </div>
        <div>
          <p className="font-bold">Pro Tip</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {kind === 'GIT'
              ? "You can initialize this repository with a README or .gitignore file later using git or Sapling once it's created."
              : "You can initialize this repository with a README or an .hgignore file later using our CLI once it's created."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default NewRepoPage
