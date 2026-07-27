interface RepoNotFoundProps {
  ownerUsername: string
  repoName: string
}

const RepoNotFound = ({ ownerUsername, repoName }: RepoNotFoundProps) => (
  <div className="mx-auto max-w-[1024px] px-4 py-12 sm:px-6">
    <p className="text-muted-foreground">
      Repository &quot;{ownerUsername}/{repoName}&quot; not found.
    </p>
  </div>
)

export default RepoNotFound
