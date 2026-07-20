import { Suspense } from "react";
import { graphql, usePreloadedQuery } from "react-relay";
import { Link, Outlet } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { AppHomePageQuery } from "./__generated__/AppHomePageQuery.graphql";

import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import MuiLink from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export type { AppHomePageQuery };

interface HomePageProps {
  homeQueryRef: PreloadedQuery<AppHomePageQuery>;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#58a6ff",
    },
    background: {
      default: "#0d1117",
      paper: "#161b22",
    },
    text: {
      primary: "#c9d1d9",
      secondary: "#8b949e",
    },
    divider: "#30363d",
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: "bold",
          borderRadius: "6px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #30363d",
          borderRadius: "8px",
          backgroundImage: "none",
        },
      },
    },
  },
});

const HomePage = ({ homeQueryRef }: HomePageProps) => {
  const data = usePreloadedQuery<AppHomePageQuery>(
    graphql`
      query AppHomePageQuery {
        github_viewer {
          login
          name
          avatar_url
          html_url
        }
        github_repositories {
          name
          full_name
          private
          html_url
          description
          default_branch
        }
      }
    `,
    homeQueryRef
  );

  const viewer = data.github_viewer;
  const repos = data.github_repositories ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* GitHub connection section */}
      <Box>
        {viewer ? (
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {viewer.avatar_url && (
                <Avatar
                  src={viewer.avatar_url}
                  alt={viewer.login ?? undefined}
                  sx={{ width: 56, height: 56, border: "2px solid #58a6ff" }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <MuiLink
                  href={viewer.html_url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  variant="h6"
                  underline="hover"
                  sx={{ fontWeight: "bold", color: "#f0f6fc" }}
                >
                  {viewer.name ?? viewer.login}
                </MuiLink>
                <Typography variant="body2" color="text.secondary">
                  @{viewer.login}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                href="/auth/github/disconnect"
                sx={{
                  borderColor: "#30363d",
                  color: "#f0f6fc",
                  "&:hover": { borderColor: "#8b949e", bgcolor: "#30363d" },
                }}
              >
                Disconnect
              </Button>
            </Box>
          </Card>
        ) : (
          <Card
            variant="outlined"
            sx={{
              p: 4,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <GitHubIcon sx={{ fontSize: 48, mb: 2, color: "#f0f6fc" }} />
            <Typography variant="h5" sx={{ mb: 1, color: "#f0f6fc", fontWeight: "bold" }}>
              Connect your GitHub Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: "450px" }}>
              Connect CodeHub with GitHub to view your repositories, explore commits, and perform code pushes.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/auth/github"
              startIcon={<GitHubIcon />}
              sx={{
                background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(59, 130, 246, 0.6)",
                },
              }}
            >
              Connect GitHub
            </Button>
          </Card>
        )}
      </Box>

      {/* GitHub repositories */}
      {viewer && (
        <>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#f0f6fc",
              borderBottom: "1px solid #30363d",
              pb: 1,
              mt: 1,
            }}
          >
            Your Repositories
          </Typography>
          {repos.length > 0 ? (
            <Stack spacing={2}>
              {repos.map((repo) => {
                if (!repo || !repo.full_name) {
                  return null;
                }
                const [owner, repoName] = repo.full_name.split("/");
                return (
                  <Card
                    key={repo.full_name}
                    variant="outlined"
                    sx={{
                      transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: "#58a6ff",
                        boxShadow: "0 4px 12px rgba(88, 166, 255, 0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <MuiLink
                          component={Link as any}
                          to={`/github/${owner}/${repoName}`}
                          sx={{
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            color: "#58a6ff",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {repo.full_name}
                        </MuiLink>
                        <Box
                          sx={{
                            fontSize: "0.75rem",
                            px: 1,
                            py: 0.25,
                            borderRadius: "10px",
                            border: `1px solid ${repo.private ? "#d29922" : "#30363d"}`,
                            color: repo.private ? "#d29922" : "#8b949e",
                            bgcolor: repo.private ? "rgba(210, 153, 34, 0.1)" : "rgba(139, 148, 158, 0.1)",
                            fontWeight: "bold",
                          }}
                        >
                          {repo.private ? "private" : "public"}
                        </Box>
                      </Box>
                      {repo.description && (
                        <Typography variant="body2" color="text.secondary">
                          {repo.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No repositories found.
            </Typography>
          )}
        </>
      )}
    </Container>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
        <AppBar
          position="sticky"
          sx={{
            bgcolor: "rgba(13, 17, 23, 0.75)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #30363d",
            backgroundImage: "none",
          }}
          elevation={0}
        >
          <Toolbar>
            <MuiLink
              component={Link as any}
              to="/"
              sx={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
              }}
            >
              CodeHub
            </MuiLink>
          </Toolbar>
        </AppBar>
        <Suspense fallback={<Container sx={{ mt: 4 }}><Typography color="text.secondary">Loading...</Typography></Container>}>
          <Outlet />
        </Suspense>
      </Box>
    </ThemeProvider>
  );
};

export { RootLayout, HomePage };
