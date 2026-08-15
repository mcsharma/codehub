import { Link } from "react-router";
import { graphql, useFragment } from "react-relay";
import { CircleUserRound, Heart, Key, LogOut, Plus } from "lucide-react";
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
          Bookstore
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          <Link
            to="/"
            className="rounded-[24px] px-3 py-1 text-sm font-medium text-muted-foreground no-underline hover:bg-secondary hover:text-foreground"
          >
            Books
          </Link>
          {currentUser && (
            <Link
              to="/favorites"
              className="rounded-[24px] px-3 py-1 text-sm font-medium text-muted-foreground no-underline hover:bg-secondary hover:text-foreground"
            >
              Favorites
            </Link>
          )}
        </nav>

        {currentUser ? (
          <>
            <Button variant="outline" size="sm" render={<Link to="/books/new" />}>
              <Plus className="size-4" />
              New Book
            </Button>
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
                <DropdownMenuItem render={<Link to="/favorites" />}>
                  <Heart className="size-4" />
                  Favorites
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
          </>
        ) : (
          <Button render={<Link to="/login" />}>Login</Button>
        )}
      </div>
    </header>
  );
};

export default AppNavBar;
