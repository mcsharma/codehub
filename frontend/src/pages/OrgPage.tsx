import { graphql, useLazyLoadQuery } from "react-relay";
import { Link, useParams } from "react-router";
import type { OrgPageQuery } from "./__generated__/OrgPageQuery.graphql";

const OrgPage = () => {
  const { name } = useParams<{ name: string }>();

  const data = useLazyLoadQuery<OrgPageQuery>(
    graphql`
      query OrgPageQuery($name: String!) {
        organization_by_name(name: $name) {
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
      }
    `,
    { name: name! }
  );

  const org = data.organization_by_name;

  if (!org) {
    return <div>Organization &quot;{name}&quot; not found.</div>;
  }

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
