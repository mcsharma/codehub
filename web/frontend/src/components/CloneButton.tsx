import { useState } from "react";
import type { MouseEvent } from "react";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

// The public hg host every repo is served from — see services/hg/ and
// web/bff/src/repos/hgweb-client.ts on the backend side.
const HG_HOST = "hg.greensnippet.com";

interface CloneButtonProps {
  ownerUsername: string;
  repoName: string;
}

const CloneButton = ({ ownerUsername, repoName }: CloneButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const open = Boolean(anchorEl);

  const cloneUrl = `https://${HG_HOST}/${ownerUsername}/${repoName}`;
  const cloneCommand = `hg clone ${cloneUrl}`;

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneCommand).then(() => setCopied(true));
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<TerminalOutlinedIcon fontSize="small" />}
        endIcon={<ExpandMoreOutlinedIcon fontSize="small" />}
        onClick={handleOpen}
      >
        Clone
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2.5, width: 380 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Clone this repository
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={cloneCommand}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true, sx: { fontFamily: "monospace", fontSize: "0.8125rem" } } }}
              onFocus={(e) => e.target.select()}
            />
            <Tooltip title={copied ? "Copied!" : "Copy"}>
              <IconButton onClick={handleCopy} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                <ContentCopyOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            When prompted for a password, use a{" "}
            <Box component="a" href="/settings/tokens" sx={{ color: "primary.main" }}>
              personal access token
            </Box>
            .
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

export default CloneButton;
