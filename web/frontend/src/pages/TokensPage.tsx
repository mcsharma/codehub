import { useState } from "react";
import { graphql, usePreloadedQuery, useMutation } from "react-relay";
import { useLoaderData, useRevalidator } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { TokensPageQuery } from "./__generated__/TokensPageQuery.graphql";
import type { TokensPageCreateMutation } from "./__generated__/TokensPageCreateMutation.graphql";
import type { TokensPageRevokeMutation } from "./__generated__/TokensPageRevokeMutation.graphql";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import StatusBadge from "../components/StatusBadge";

const SIDEBAR_ITEMS = ["Profile", "Account", "Emails", "Access Tokens", "SSH Keys", "Billing"];

const TokensPage = () => {
  const { tokensQueryRef } = useLoaderData() as {
    tokensQueryRef: PreloadedQuery<TokensPageQuery>;
  };
  const revalidator = useRevalidator();

  const data = usePreloadedQuery<TokensPageQuery>(
    graphql`
      query TokensPageQuery {
        my_personal_access_tokens {
          id
          label
          created_time
          last_used_time
        }
      }
    `,
    tokensQueryRef
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [commitCreate, isCreating] = useMutation<TokensPageCreateMutation>(graphql`
    mutation TokensPageCreateMutation($label: String!) {
      create_personal_access_token(label: $label) {
        token
      }
    }
  `);

  const [commitRevoke] = useMutation<TokensPageRevokeMutation>(graphql`
    mutation TokensPageRevokeMutation($id: ID!) {
      revoke_personal_access_token(id: $id)
    }
  `);

  const handleCreate = () => {
    setError(null);
    commitCreate({
      variables: { label },
      onCompleted: (response) => {
        if (response.create_personal_access_token) {
          setCreatedToken(response.create_personal_access_token.token ?? null);
        }
      },
      onError: (err) => setError(err.message),
    });
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setLabel("");
    setCreatedToken(null);
    setError(null);
    if (createdToken) {
      revalidator.revalidate();
    }
  };

  const handleRevoke = (id: string) => {
    commitRevoke({
      variables: { id },
      onCompleted: () => {
        revalidator.revalidate();
      },
    });
  };

  const tokens = data.my_personal_access_tokens ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 6 }}>
        <Box component="aside" sx={{ width: { lg: 260 }, flexShrink: 0 }}>
          <Typography
            variant="caption"
            sx={{ display: "block", px: 1.5, mb: 1.5, fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}
          >
            Account Settings
          </Typography>
          {SIDEBAR_ITEMS.map((item) => {
            const active = item === "Access Tokens";
            return (
              <Box
                key={item}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  fontSize: "0.875rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "primary.main" : "text.secondary",
                  bgcolor: active ? "background.paper" : "transparent",
                  border: active ? "1px solid" : "none",
                  borderColor: "divider",
                  cursor: active ? "default" : "default",
                }}
              >
                {item}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flex: 1, maxWidth: 720 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Personal Access Tokens
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Tokens you can use to authenticate with the CodeHub CLI or API.
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => setCreateDialogOpen(true)} sx={{ flexShrink: 0 }}>
              Generate Token
            </Button>
          </Box>

          <Card sx={{ p: 2.5, mb: 4, display: "flex", gap: 2, bgcolor: "#eff6ff", border: "none" }}>
            <InfoOutlinedIcon sx={{ color: "primary.main" }} />
            <Box>
              <Typography sx={{ fontWeight: 700, color: "primary.main" }}>Security Note</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "primary.main" }}>
                Treat these tokens like passwords. CodeHub will only show you the full token string once,
                immediately after generation.
              </Typography>
            </Box>
          </Card>

          <Card>
            {tokens.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                No tokens yet.
              </Typography>
            ) : (
              tokens.map((token, index) => (
                <Box key={token.id}>
                  {index > 0 && <Divider />}
                  <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{token.label}</Typography>
                        <StatusBadge
                          label={token.last_used_time ? "Active" : "Never used"}
                          tone={token.last_used_time ? "success" : "neutral"}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Created {new Date((token.created_time ?? 0) * 1000).toLocaleDateString()}
                        </Typography>
                        {token.last_used_time && (
                          <Typography variant="caption" color="text.secondary">
                            Last used {new Date(token.last_used_time * 1000).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small" disabled>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleRevoke(token.id ?? "")} color="error">
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Card>
        </Box>
      </Box>

      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {createdToken ? (
          <>
            <DialogTitle>Your new token</DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Copy this token now — you won&apos;t be able to see it again.
              </Alert>
              <TextField
                value={createdToken}
                fullWidth
                slotProps={{ input: { readOnly: true, sx: { fontFamily: "monospace" } } }}
                onFocus={(e) => e.target.select()}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleCloseDialog}>
                Done
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <KeyOutlinedIcon fontSize="small" /> Generate a new token
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                autoFocus
                label="Label"
                placeholder="e.g. MacBook Pro CLI"
                fullWidth
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                Cancel
              </Button>
              <Button variant="contained" disabled={!label || isCreating} onClick={handleCreate}>
                {isCreating ? "Generating…" : "Generate Token"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default TokensPage;
