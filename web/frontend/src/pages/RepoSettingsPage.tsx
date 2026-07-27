import { graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData } from "react-router";
import type { RepoSettingsPageQuery } from "./__generated__/RepoSettingsPageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

import RepoHeader from "../components/RepoHeader";
import RepoSettingsPanel from "./RepoSettingsPanel";

const RepoSettingsPage = () => {
  const { repoSettingsQueryRef } = useLoaderData() as {
    repoSettingsQueryRef: PreloadedQuery<RepoSettingsPageQuery>;
  };

  const data = usePreloadedQuery<RepoSettingsPageQuery>(
    graphql`
      query RepoSettingsPageQuery($owner_username: String!, $name: String!) {
        current_user {
          username
        }
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          id
          name
          visibility
          owner {
            __typename
            ... on User {
              username
            }
            ... on Organization {
              name
            }
          }
        }
      }
    `,
    repoSettingsQueryRef
  );

  const repository = data.repository_by_owner_and_name;
  const { owner_username, name: repoName } = repoSettingsQueryRef.variables;

  if (!repository) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <p className="text-muted-foreground">
          Repository &quot;{owner_username}/{repoName}&quot; not found.
        </p>
      </div>
    );
  }

  const ownerName: string =
    (repository.owner?.__typename === "User"
      ? repository.owner.username
      : repository.owner?.__typename === "Organization"
        ? repository.owner.name
        : null) ?? owner_username;

  const isOwner = data.current_user?.username === ownerName;

  if (!isOwner) {
    return (
      <div>
        <RepoHeader
          ownerUsername={ownerName}
          repoName={repository.name ?? repoName}
          visibility={repository.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
          isOwner={false}
        />
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <p className="text-muted-foreground">You don&apos;t have access to this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RepoHeader
        ownerUsername={ownerName}
        repoName={repository.name ?? repoName}
        visibility={repository.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
        isOwner={isOwner}
      />
      <div className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <RepoSettingsPanel
            repositoryId={repository.id ?? ""}
            ownerUsername={ownerName}
            repoName={repository.name ?? repoName}
            visibility={repository.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
          />
        </div>
      </div>
    </div>
  );
};

export default RepoSettingsPage;
