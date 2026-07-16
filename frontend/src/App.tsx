import { Suspense } from "react";
import { Link, Outlet } from "react-router";

const HomePage = () => (
  <div>
    <h2>Users</h2>
    <ul>
      <li><Link to="/alice">alice</Link></li>
      <li><Link to="/bob">bob</Link></li>
      <li><Link to="/carol">carol</Link></li>
      <li><Link to="/dave">dave</Link></li>
    </ul>

    <h2>Organizations</h2>
    <ul>
      <li><Link to="/coder-co">coder-co</Link></li>
      <li><Link to="/open-source-collective">open-source-collective</Link></li>
    </ul>

    <h2>Repositories</h2>
    <ul>
      <li><Link to="/alice/my-app">alice/my-app</Link></li>
      <li><Link to="/alice/private-lib">alice/private-lib</Link></li>
      <li><Link to="/bob/dotfiles">bob/dotfiles</Link></li>
      <li><Link to="/coder-co/shared-platform">coder-co/shared-platform</Link></li>
      <li><Link to="/coder-co/design-system">coder-co/design-system</Link></li>
    </ul>
  </div>
);

/**
 * Root layout — renders the header and an <Outlet> for child routes.
 * With createBrowserRouter, the layout is a route with children, and
 * each child route renders inside the <Outlet>.
 */
const RootLayout = () => {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          CodeHub
        </Link>
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export { RootLayout, HomePage };
