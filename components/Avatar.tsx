import type { AvatarStyle } from "@/utils/avatar";

interface AvatarProps extends AvatarStyle {
  size?: "sm" | "md";
}

/** Small coloured emoji badge used as a stand-in for player/disc artwork. */
export default function Avatar({ emoji, color, size = "md" }: AvatarProps) {
  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ background: color }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
