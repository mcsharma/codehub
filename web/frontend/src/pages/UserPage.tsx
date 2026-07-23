import { graphql, useFragment } from "react-relay";
import { Link } from "react-router";
import type { UserPage_user$key } from "./__generated__/UserPage_user.graphql";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RepoCard from "../components/RepoCard";

interface Props {
  user: UserPage_user$key;
  isOwnProfile: boolean;
}

const UserPage = ({ user: userRef, isOwnProfile }: Props) => {
  const user = useFragment(
    graphql`
      fragment UserPage_user on User {
        username
        first_name
        owned_repositories(first: 50) {
          edges {
            node {
              id
              name
              description
              visibility
              updated_time
            }
          }
        }
        admin_of_organizations(first: 20) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    userRef
  );

  const repos = user.owned_repositories?.edges ?? [];
  const orgs = user.admin_of_organizations?.edges ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          justifyContent: "space-between",
          gap: 3,
          mb: 5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isOwnProfile ? "Repositories" : `${user.first_name ?? user.username}'s repositories`}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {isOwnProfile
              ? "Manage and organize your projects."
              : `@${user.username}`}
          </Typography>
        </Box>
        {isOwnProfile && (
          <Button
            variant="contained"
            component={Link}
            to="/new"
            startIcon={<AddOutlinedIcon />}
            size="medium"
          >
            Create Repository
          </Button>
        )}
      </Box>

      {repos.length > 0 ? (
        <Grid container spacing={3}>
          {repos.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            return (
              <Grid key={edge.node.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <RepoCard
                  ownerUsername={user.username ?? ""}
                  name={edge.node.name ?? ""}
                  description={edge.node.description ?? null}
                  visibility={edge.node.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
                  updatedTime={edge.node.updated_time ?? 0}
                />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography color="text.secondary">No repositories yet.</Typography>
      )}

      {orgs.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Organizations
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {orgs.map((edge) => {
              if (!edge?.node) {
                return null;
              }
              return (
                <Button key={edge.node.id} component={Link} to={`/${edge.node.name}`} variant="outlined">
                  {edge.node.name}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default UserPage;
