import { graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData } from "react-router";
import type { OwnerPageQuery } from "./__generated__/OwnerPageQuery.graphql";
import type { PreloadedQuery } from "react-relay";
import UserPage from "./UserPage";
import OrgPage from "./OrgPage";

/**
 * Resolver page for /:name — the loader already started fetching via loadQuery().
 * This component consumes the preloaded result to determine user vs org,
 * then renders the appropriate page.
 */
const OwnerPage = () => {
  const { ownerQueryRef } = useLoaderData() as {
    ownerQueryRef: PreloadedQuery<OwnerPageQuery>;
  };

  const data = usePreloadedQuery<OwnerPageQuery>(
    graphql`
      query OwnerPageQuery($name: String!) {
        user_by_username(username: $name) {
          id
        }
        organization_by_name(name: $name) {
          id
        }
      }
    `,
    ownerQueryRef
  );

  if (data.user_by_username) {
    return <UserPage />;
  }

  if (data.organization_by_name) {
    return <OrgPage />;
  }

  return <div>&quot;{ownerQueryRef.variables.name}&quot; is not a user or organization.</div>;
};

export default OwnerPage;
