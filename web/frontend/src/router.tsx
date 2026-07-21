import React from "react";
import { createBrowserRouter } from "react-router";
import { loadQuery } from "react-relay";
import { useLoaderData } from "react-router";
import { RelayEnv } from "@ch/RelayEnvironment";
import { RootLayout, HomePage } from "@ch/App";
import type { AppHomePageQuery } from "./__generated__/AppHomePageQuery.graphql";
import type { PreloadedQuery } from "react-relay";

// -- Import compiled query artifacts for use in loaders --
// These are tiny generated modules, so they stay in the main bundle.
import AppHomePageQueryNode from "./__generated__/AppHomePageQuery.graphql";
import OwnerPageQueryNode from "./pages/__generated__/OwnerPageQuery.graphql";
import RepoPageQueryNode from "./pages/__generated__/RepoPageQuery.graphql";

/**
 * Thin wrapper for the home route — reads the preloaded query ref from the
 * loader and passes it down to HomePage, matching the same preloaded-query
 * pattern used by all other page routes.
 */
const HomePageRoute = () => {
  const { homeQueryRef } = useLoaderData() as {
    homeQueryRef: PreloadedQuery<AppHomePageQuery>;
  };
  return <HomePage homeQueryRef={homeQueryRef} />;
};

/**
 * Router with loaders that call loadQuery() at route-match time.
 *
 * Timeline for a navigation to e.g. /alice/my-app:
 *   Route matches
 *     ├── loader() fires → loadQuery() starts GraphQL fetch
 *     └── lazy() fires → starts loading RepoPage.tsx JS
 *          └── both ready → usePreloadedQuery() returns data → render
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        loader: () => ({
          homeQueryRef: loadQuery(RelayEnv, AppHomePageQueryNode, {}),
        }),
        Component: HomePageRoute,
      },
      {
        path: ":name",
        Component: React.lazy(() => import("./pages/OwnerPage")),
        loader: ({ params }) => ({
          ownerQueryRef: loadQuery(RelayEnv, OwnerPageQueryNode, {
            name: params.name!,
          }),
        }),
      },
      {
        path: ":owner/:repo",
        Component: React.lazy(() => import("./pages/RepoPage")),
        loader: ({ params }) => ({
          repoQueryRef: loadQuery(RelayEnv, RepoPageQueryNode, {
            owner_username: params.owner!,
            name: params.repo!,
          }),
        }),
      },
    ],
  },
]);
