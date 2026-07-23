import { useState } from "react";
import { graphql, usePreloadedQuery, useMutation } from "react-relay";
import { useLoaderData, useNavigate } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { NewRepoPageQuery } from "./__generated__/NewRepoPageQuery.graphql";
import type { NewRepoPageCreateMutation } from "./__generated__/NewRepoPageCreateMutation.graphql";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

export type { NewRepoPageQuery };

const NewRepoPage = () => {
  const navigate = useNavigate();
  const { newRepoQueryRef } = useLoaderData() as {
    newRepoQueryRef: PreloadedQuery<NewRepoPageQuery>;
  };

  const data = usePreloadedQuery<NewRepoPageQuery>(
    graphql`
      query NewRepoPageQuery {
        current_user {
          username
        }
      }
    `,
    newRepoQueryRef
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [error, setError] = useState<string | null>(null);

  const [commitCreate, isCreating] = useMutation<NewRepoPageCreateMutation>(graphql`
    mutation NewRepoPageCreateMutation($name: String!, $description: String, $visibility: RepositoryVisibility!) {
      create_repository(name: $name, description: $description, visibility: $visibility) {
        name
      }
    }
  `);

  if (!data.current_user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">You need to be logged in to create a repository.</Alert>
      </Container>
    );
  }
  const username = data.current_user.username;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    commitCreate({
      variables: { name, description: description || null, visibility },
      onCompleted: (response) => {
        if (response.create_repository) {
          navigate(`/${username}/${response.create_repository.name}`);
        }
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create a new repository
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          A repository contains all your project files and revision history.
        </Typography>
      </Box>

      <Card sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Repository Name *</Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
              placeholder="my-awesome-project"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                        {username} /
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, fontWeight: 700, textTransform: "uppercase" }}
            >
              Great repository names are short and memorable.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Description <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>(optional)</Typography>
            </Typography>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="A brief description of your project..."
            />
          </Box>

          <Box sx={{ pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Visibility</Typography>
            <RadioGroup
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}
            >
              {(
                [
                  { value: "PUBLIC", label: "Public", helper: "Anyone on the internet can see this repository." },
                  { value: "PRIVATE", label: "Private", helper: "Only you and people you choose can see this." },
                ] as const
              ).map((option) => (
                <Card
                  key={option.value}
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderColor: visibility === option.value ? "primary.main" : "divider",
                    borderWidth: 2,
                    bgcolor: visibility === option.value ? "#eff6ff" : "transparent",
                  }}
                  onClick={() => setVisibility(option.value)}
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
          </Box>

          <Box sx={{ pt: 3, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => navigate(-1)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating || !name} size="large">
              {isCreating ? "Creating…" : "Create Repository"}
            </Button>
          </Box>
        </Box>
      </Card>

      <Card sx={{ mt: 4, p: 3, display: "flex", gap: 2, bgcolor: "grey.50" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <LightbulbOutlinedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Pro Tip</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            You can initialize this repository with a README or an .hgignore file later using our CLI once it&apos;s created.
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default NewRepoPage;
