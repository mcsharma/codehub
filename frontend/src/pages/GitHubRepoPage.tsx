import { graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData, Link } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { GitHubRepoPageQuery } from "./__generated__/GitHubRepoPageQuery.graphql";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MuiLink from "@mui/material/Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const GitHubRepoPage = () => {
  const { githubRepoQueryRef } = useLoaderData() as {
    githubRepoQueryRef: PreloadedQuery<GitHubRepoPageQuery>;
  };

  const data = usePreloadedQuery<GitHubRepoPageQuery>(
    graphql`
      query GitHubRepoPageQuery($owner: String!, $repo: String!) {
        github_commits(owner: $owner, repo: $repo) {
          sha
          message
          author_name
          author_date
          html_url
        }
      }
    `,
    githubRepoQueryRef
  );

  const { owner, repo } = githubRepoQueryRef.variables;
  const commits = data.github_commits ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Button
        component={Link as any}
        to="/"
        startIcon={<ArrowBackIcon />}
        color="inherit"
        sx={{
          alignSelf: "flex-start",
          color: "text.secondary",
          px: 0,
          minWidth: "auto",
          "&:hover": { color: "#58a6ff", bgcolor: "transparent" },
        }}
      >
        Back to Repositories
      </Button>

      <Box sx={{ borderBottom: "1px solid #30363d", pb: 2 }}>
        <MuiLink
          href={`https://github.com/${owner}/${repo}`}
          target="_blank"
          rel="noreferrer"
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#f0f6fc",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {owner}/{repo}
        </MuiLink>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          GitHub repository &bull; commits from default branch
        </Typography>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#f0f6fc", mt: 1 }}>
        Commits
      </Typography>

      {commits.length > 0 ? (
        <Stack spacing={1.5}>
          {commits.map((commit) => {
            if (!commit) {
              return null;
            }
            return (
              <Card
                key={commit.sha ?? commit.html_url}
                variant="outlined"
                sx={{
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: "#388bfd",
                    boxShadow: "0 4px 12px rgba(56, 139, 253, 0.1)",
                  },
                }}
              >
                <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start", "&:last-child": { pb: 2 } }}>
                  {commit.sha && (
                    <Button
                      component="a"
                      variant="outlined"
                      size="small"
                      href={commit.html_url ?? ""}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        px: 1,
                        py: 0.25,
                        minWidth: "auto",
                        color: "#58a6ff",
                        borderColor: "#30363d",
                        bgcolor: "#21262d",
                        "&:hover": { bgcolor: "#30363d", borderColor: "#8b949e" },
                      }}
                    >
                      {commit.sha.slice(0, 7)}
                    </Button>
                  )}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexGrow: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ color: "#c9d1d9", fontWeight: 500, lineHeight: 1.4 }}
                    >
                      {commit.message?.split("\n")[0]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {commit.author_name ? (
                        <>
                          by <strong>{commit.author_name}</strong>
                        </>
                      ) : (
                        "Unknown author"
                      )}
                      {commit.author_date && (
                        <>
                          {" "}
                          on {new Date(commit.author_date).toLocaleDateString()} at{" "}
                          {new Date(commit.author_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No commits found. Make sure you are connected to GitHub.
        </Typography>
      )}
    </Container>
  );
};

export default GitHubRepoPage;
