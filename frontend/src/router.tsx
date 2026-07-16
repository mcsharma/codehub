import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { loadQuery } from "react-relay";
import { RelayEnv } from "@ch/RelayEnvironment";
import { RootLayout, HomePage } from "@ch/App";

// -- Lazy-loaded page components (JS loads in parallel with data) --
const OwnerPage = lazy(() => import("./pages/OwnerPage"));
const RepoPage = lazy(() => import("./pages/RepoPage"));

// -- Import compiled query artifacts for use in loaders --
// These are tiny generated modules, so they stay in the main bundle.
import OwnerPageQueryNode from "./pages/__generated__/OwnerPageQuery.graphql";
import RepoPageQueryNode from "./pages/__generated__/RepoPageQuery.graphql";

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
        Component: HomePage,
      },
      {
        path: ":name",
        Component: OwnerPage,
        loader: ({ params }) => ({
          ownerQueryRef: loadQuery(RelayEnv, OwnerPageQueryNode, {
            name: params.name!,
          }),
        }),
      },
      {
        path: ":owner/:repo",
        Component: RepoPage,
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
