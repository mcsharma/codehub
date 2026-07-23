import { useMemo, useState } from "react";
import { graphql, usePreloadedQuery } from "react-relay";
import { Link, useLoaderData } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { CommitPageQuery } from "./__generated__/CommitPageQuery.graphql";
import { DiffView, DiffModeEnum } from "@git-diff-view/react";
import "@git-diff-view/react/styles/diff-view.css";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import UserAvatar from "../components/UserAvatar";
import { formatCommitAuthor } from "../utils/formatters";
import { parseUnifiedDiff, countDiffStats } from "../utils/parseUnifiedDiff";

const CommitPage = () => {
  const { commitQueryRef } = useLoaderData() as {
    commitQueryRef: PreloadedQuery<CommitPageQuery>;
  };

  const data = usePreloadedQuery<CommitPageQuery>(
    graphql`
      query CommitPageQuery($owner_username: String!, $name: String!, $node: String!) {
        repository_by_owner_and_name(owner_username: $owner_username, name: $name) {
          name
          commit(node: $node) {
            node
            short_node
            description
            author
            date
            parents
            files {
              path
              status
            }
            diff
          }
        }
      }
    `,
    commitQueryRef
  );

  const [mode, setMode] = useState<"unified" | "split">("unified");

  const { owner_username: ownerUsername, name: repoName } = commitQueryRef.variables;
  const repository = data.repository_by_owner_and_name;
  const commit = repository?.commit;

  const diffChunksByPath = useMemo(() => parseUnifiedDiff(commit?.diff ?? ""), [commit?.diff]);

  if (!repository || !commit) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography color="text.secondary">Commit not found.</Typography>
      </Container>
    );
  }

  const files = commit.files ?? [];
  let totalAdditions = 0;
  let totalDeletions = 0;
  for (const file of files) {
    const { additions, deletions } = countDiffStats(diffChunksByPath.get(file.path ?? "") ?? "");
    totalAdditions += additions;
    totalDeletions += deletions;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem", fontWeight: 700 }}>
          <Typography component={Link} to={`/${ownerUsername}`} color="primary" sx={{ fontWeight: 700 }}>
            {ownerUsername}
          </Typography>
          <Typography color="text.secondary">/</Typography>
          <Typography component={Link} to={`/${ownerUsername}/${repoName}`} color="primary" sx={{ fontWeight: 700 }}>
            {repoName}
          </Typography>
          <Typography color="text.secondary">/ commit /</Typography>
          <Typography
            sx={{
              fontFamily: "monospace",
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              color: "primary.main",
            }}
          >
            {commit.short_node}
          </Typography>
        </Box>
        <Button
          component={Link}
          to={`/${ownerUsername}/${repoName}`}
          startIcon={<ChevronLeftOutlinedIcon fontSize="small" />}
          color="inherit"
          size="small"
        >
          Back to commits
        </Button>
      </Box>

      <Card sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              {commit.description}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <UserAvatar />
              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                {formatCommitAuthor(commit.author ?? "")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, textTransform: "uppercase" }}
              >
                Committed on{" "}
                {commit.date ? new Date(commit.date * 1000).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) : "unknown date"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: { md: "flex-end" }, gap: 1, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Commit
              </Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                }}
              >
                {commit.node}
              </Typography>
            </Box>
            {commit.parents && commit.parents.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Parent
                </Typography>
                <Typography
                  component={Link}
                  to={`/${ownerUsername}/${repoName}/commit/${commit.parents[0]}`}
                  sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}
                >
                  {commit.parents[0]!.slice(0, 12)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, px: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
          Showing {files.length} changed file{files.length === 1 ? "" : "s"} with {totalAdditions} addition
          {totalAdditions === 1 ? "" : "s"} and {totalDeletions} deletion{totalDeletions === 1 ? "" : "s"}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_e, value) => value && setMode(value)}
        >
          <ToggleButton value="split">Split</ToggleButton>
          <ToggleButton value="unified">Unified</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {files.map((file) => {
          const chunk = diffChunksByPath.get(file.path ?? "");
          const { additions, deletions } = countDiffStats(chunk ?? "");
          return (
            <Card key={file.path} sx={{ overflow: "hidden" }}>
              <Box
                sx={{
                  bgcolor: "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  px: 2.5,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.875rem" }}>
                    {file.path}
                  </Typography>
                  {file.status && file.status !== "modified" && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: file.status === "added" ? "success.main" : "error.main",
                      }}
                    >
                      {file.status}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>
                    +{additions}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main" }}>
                    -{deletions}
                  </Typography>
                </Box>
              </Box>
              {chunk ? (
                <DiffView
                  data={{
                    oldFile: { fileName: file.path },
                    newFile: { fileName: file.path },
                    hunks: [chunk],
                  }}
                  diffViewMode={mode === "split" ? DiffModeEnum.Split : DiffModeEnum.Unified}
                  diffViewHighlight
                  diffViewFontSize={13}
                />
              ) : (
                <Typography color="text.secondary" sx={{ p: 2.5 }}>
                  Binary file not shown.
                </Typography>
              )}
            </Card>
          );
        })}
      </Box>
    </Container>
  );
};

export default CommitPage;
