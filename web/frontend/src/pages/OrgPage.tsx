import { graphql, useFragment } from "react-relay";
import { Link } from "react-router";
import type { OrgPage_org$key } from "./__generated__/OrgPage_org.graphql";

interface Props {
  org: OrgPage_org$key;
}

const OrgPage = ({ org: orgRef }: Props) => {
  const org = useFragment(
    graphql`
      fragment OrgPage_org on Organization {
        id
        name
        data
        repositories(first: 20) {
          edges {
            node {
              id
              name
              visibility
            }
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
    `,
    orgRef
  );

  const repos = org.repositories?.edges ?? [];
  const admins = org.admins?.edges ?? [];

  return (
    <div>
      <h1>{org.name}</h1>

      <h2>Repositories</h2>
      {repos.length > 0 ? (
        <ul>
          {repos.map((edge) => {
            if (!edge?.node) {
              return null;
            }
            return (
              <li key={edge.node.id}>
                <Link to={`/${org.name}/${edge.node.name}`}>
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

export default OrgPage;
