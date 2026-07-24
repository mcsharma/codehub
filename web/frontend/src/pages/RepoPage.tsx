import { graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData } from "react-router";
import type { RepoPageQuery } from "./__generated__/RepoPageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RepoHeader from "../components/RepoHeader";
import RepoCommitsList from "./RepoCommitsList";

const RepoPage = () => {
  const { repoQueryRef } = useLoaderData() as {
    repoQueryRef: PreloadedQuery<RepoPageQuery>;
  };

  const data = usePreloadedQuery<RepoPageQuery>(
    graphql`
      query RepoPageQuery($owner_username: String!, $name: String!) {
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
        }
        ...RepoCommitsList_query @arguments(owner_username: $owner_username, name: $name)
      }
    `,
    repoQueryRef
  );

  const repository = data.repository_by_owner_and_name;
  const { owner_username, name: repoName } = repoQueryRef.variables;

  if (!repository) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography color="text.secondary">
          Repository &quot;{owner_username}/{repoName}&quot; not found.
        </Typography>
      </Container>
    );
  }

  const ownerName: string =
    (repository.owner?.__typename === "User"
      ? repository.owner.username
      : repository.owner?.__typename === "Organization"
        ? repository.owner.name
        : null) ?? owner_username;

  const isOwner = data.current_user?.username === ownerName;

  return (
    <Box>
      <RepoHeader
        ownerUsername={ownerName}
        repoName={repository.name ?? repoName}
        visibility={repository.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
        isOwner={isOwner}
      />
      <Box sx={{ bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <RepoCommitsList query={data} ownerUsername={ownerName} repoName={repository.name ?? repoName} />
        </Container>
      </Box>
    </Box>
  );
};

export default RepoPage;
