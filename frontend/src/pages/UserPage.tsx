import { graphql, useLazyLoadQuery } from "react-relay";
import { Link, useParams } from "react-router";
import type { UserPageQuery } from "./__generated__/UserPageQuery.graphql";

const UserPage = () => {
  const { name } = useParams<{ name: string }>();

  const data = useLazyLoadQuery<UserPageQuery>(
    graphql`
      query UserPageQuery($username: String!) {
        user_by_username(username: $username) {
          id
          username
          first_name
          last_name
          data
          owned_repositories(first: 20) {
            edges {
              node {
                id
                name
                visibility
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
      }
    `,
    { username: name! }
  );

  const user = data.user_by_username;

  if (!user) {
    return <div>User &quot;{name}&quot; not found.</div>;
  }

  const repos = user.owned_repositories?.edges ?? [];
  const orgs = user.admin_of_organizations?.edges ?? [];

  return (
    <div>
      <h1>
        {user.first_name} {user.last_name}
      </h1>
      <p>@{user.username}</p>

      <h2>Repositories</h2>
      {repos.length > 0 ? (
        <ul>
          {repos.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            return (
              <li key={edge.node.id}>
                <Link to={`/${user.username}/${edge.node.name}`}>
                  {edge.node.name}
                </Link>{" "}
                ({edge.node.visibility})
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No repositories.</p>
      )}

      <h2>Organizations</h2>
      {orgs.length > 0 ? (
        <ul>
          {orgs.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            return (
              <li key={edge.node.id}>
                <Link to={`/${edge.node.name}`}>{edge.node.name}</Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No organizations.</p>
      )}
    </div>
  );
};

export default UserPage;
