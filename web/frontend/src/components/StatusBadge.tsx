import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeTone = "neutral" | "primary" | "success";

interface StatusBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
}

// Prod's real per-tone values (`StatusBadge.tsx`'s original MUI Chip
// styling): "neutral" is grey.100 + a border, "primary"/"success" use
// literal tints with no border. 9ui's `info`/`success` badge variants
// don't quite match those literals, so this composes the base variant
// with an explicit color override instead.
const toneClassName: Record<StatusBadgeTone, string> = {
  neutral: "bg-secondary text-muted-foreground border-border",
  primary: "bg-[#eff6ff] text-primary border-transparent",
  success: "bg-[#f0fdf4] text-[#166534] border-transparent",
};

// Small recurring pill pattern across the app (Public/Private, token
// Active/Never used) — one place to keep the uppercase/weight/color
// styling consistent instead of repeating it per page.
const StatusBadge = ({ label, tone = "neutral" }: StatusBadgeProps) => (
  <Badge className={cn("rounded-full font-bold uppercase tracking-wider", toneClassName[tone])}>
    {label}
  </Badge>
);

export default StatusBadge;
