import { graphql, usePaginationFragment } from "react-relay";
import { Link } from "react-router";
import type { RepoCommitsList_query$key } from "./__generated__/RepoCommitsList_query.graphql";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import UserAvatar from "../components/UserAvatar";
import { formatRelativeTime, formatCommitAuthor } from "../utils/formatters";

interface Props {
  query: RepoCommitsList_query$key;
  ownerUsername: string;
  repoName: string;
}

// Groups the (already tip-first) commit list into "Commits on <date>"
// sections, matching repoPage.html — a client-side grouping over data
// that's already in the right order, no extra fetching involved.
function formatDateHeading(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const RepoCommitsList = ({ query: queryRef, ownerUsername, repoName }: Props) => {
  // `Repository` doesn't implement Relay's `Node` interface (no type in this
  // schema does — see the note left for a future global-object-identification
  // pass), so @refetchable can't target a Repository-rooted fragment. Query
  // is one of the types @refetchable explicitly supports without Node, so
  // this re-resolves the owner/name path on every page instead — same net
  // effect, just rooted one level higher.
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    graphql`
      fragment RepoCommitsList_query on Query
      @refetchable(queryName: "RepoCommitsListPaginationQuery")
      @argumentDefinitions(
        owner_username: { type: "String!" }
        name: { type: "String!" }
        count: { type: "Int", defaultValue: 15 }
        cursor: { type: "ID" }
      ) {
        repository_by_owner_and_name(owner_username: $owner_username, name: $name) {
          commits(first: $count, after: $cursor) @connection(key: "RepoCommitsList_repository_commits") {
            edges {
              node {
                node
                short_node
                description
                author
                date
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const commits = data.repository_by_owner_and_name?.commits?.edges ?? [];

  if (commits.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4 }}>
        No commits yet.
      </Typography>
    );
  }

  const groups: { heading: string; commits: (typeof commits)[number][] }[] = [];
  for (const edge of commits) {
    if (!edge?.node) continue;
    const heading = formatDateHeading(edge.node.date ?? 0);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.heading === heading) {
      lastGroup.commits.push(edge);
    } else {
      groups.push({ heading, commits: [edge] });
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {groups.map((group) => (
        <Box key={group.heading}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", whiteSpace: "nowrap" }}
            >
              Commits on {group.heading}
            </Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
          </Box>
          <Card>
            {group.commits.map((edge, index) => {
              const commit = edge!.node!;
              return (
                <Box key={commit.node}>
                  {index > 0 && <Divider />}
                  <Box
                    component={Link}
                    to={`/${ownerUsername}/${repoName}/commit/${commit.node}`}
                    sx={{
                      p: 2.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "background.default" },
                    }}
                  >
                    <UserAvatar />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {commit.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            color: "primary.main",
                            bgcolor: "#eff6ff",
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                        >
                          {commit.short_node}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {formatCommitAuthor(commit.author ?? "")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(commit.date ?? 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Card>
        </Box>
      ))}

      {hasNext && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Button variant="outlined" disabled={isLoadingNext} onClick={() => loadNext(15)}>
            {isLoadingNext ? "Loading…" : "Load earlier commits"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RepoCommitsList;
