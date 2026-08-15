import React from "react";
import { createBrowserRouter } from "react-router";
import { loadQuery } from "react-relay";
import { useLoaderData } from "react-router";
import { RelayEnv } from "./RelayEnvironment";
import { RootLayout } from "./App";
import type { AppRootLayoutQuery } from "./__generated__/AppRootLayoutQuery.graphql";
import type { PreloadedQuery } from "react-relay";
import LoginPage from "./pages/LoginPage";

// -- Import compiled query artifacts for use in loaders --
// These are tiny generated modules, so they stay in the main bundle.
import AppRootLayoutQueryNode from "./__generated__/AppRootLayoutQuery.graphql";
import BooksListPageQueryNode from "./pages/__generated__/BooksListPageQuery.graphql";
import BookPageQueryNode from "./pages/__generated__/BookPageQuery.graphql";
import NewBookPageQueryNode from "./pages/__generated__/NewBookPageQuery.graphql";
import FavoritesPageQueryNode from "./pages/__generated__/FavoritesPageQuery.graphql";
import TokensPageQueryNode from "./pages/__generated__/TokensPageQuery.graphql";

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
 * Timeline for a navigation to e.g. /books/3:
 *   Route matches
 *     ├── loader() fires → loadQuery() starts GraphQL fetch
 *     └── lazy() fires → starts loading BookPage.tsx JS
 *          └── both ready → usePreloadedQuery() returns data → render
 */
export const router = createBrowserRouter([
  {
    // No nav chrome — rendered outside the layout route below, same as
    // every other "standalone screen" would be.
    path: "/login",
    Component: LoginPage,
  },
  {
    // Pathless layout route: renders the shared nav chrome for every path
    // below without itself claiming a path.
    loader: () => ({
      rootLayoutQueryRef: loadQuery(RelayEnv, AppRootLayoutQueryNode, {}),
    }),
    Component: RootLayoutRoute,
    children: [
      {
        path: "/",
        Component: React.lazy(() => import("./pages/BooksListPage")),
        loader: () => ({
          booksQueryRef: loadQuery(RelayEnv, BooksListPageQueryNode, {}),
        }),
      },
      {
        // Static path — React Router ranks static segments above dynamic
        // params, so this always wins over the ":id" route below on an
        // exact match, regardless of declaration order.
        path: "books/new",
        Component: React.lazy(() => import("./pages/NewBookPage")),
        loader: () => ({
          newBookQueryRef: loadQuery(RelayEnv, NewBookPageQueryNode, {}),
        }),
      },
      {
        path: "books/:id",
        Component: React.lazy(() => import("./pages/BookPage")),
        loader: ({ params }) => ({
          bookQueryRef: loadQuery(RelayEnv, BookPageQueryNode, {
            id: params.id!,
          }),
        }),
      },
      {
        path: "favorites",
        Component: React.lazy(() => import("./pages/FavoritesPage")),
        loader: () => ({
          favoritesQueryRef: loadQuery(RelayEnv, FavoritesPageQueryNode, {}),
        }),
      },
      {
        path: "settings/tokens",
        Component: React.lazy(() => import("./pages/TokensPage")),
        loader: () => ({
          tokensQueryRef: loadQuery(RelayEnv, TokensPageQueryNode, {}),
        }),
      },
    ],
  },
]);
