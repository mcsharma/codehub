import { useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router";
import { graphql, useFragment } from "react-relay";
import type { AppNavBar_user$key } from "./__generated__/AppNavBar_user.graphql";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ButtonBase from "@mui/material/ButtonBase";
import UserAvatar from "./UserAvatar";

interface AppNavBarProps {
  currentUser: AppNavBar_user$key | null;
  onLogout: () => void;
}

// Nav items with no destination yet — visible so the chrome matches the
// mocks, but not wired up (no Dashboard/Explore/Documentation surface
// exists yet).
const InertNavLink = ({ label }: { label: string }) => (
  <Typography
    component="span"
    sx={{
      px: 1.5,
      py: 0.75,
      borderRadius: 2,
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "text.secondary",
      cursor: "default",
    }}
  >
    {label}
  </Typography>
);

const AppNavBar = ({ currentUser: currentUserRef, onLogout }: AppNavBarProps) => {
  const currentUser = useFragment(
    graphql`
      fragment AppNavBar_user on User {
        username
        first_name
      }
    `,
    currentUserRef
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 4 }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            textDecoration: "none",
            color: "text.primary",
            fontWeight: 700,
            fontSize: "1.125rem",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4V12M12 12L7 7M12 12L17 7M12 12V20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          CodeHub
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
          <InertNavLink label="Dashboard" />
          {currentUser && (
            <Button
              component={Link}
              to={`/${currentUser.username}`}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "text.primary",
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              Repositories
            </Button>
          )}
          <InertNavLink label="Explore" />
          <InertNavLink label="Documentation" />
        </Box>

        {currentUser ? (
          <>
            <ButtonBase
              onClick={handleAvatarClick}
              sx={{ borderRadius: "50%" }}
              aria-label="Account menu"
            >
              <UserAvatar />
            </ButtonBase>
            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
              <Typography
                variant="caption"
                sx={{ display: "block", px: 2, py: 1, color: "text.secondary" }}
              >
                Signed in as {currentUser.first_name ?? currentUser.username}
              </Typography>
              <Divider />
              <MenuItem
                component={Link}
                to={`/${currentUser.username}`}
                onClick={handleMenuClose}
              >
                <ListItemIcon>
                  <FolderOutlinedIcon fontSize="small" />
                </ListItemIcon>
                My Repositories
              </MenuItem>
              <MenuItem component={Link} to="/settings/tokens" onClick={handleMenuClose}>
                <ListItemIcon>
                  <KeyOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Personal Access Tokens
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onLogout();
                }}
              >
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="contained" component="a" href="/auth/google">
            Login with Google
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppNavBar;
