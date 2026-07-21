import { graphql, useFragment } from "react-relay";
import { Link } from "react-router";
import type { UserPage_user$key } from "./__generated__/UserPage_user.graphql";

interface Props {
  user: UserPage_user$key;
}

const UserPage = ({ user: userRef }: Props) => {
  const user = useFragment(
    graphql`
      fragment UserPage_user on User {
        id
        username
        first_name
        last_name
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
    `,
    userRef
  );

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
