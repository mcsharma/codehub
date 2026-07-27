import { CircleUserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  size?: number;
  className?: string;
}

// No photo storage exists yet (Google profile pictures aren't persisted),
// so every avatar is this generic icon rather than a broken/missing image.
const UserAvatar = ({ size = 32, className }: UserAvatarProps) => (
  <Avatar
    style={{ width: size, height: size }}
    className={cn("bg-background text-muted-foreground", className)}
  >
    <AvatarFallback className="bg-transparent">
      <CircleUserRound size={Math.round(size * 0.8)} />
    </AvatarFallback>
  </Avatar>
);

export default UserAvatar;
