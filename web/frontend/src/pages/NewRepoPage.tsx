import { useState } from "react";
import { graphql, usePreloadedQuery, useMutation } from "react-relay";
import { useLoaderData, useNavigate } from "react-router";
import type { PreloadedQuery } from "react-relay";
import type { NewRepoPageQuery } from "./__generated__/NewRepoPageQuery.graphql";
import type { NewRepoPageCreateMutation } from "./__generated__/NewRepoPageCreateMutation.graphql";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

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
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [error, setError] = useState<string | null>(null);

  const [commitCreate, isCreating] = useMutation<NewRepoPageCreateMutation>(graphql`
    mutation NewRepoPageCreateMutation($name: String!, $visibility: RepositoryVisibility!) {
      create_repository(name: $name, visibility: $visibility) {
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
      variables: { name, visibility },
      onCompleted: (response) => {
        if (response.create_repository) {
          navigate(`/${username}/${response.create_repository.name}`);
        }
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f0f6fc", mb: 3 }}>
        New repository
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Repository name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          autoFocus
        />
        <RadioGroup
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
        >
          <FormControlLabel value="PUBLIC" control={<Radio />} label="Public" />
          <FormControlLabel value="PRIVATE" control={<Radio />} label="Private" />
        </RadioGroup>
        <Button type="submit" variant="contained" disabled={isCreating || !name} sx={{ alignSelf: "flex-start" }}>
          {isCreating ? "Creating…" : "Create repository"}
        </Button>
      </Box>
    </Container>
  );
};

export default NewRepoPage;
