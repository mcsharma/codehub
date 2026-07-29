import { Link } from "react-router";
import { graphql, useFragment } from "react-relay";
import { CircleUserRound, FolderOpen, Key, LogOut } from "lucide-react";
import type { AppNavBar_user$key } from "./__generated__/AppNavBar_user.graphql";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AppNavBarProps {
  currentUser: AppNavBar_user$key | null;
  onLogout: () => void;
}

// Nav items with no destination yet — visible so the chrome matches the
// mocks, but not wired up (no Dashboard/Explore/Documentation surface
// exists yet).
const InertNavLink = ({ label }: { label: string }) => (
  <span className="cursor-default rounded-[24px] px-3 py-1 text-sm font-medium text-muted-foreground">
    {label}
  </span>
);

const AppNavBar = ({ currentUser: currentUserRef, onLogout }: AppNavBarProps) => {
  const currentUser = useFragment(
    graphql`
      fragment AppNavBar_user on User {
        username
        first_name
      }
    `,
    currentUserRef
  );

  return (
    <header className="sticky top-0 z-[1100] border-b border-border bg-background text-foreground">
      <div className="flex min-h-12 items-center gap-8 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[1.125rem] font-bold text-foreground no-underline"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[24px] bg-primary text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4V12M12 12L7 7M12 12L17 7M12 12V20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          CodeHub
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          <InertNavLink label="Dashboard" />
          {currentUser && (
            <Link
              to={`/${currentUser.username}`}
              className="rounded-[24px] bg-secondary px-3 py-1 text-sm font-bold text-foreground no-underline hover:bg-[#eeeeee]"
            >
              Repositories
            </Link>
          )}
          <InertNavLink label="Explore" />
          <InertNavLink label="Documentation" />
        </nav>

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-md" aria-label="Account menu" className="rounded-full">
                  <CircleUserRound className="size-5 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal text-muted-foreground">
                Signed in as {currentUser.first_name ?? currentUser.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link to={`/${currentUser.username}`} />}>
                <FolderOpen className="size-4" />
                My Repositories
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/settings/tokens" />}>
                <Key className="size-4" />
                Personal Access Tokens
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button render={<a href="/auth/google" />}>Login with Google</Button>
        )}
      </div>
    </header>
  );
};

export default AppNavBar;
