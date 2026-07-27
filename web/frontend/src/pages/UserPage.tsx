import { graphql, useFragment } from "react-relay";
import { Link } from "react-router";
import type { UserPage_user$key } from "./__generated__/UserPage_user.graphql";

import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
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
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-[2.125rem] font-bold">
            {isOwnProfile ? "Repositories" : `${user.first_name ?? user.username}'s repositories`}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isOwnProfile
              ? "Manage and organize your projects."
              : `@${user.username}`}
          </p>
        </div>
        {isOwnProfile && (
          <Button render={<Link to="/new" />}>
            <Plus className="size-4" />
            Create Repository
          </Button>
        )}
      </div>

      {repos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {repos.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            return (
              <RepoCard
                key={edge.node.id}
                ownerUsername={user.username ?? ""}
                name={edge.node.name ?? ""}
                description={edge.node.description ?? null}
                visibility={edge.node.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
                updatedTime={edge.node.updated_time ?? 0}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">No repositories yet.</p>
      )}

      {orgs.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Organizations</h2>
          <div className="flex flex-wrap gap-2">
            {orgs.map((edge) => {
              if (!edge?.node) {
                return null;
              }
              return (
                <Button key={edge.node.id} variant="outline" render={<Link to={`/${edge.node.name}`} />}>
                  {edge.node.name}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
