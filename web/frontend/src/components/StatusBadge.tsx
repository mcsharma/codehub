import Chip from "@mui/material/Chip";

export type StatusBadgeTone = "neutral" | "primary" | "success";

interface StatusBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
}

// Fixed light tints matching the mocks (Tailwind blue-50/green-50 etc.) —
// MUI's default palette only has main/light/dark, not these pastel shades.
const toneStyles: Record<StatusBadgeTone, { bgcolor: string; color: string }> = {
  neutral: { bgcolor: "grey.100", color: "text.secondary" },
  primary: { bgcolor: "#eff6ff", color: "primary.main" },
  success: { bgcolor: "#f0fdf4", color: "#166534" },
};

// Small recurring pill pattern across the mocks (Public/Private, token
// Active/Never used) — one place to keep the uppercase/weight/color styling
// consistent instead of repeating it per page.
const StatusBadge = ({ label, tone = "neutral" }: StatusBadgeProps) => {
  const style = toneStyles[tone];
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        border: tone === "neutral" ? "1px solid" : "none",
        borderColor: "divider",
      }}
    />
  );
};

export default StatusBadge;
