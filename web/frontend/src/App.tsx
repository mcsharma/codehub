import { Suspense } from "react";
import { graphql, usePreloadedQuery } from "react-relay";
import { Link, Outlet } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { AppHomePageQuery } from "./__generated__/AppHomePageQuery.graphql";

import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import MuiLink from "@mui/material/Link";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
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
  usePreloadedQuery<AppHomePageQuery>(
    graphql`
      query AppHomePageQuery {
        noop
      }
    `,
    homeQueryRef
  );

  const seededUsers = [
    { username: "alice", first: "Alice", last: "Chen", bio: "Full-stack engineer", color: "#f9826c" },
    { username: "bob", first: "Bob", last: "Martinez", bio: "Backend specialist", color: "#6f42c1" },
    { username: "carol", first: "Carol", last: "Nguyen", bio: "DevOps & infra", color: "#2ea043" },
    { username: "dave", first: "Dave", last: "Kim", bio: "Frontend developer", color: "#005cc5" },
  ];

  const seededOrgs = [
    { name: "coder-co", desc: "The developer company" },
    { name: "open-source-collective", desc: "Community-driven open source projects" },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4, display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f0f6fc", mb: 1 }}>
          Welcome to CodeHub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore organizations, developers, and metadata repositories below.
        </Typography>
      </Box>

      {/* Users Section */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, borderBottom: "1px solid #30363d", pb: 1 }}>
          <GroupIcon sx={{ color: "primary.main" }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#f0f6fc" }}>
            Developers
          </Typography>
        </Box>
        <Stack spacing={2}>
          {seededUsers.map((u) => (
            <Card
              key={u.username}
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
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2 } }}>
                <Avatar sx={{ bgcolor: u.color, color: "#ffffff", fontWeight: "bold" }}>
                  {u.first[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <MuiLink
                    component={Link as any}
                    to={`/${u.username}`}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      color: "#58a6ff",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {u.first} {u.last}
                  </MuiLink>
                  <Typography variant="body2" color="text.secondary">
                    @{u.username} &bull; {u.bio}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Orgs Section */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, borderBottom: "1px solid #30363d", pb: 1 }}>
          <BusinessIcon sx={{ color: "primary.main" }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#f0f6fc" }}>
            Organizations
          </Typography>
        </Box>
        <Stack spacing={2}>
          {seededOrgs.map((o) => (
            <Card
              key={o.name}
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
                <MuiLink
                  component={Link as any}
                  to={`/${o.name}`}
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    color: "#58a6ff",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {o.name}
                </MuiLink>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {o.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
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
