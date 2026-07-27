import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

interface RepoNotFoundProps {
  ownerUsername: string
  repoName: string
}

const RepoNotFound = ({ ownerUsername, repoName }: RepoNotFoundProps) => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Typography color="text.secondary">
      Repository &quot;{ownerUsername}/{repoName}&quot; not found.
    </Typography>
  </Container>
)

export default RepoNotFound
