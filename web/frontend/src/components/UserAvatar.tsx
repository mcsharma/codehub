import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type { SxProps, Theme } from "@mui/material/styles";

interface UserAvatarProps {
  size?: number;
  sx?: SxProps<Theme>;
}

// No photo storage exists yet (Google profile pictures aren't persisted),
// so every avatar is this generic icon rather than a broken/missing image.
const UserAvatar = ({ size = 32, sx }: UserAvatarProps) => {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        color: "text.secondary",
        ...sx,
      }}
    >
      <AccountCircleIcon sx={{ width: "80%", height: "80%" }} />
    </Avatar>
  );
};

export default UserAvatar;
