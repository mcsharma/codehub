import { Suspense } from "react";
import { graphql, usePreloadedQuery, useMutation } from "react-relay";
import { Link, Outlet } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { AppHomePageQuery } from "./__generated__/AppHomePageQuery.graphql";
import type { AppLogoutMutation } from "./__generated__/AppLogoutMutation.graphql";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MuiLink from "@mui/material/Link";
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
  const data = usePreloadedQuery<AppHomePageQuery>(
    graphql`
      query AppHomePageQuery {
        noop
        current_user {
          id
          username
          first_name
          last_name
        }
      }
    `,
    homeQueryRef
  );

  const [commitLogout, isLoggingOut] = useMutation<AppLogoutMutation>(graphql`
    mutation AppLogoutMutation {
      logout
    }
  `);

  const handleLogout = () => {
    commitLogout({
      variables: {},
      onCompleted: () => window.location.reload(),
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f0f6fc", mb: 1 }}>
            Welcome to CodeHub
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore organizations, developers, and metadata repositories below.
          </Typography>
        </Box>
        {data.current_user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <Typography color="text.secondary">
              Hi, {data.current_user.first_name ?? data.current_user.username}
            </Typography>
            <Button variant="outlined" disabled={isLoggingOut} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button variant="contained" component="a" href="/auth/google" sx={{ flexShrink: 0 }}>
            Login with Google
          </Button>
        )}
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
