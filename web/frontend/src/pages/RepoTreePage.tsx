import { graphql, usePreloadedQuery } from "react-relay";
import { Link, useLoaderData } from "react-router";
import type { RepoTreePageQuery } from "./__generated__/RepoTreePageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import RepoHeader from "../components/RepoHeader";
import RepoPathBreadcrumb from "../components/RepoPathBreadcrumb";
import { formatFileSize } from "../utils/formatters";

const RepoTreePage = () => {
  const { repoTreeQueryRef } = useLoaderData() as {
    repoTreeQueryRef: PreloadedQuery<RepoTreePageQuery>;
  };

  const data = usePreloadedQuery<RepoTreePageQuery>(
    graphql`
      query RepoTreePageQuery($owner_username: String!, $name: String!, $rev: String!, $path: String!) {
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
          directory(rev: $rev, path: $path) {
            path
            directories {
              name
              path
            }
            files {
              name
              path
              size
            }
          }
        }
      }
    `,
    repoTreeQueryRef
  );

  const repository = data.repository_by_owner_and_name;
  const { owner_username, name: repoName, rev } = repoTreeQueryRef.variables;

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
  const directory = repository.directory;
  const directories = directory?.directories ?? [];
  const files = directory?.files ?? [];
  const treeBase = `/${ownerName}/${repository.name ?? repoName}/tree/${rev}`;
  const blobBase = `/${ownerName}/${repository.name ?? repoName}/blob/${rev}`;

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
          <RepoPathBreadcrumb
            ownerUsername={ownerName}
            repoName={repository.name ?? repoName}
            rev={rev}
            path={directory?.path ?? ""}
          />

          {!directory ? (
            <Typography color="text.secondary">This path doesn&apos;t exist.</Typography>
          ) : directories.length === 0 && files.length === 0 ? (
            <Typography color="text.secondary">This directory is empty.</Typography>
          ) : (
            <Card>
              {directories.map((entry, index) => (
                <Box key={entry.path}>
                  {index > 0 && <Divider />}
                  <Box
                    component={Link}
                    to={`${treeBase}/${entry.path}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <FolderOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography sx={{ fontFamily: "monospace", fontWeight: 700 }}>{entry.name}</Typography>
                  </Box>
                </Box>
              ))}
              {files.map((entry, index) => (
                <Box key={entry.path}>
                  {(index > 0 || directories.length > 0) && <Divider />}
                  <Box
                    component={Link}
                    to={`${blobBase}/${entry.path}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      p: 2,
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      <Typography sx={{ fontFamily: "monospace" }}>{entry.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatFileSize(entry.size ?? 0)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Card>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default RepoTreePage;
