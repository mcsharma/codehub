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
          bookmarks {
            name
            short_node
          }
          commits(first: 20) {
            edges {
              node {
                short_node
                description
                author
                date
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
  const bookmarks = repository.bookmarks ?? [];
  const commits = repository.commits?.edges ?? [];
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

      <h2>Bookmarks</h2>
      {bookmarks.length > 0 ? (
        <ul>
          {bookmarks.map((bookmark) => (
            <li key={bookmark.name}>
              {bookmark.name} ({bookmark.short_node})
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookmarks.</p>
      )}

      <h2>Commits</h2>
      {commits.length > 0 ? (
        <ul>
          {commits.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            const commit = edge.node;
            return (
              <li key={commit.short_node}>
                <code>{commit.short_node}</code> {commit.description} —{" "}
                {commit.author},{" "}
                {commit.date
                  ? new Date(commit.date * 1000).toLocaleString()
                  : "unknown date"}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No commits.</p>
      )}
    </div>
  );
};

export default RepoPage;
