import { graphql, useLazyLoadQuery } from "react-relay";
import type { AppQuery } from "@ch/__generated__/AppQuery.graphql.ts";

const App = () => {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          id
          data
          organization {
            id
            data
          }
        }
      }
    `,
    { id: "1" }
  );

  const user = data.user;
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>CodeHub</h1>
      <p>
        {user ? (
          <>
            User: id={user.id} data={user.data ?? "{}"}
            {user.organization && (
              <> · Organization: id={user.organization.id} data={user.organization.data ?? "{}"}</>
            )}
          </>
        ) : (
          "No user found for id=1"
        )}
      </p>
    </div>
  );
};

export default App;
