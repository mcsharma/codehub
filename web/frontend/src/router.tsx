import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { loadQuery, usePreloadedQuery, graphql } from "react-relay";
import { useLoaderData } from "react-router";
import { RelayEnv } from "./RelayEnvironment";
import { RootLayout } from "./App";
import type { AppRootLayoutQuery } from "./__generated__/AppRootLayoutQuery.graphql";
import type { routerHomeQuery } from "./__generated__/routerHomeQuery.graphql";
import type { PreloadedQuery } from "react-relay";
import LoginPage from "./pages/LoginPage";

// -- Import compiled query artifacts for use in loaders --
// These are tiny generated modules, so they stay in the main bundle.
import AppRootLayoutQueryNode from "./__generated__/AppRootLayoutQuery.graphql";
import routerHomeQueryNode from "./__generated__/routerHomeQuery.graphql";
import OwnerPageQueryNode from "./pages/__generated__/OwnerPageQuery.graphql";
import RepoPageQueryNode from "./pages/__generated__/RepoPageQuery.graphql";
import NewRepoPageQueryNode from "./pages/__generated__/NewRepoPageQuery.graphql";
import CommitPageQueryNode from "./pages/__generated__/CommitPageQuery.graphql";
import ReviewPageQueryNode from "./pages/__generated__/ReviewPageQuery.graphql";
import RepoReviewsPageQueryNode from "./pages/__generated__/RepoReviewsPageQuery.graphql";
import TokensPageQueryNode from "./pages/__generated__/TokensPageQuery.graphql";
import RepoSettingsPageQueryNode from "./pages/__generated__/RepoSettingsPageQuery.graphql";
import RepoCodeShellQueryNode from "./pages/__generated__/RepoCodeShellQuery.graphql";
import RepoTreePageQueryNode from "./pages/__generated__/RepoTreePageQuery.graphql";
import RepoBlobPageQueryNode from "./pages/__generated__/RepoBlobPageQuery.graphql";

/**
 * `/` itself — no nav chrome (see LoginPage.tsx). If already logged in,
 * redirect straight to the user's own repositories page; there's no
 * synchronous way to know auth state before this GraphQL round-trip since
 * the session cookie is httpOnly.
 */
const HomeRoute = () => {
  const { homeQueryRef } = useLoaderData() as {
    homeQueryRef: PreloadedQuery<routerHomeQuery>;
  };
  const data = usePreloadedQuery<routerHomeQuery>(
    graphql`
      query routerHomeQuery {
        current_user {
          username
        }
      }
    `,
    homeQueryRef
  );

  if (data.current_user) {
    return <Navigate to={`/${data.current_user.username}`} replace />;
  }
  return <LoginPage />;
};

/**
 * Thin wrapper for the pathless layout route — reads the preloaded query ref
 * from the loader and passes it down to RootLayout, matching the same
 * preloaded-query pattern used by all other page routes.
 */
