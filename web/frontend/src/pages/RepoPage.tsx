import { graphql, usePreloadedQuery } from "react-relay";
import { Link, useLoaderData } from "react-router";
import type { RepoPageQuery } from "./__generated__/RepoPageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

const RepoPage = () => {
  const { repoQueryRef } = useLoaderData() as {
    repoQueryRef: PreloadedQuery<RepoPageQuery>;
  };

  const data = usePreloadedQuery<RepoPageQuery>(
    graphql`
      query RepoPageQuery($owner_username: String!, $name: String!) {
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
              first_name
              last_name
            }
            ... on Organization {
              name
            }
          }
          admins(first: 20) {
            edges {
              node {
                id
                username
                first_name
                last_name
              }
            }
          }
        }
      }
    `,
    repoQueryRef
  );

  const repository = data.repository_by_owner_and_name;
  const { owner_username, name: repoName } = repoQueryRef.variables;

  if (!repository) {
    return (
      <div>
        Repository &quot;{owner_username}/{repoName}&quot; not found.
      </div>
    );
  }

  const admins = repository.admins?.edges ?? [];
  const ownerName =
    repository.owner?.__typename === "User"
      ? repository.owner.username
      : repository.owner?.__typename === "Organization"
        ? repository.owner.name
        : owner_username;

  return (
    <div>
      <h1>
        <Link to={`/${ownerName}`}>{ownerName}</Link> / {repository.name}
      </h1>
      <p>Visibility: {repository.visibility}</p>

      <h2>Admins</h2>
      {admins.length > 0 ? (
        <ul>
          {admins.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            return (
              <li key={edge.node.id}>
                <Link to={`/${edge.node.username}`}>
                  {edge.node.first_name} {edge.node.last_name} (@
                  {edge.node.username})
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No admins.</p>
      )}

    </div>
  );
};

export default RepoPage;
