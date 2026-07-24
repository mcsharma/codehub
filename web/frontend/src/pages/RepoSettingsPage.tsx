import { graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData } from "react-router";
import type { RepoSettingsPageQuery } from "./__generated__/RepoSettingsPageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RepoHeader from "../components/RepoHeader";
import RepoSettingsPanel from "./RepoSettingsPanel";

const RepoSettingsPage = () => {
  const { repoSettingsQueryRef } = useLoaderData() as {
    repoSettingsQueryRef: PreloadedQuery<RepoSettingsPageQuery>;
  };

  const data = usePreloadedQuery<RepoSettingsPageQuery>(
    graphql`
      query RepoSettingsPageQuery($owner_username: String!, $name: String!) {
        current_user {
          username
        }
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          id
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
      }
    `,
    repoSettingsQueryRef
  );

  const repository = data.repository_by_owner_and_name;
  const { owner_username, name: repoName } = repoSettingsQueryRef.variables;

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

  if (!isOwner) {
    return (
      <Box>
        <RepoHeader
          ownerUsername={ownerName}
          repoName={repository.name ?? repoName}
          visibility={repository.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
          isOwner={false}
        />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography color="text.secondary">You don&apos;t have access to this page.</Typography>
        </Container>
      </Box>
    );
  }

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
          <RepoSettingsPanel
            repositoryId={repository.id ?? ""}
            ownerUsername={ownerName}
            repoName={repository.name ?? repoName}
            visibility={repository.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
          />
        </Container>
      </Box>
    </Box>
  );
};

export default RepoSettingsPage;
