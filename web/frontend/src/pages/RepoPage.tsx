import { graphql, usePreloadedQuery } from "react-relay";
import { Link, useLoaderData } from "react-router";
import type { RepoPageQuery } from "./__generated__/RepoPageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AdjustOutlinedIcon from "@mui/icons-material/AdjustOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StatusBadge from "../components/StatusBadge";
import CloneButton from "../components/CloneButton";
import RepoCommitsList from "./RepoCommitsList";

const RepoPage = () => {
  const { repoQueryRef } = useLoaderData() as {
    repoQueryRef: PreloadedQuery<RepoPageQuery>;
  };

  const data = usePreloadedQuery<RepoPageQuery>(
    graphql`
      query RepoPageQuery($owner_username: String!, $name: String!) {
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

  return (
    <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <Typography component={Link} to={`/${ownerName}`} color="text.secondary" sx={{ fontWeight: 400 }}>
                {ownerName}
              </Typography>{" "}
              /{" "}
              {repository.name}
            </Typography>
            <StatusBadge
              label={repository.visibility === "PUBLIC" ? "Public" : "Private"}
              tone={repository.visibility === "PUBLIC" ? "neutral" : "primary"}
            />
          </Box>
          <CloneButton ownerUsername={ownerName} repoName={repository.name ?? repoName} />
        </Box>

        <Tabs value="commits">
          <Tab
            value="code"
            disabled
            icon={<CodeOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Code"
          />
          <Tab
            value="commits"
            icon={<HistoryOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Commits"
          />
          <Tab
            value="issues"
            disabled
            icon={<AdjustOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Issues"
          />
          <Tab
            value="settings"
            disabled
            icon={<SettingsOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Settings"
          />
        </Tabs>
      </Container>

      <Box sx={{ bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <RepoCommitsList query={data} ownerUsername={ownerName} repoName={repository.name ?? repoName} />
        </Container>
      </Box>
    </Box>
  );
};

export default RepoPage;
