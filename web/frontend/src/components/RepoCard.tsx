import { Link } from "react-router";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime } from "../utils/formatters";

interface RepoCardProps {
  ownerUsername: string;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  updatedTime: number;
}

const RepoCard = ({ ownerUsername, name, description, visibility, updatedTime }: RepoCardProps) => {
  return (
    <Card
      component={Link}
      to={`/${ownerUsername}/${name}`}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.15s, border-color 0.15s",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            bgcolor: "#eff6ff",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          {name.slice(0, 2).toUpperCase()}
        </Box>
        <StatusBadge
          label={visibility === "PUBLIC" ? "Public" : "Private"}
          tone={visibility === "PUBLIC" ? "neutral" : "primary"}
        />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
        {description ?? "No description provided."}
      </Typography>
      <Box
        sx={{
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
          Updated {formatRelativeTime(updatedTime)}
        </Typography>
      </Box>
    </Card>
  );
};

export default RepoCard;
