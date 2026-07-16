/**
 * Router with loaders that call loadQuery() at route-match time.
 *
 * Timeline for a navigation to e.g. /alice/my-app:
 *   Route matches
 *     ├── loader() fires → loadQuery() starts GraphQL fetch
 *     └── lazy() fires → starts loading RepoPage.tsx JS
 *          └── both ready → usePreloadedQuery() returns data → render
 */
export declare const router: import("react-router").DataRouter;
