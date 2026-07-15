import { graphql, useLazyLoadQuery } from "react-relay";
import type { AppQuery } from "@ch/__generated__/AppQuery.graphql.ts";

const App = () => {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          id
          data
          admin_of_organizations {
            edges {
              node {
                id
                name
                data
              }
            }
          }
        }
      }
    `,
    { id: "1" }
  );

  const user = data.user;
  const adminOrgs = user?.admin_of_organizations?.edges ?? [];

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>CodeHub</h1>
      {user ? (
        <div>
          <p>
            <strong>User:</strong> id={user.id} data={user.data ?? "{}"}
          </p>
          <h3>Administered Organizations:</h3>
          {adminOrgs.length > 0 ? (
            <ul>
              {adminOrgs.map((edge) => {
                if (!edge?.node) {
                  return null;
                }
                return (
                  <li key={edge.node.id}>
                    <strong>{edge.node.name}</strong> (id={edge.node.id}) · {edge.node.data ?? "{}"}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      ) : (
        <p>No user found for id=1</p>
      )}
    </div>
  );
};

export default App;
