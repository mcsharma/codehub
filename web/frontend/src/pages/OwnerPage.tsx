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
        owner_by_name(name: $name) {
          __typename
          ... on User {
            ...UserPage_user
          }
          ... on Organization {
            ...OrgPage_org
          }
        }
      }
    `,
    ownerQueryRef
  );

  const owner = data.owner_by_name;

  if (!owner) {
    return <div>&quot;{ownerQueryRef.variables.name}&quot; not found.</div>;
  }

  if (owner.__typename === "User") {
    return <UserPage user={owner} />;
  }

  if (owner.__typename === "Organization") {
    return <OrgPage org={owner} />;
  }

  return <div>&quot;{ownerQueryRef.variables.name}&quot; is not a user or organization.</div>;
};

export default OwnerPage;
