import * as stylex from '@stylexjs/stylex'
import { Container } from '../ui/Container'
import { Text } from '../ui/Text'
import { space } from '../theme/tokens.stylex'

const styles = stylex.create({
  container: { paddingBlock: space[6] },
})

interface RepoNotFoundProps {
  ownerUsername: string
  repoName: string
}

const RepoNotFound = ({ ownerUsername, repoName }: RepoNotFoundProps) => (
  <Container maxWidth="lg" xstyle={styles.container}>
    <Text color="muted">
      Repository &quot;{ownerUsername}/{repoName}&quot; not found.
    </Text>
  </Container>
)

export default RepoNotFound
