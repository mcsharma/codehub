import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { useNavigate, useRevalidator } from "react-router";
import type { RepoSettingsPanelUpdateVisibilityMutation } from "./__generated__/RepoSettingsPanelUpdateVisibilityMutation.graphql";
import type { RepoSettingsPanelDeleteMutation } from "./__generated__/RepoSettingsPanelDeleteMutation.graphql";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

interface RepoSettingsPanelProps {
  repositoryId: string;
  ownerUsername: string;
  repoName: string;
  visibility: "PUBLIC" | "PRIVATE";
}

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public", helper: "Anyone on the internet can see this repository." },
  { value: "PRIVATE", label: "Private", helper: "Only you and people you choose can see this." },
] as const;

const RepoSettingsPanel = ({ repositoryId, ownerUsername, repoName, visibility }: RepoSettingsPanelProps) => {
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [selectedVisibility, setSelectedVisibility] = useState<"PUBLIC" | "PRIVATE">(visibility);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const [commitUpdateVisibility, isSavingVisibility] = useMutation<RepoSettingsPanelUpdateVisibilityMutation>(graphql`
    mutation RepoSettingsPanelUpdateVisibilityMutation($id: ID!, $visibility: RepositoryVisibility!) {
      update_repository_visibility(id: $id, visibility: $visibility) {
        id
        visibility
      }
    }
  `);

  const [commitDelete, isDeleting] = useMutation<RepoSettingsPanelDeleteMutation>(graphql`
    mutation RepoSettingsPanelDeleteMutation($id: ID!) {
      delete_repository(id: $id)
    }
  `);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSaveVisibility = () => {
    setVisibilityError(null);
    commitUpdateVisibility({
      variables: { id: repositoryId, visibility: selectedVisibility },
      onCompleted: () => {
        revalidator.revalidate();
      },
      onError: (err) => setVisibilityError(err.message),
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConfirmText("");
    setDeleteError(null);
  };

  const handleDelete = () => {
    setDeleteError(null);
    commitDelete({
      variables: { id: repositoryId },
      onCompleted: () => {
        navigate(`/${ownerUsername}`);
      },
      onError: (err) => setDeleteError(err.message),
    });
  };

  return (
    <Box sx={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 4 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          General
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Control who can see this repository.
        </Typography>

        {visibilityError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {visibilityError}
          </Alert>
        )}

        <RadioGroup
          value={selectedVisibility}
          onChange={(e) => setSelectedVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <Card
              key={option.value}
              variant="outlined"
              sx={{
                p: 2,
                cursor: "pointer",
                borderColor: selectedVisibility === option.value ? "primary.main" : "divider",
                borderWidth: 2,
                bgcolor: selectedVisibility === option.value ? "#eff6ff" : "transparent",
              }}
              onClick={() => setSelectedVisibility(option.value)}
            >
              <FormControlLabel
                value={option.value}
                control={<Radio />}
                sx={{ alignItems: "flex-start", m: 0 }}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{option.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.helper}
                    </Typography>
                  </Box>
                }
              />
            </Card>
          ))}
        </RadioGroup>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={selectedVisibility === visibility || isSavingVisibility}
            onClick={handleSaveVisibility}
          >
            {isSavingVisibility ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Card>

      <Card sx={{ p: 4, border: "1px solid", borderColor: "error.main" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "error.main" }}>
          Danger Zone
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mt: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Delete this repository</Typography>
            <Typography variant="body2" color="text.secondary">
              Once deleted, this repository and its history are gone for good. There is no undo.
            </Typography>
          </Box>
          <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} sx={{ flexShrink: 0 }}>
            Delete
          </Button>
        </Box>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
          <WarningAmberOutlinedIcon fontSize="small" /> Delete {ownerUsername}/{repoName}
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Alert severity="warning" sx={{ mb: 2 }}>
            This permanently deletes the repository, including all commits. This cannot be undone.
          </Alert>
          <Typography sx={{ mb: 1 }}>
            Type <strong>{repoName}</strong> to confirm.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={repoName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={confirmText !== repoName || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting…" : "Delete this repository"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RepoSettingsPanel;
