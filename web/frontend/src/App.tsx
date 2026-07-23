import { Suspense } from "react";
import { graphql, usePreloadedQuery, useMutation } from "react-relay";
import { Outlet } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { AppRootLayoutQuery } from "./__generated__/AppRootLayoutQuery.graphql";
import type { AppLogoutMutation } from "./__generated__/AppLogoutMutation.graphql";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppNavBar from "./components/AppNavBar";

export type { AppRootLayoutQuery };

interface RootLayoutProps {
  rootLayoutQueryRef: PreloadedQuery<AppRootLayoutQuery>;
}

// The shared chrome (nav bar) for every authenticated-or-public page except
// the login screen (which has no nav at all, per the mock — see
// LoginPage.tsx, rendered outside this layout by the router).
const RootLayout = ({ rootLayoutQueryRef }: RootLayoutProps) => {
  const data = usePreloadedQuery<AppRootLayoutQuery>(
    graphql`
      query AppRootLayoutQuery {
        current_user {
          ...AppNavBar_user
        }
      }
    `,
    rootLayoutQueryRef
  );

  const [commitLogout] = useMutation<AppLogoutMutation>(graphql`
    mutation AppLogoutMutation {
      logout
    }
  `);

  const handleLogout = () => {
    commitLogout({
      variables: {},
      onCompleted: () => window.location.assign("/"),
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppNavBar currentUser={data.current_user ?? null} onLogout={handleLogout} />
      <Suspense
        fallback={
          <Container sx={{ mt: 4 }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Container>
        }
      >
        <Outlet />
      </Suspense>
    </Box>
  );
};

export { RootLayout };