const RootLayoutRoute = () => {
  const { rootLayoutQueryRef } = useLoaderData() as {
    rootLayoutQueryRef: PreloadedQuery<AppRootLayoutQuery>;
  };
  return <RootLayout rootLayoutQueryRef={rootLayoutQueryRef} />;
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
    // Owns "/" exclusively — the nav'd layout below never matches this path.
    path: "/",
    loader: () => ({
      homeQueryRef: loadQuery(RelayEnv, routerHomeQueryNode, {}),
    }),
    Component: HomeRoute,
  },
  {
    // Pathless layout route: renders the shared nav chrome for every path
    // below without itself claiming "/".
    loader: () => ({
      rootLayoutQueryRef: loadQuery(RelayEnv, AppRootLayoutQueryNode, {}),
    }),
    Component: RootLayoutRoute,
    children: [
      {
        // Static path — React Router ranks static segments above dynamic
        // params, so this always wins over the ":name" route below on an
        // exact match, regardless of declaration order. Makes "new" an
        // unusable username going forward, same as GitHub reserving words.
        path: "new",
        Component: React.lazy(() => import("./pages/NewRepoPage")),
        loader: () => ({
          newRepoQueryRef: loadQuery(RelayEnv, NewRepoPageQueryNode, {}),
        }),
      },
      {
        path: "settings/tokens",
        Component: React.lazy(() => import("./pages/TokensPage")),
        loader: () => ({
          tokensQueryRef: loadQuery(RelayEnv, TokensPageQueryNode, {}),
        }),
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
      {
        path: ":owner/:repo/commit/:node",
        Component: React.lazy(() => import("./pages/CommitPage")),
        loader: ({ params }) => ({
          commitQueryRef: loadQuery(RelayEnv, CommitPageQueryNode, {
            owner_username: params.owner!,
            name: params.repo!,
            node: params.node!,
          }),
        }),
      },
      {
        path: ":owner/:repo/reviews",
        Component: React.lazy(() => import("./pages/RepoReviewsPage")),
        loader: ({ params }) => ({
          repoReviewsQueryRef: loadQuery(RelayEnv, RepoReviewsPageQueryNode, {
            owner_username: params.owner!,
            name: params.repo!,
          }),
        }),
      },
      {
        path: ":owner/:repo/d/:number",
        Component: React.lazy(() => import("./pages/ReviewPage")),
        loader: ({ params }) => ({
          reviewQueryRef: loadQuery(RelayEnv, ReviewPageQueryNode, {
            owner_username: params.owner!,
            name: params.repo!,
            number: Number(params.number!),
          }),
        }),
      },
      {
        path: ":owner/:repo/settings",
        Component: React.lazy(() => import("./pages/RepoSettingsPage")),
        loader: ({ params }) => ({
          repoSettingsQueryRef: loadQuery(RelayEnv, RepoSettingsPageQueryNode, {
            owner_username: params.owner!,
            name: params.repo!,
          }),
        }),
      },
      {
        // Pathless layout shared by both Code-tab views (tree + blob):
        // renders the header and file-tree sidebar once via RepoCodeShell,
        // with <Outlet/> swapping in just the directory listing or file
        // content below. Keeps the sidebar mounted (and its fetch/expand
        // state intact) when switching between the two, instead of the
        // whole page unmounting and remounting — which is what caused a
        // visible flicker, especially in prod where the previous sibling
        // routes' separate JS chunks each had to be fetched over the
        // network on first switch.
        Component: React.lazy(() => import("./pages/RepoCodeShell")),
        loader: ({ params }) => ({
          repoCodeShellQueryRef: loadQuery(RelayEnv, RepoCodeShellQueryNode, {
            owner_username: params.owner!,
            name: params.repo!,
          }),
        }),
        // Only refetch the shell's repo metadata when the owner/repo
        // actually changes — not on every tree<->blob or rev/path
        // navigation within the same repo, which would otherwise
        // re-suspend the shell (and flicker the sidebar) on every switch.
        shouldRevalidate: ({ currentParams, nextParams }) =>
          currentParams.owner !== nextParams.owner ||
          currentParams.repo !== nextParams.repo,
        children: [
          {
            path: ":owner/:repo/tree/:rev/*",
            Component: React.lazy(() => import("./pages/RepoTreePage")),
            loader: ({ params }) => ({
              repoTreeQueryRef: loadQuery(RelayEnv, RepoTreePageQueryNode, {
                owner_username: params.owner!,
                name: params.repo!,
                rev: params.rev!,
                path: params["*"] ?? "",
              }),
            }),
          },
          {
            path: ":owner/:repo/blob/:rev/*",
            Component: React.lazy(() => import("./pages/RepoBlobPage")),
            loader: ({ params }) => ({
              repoBlobQueryRef: loadQuery(RelayEnv, RepoBlobPageQueryNode, {
                owner_username: params.owner!,
                name: params.repo!,
                rev: params.rev!,
                path: params["*"] ?? "",
              }),
            }),
          },
        ],
      },
    ],
  },
]);
