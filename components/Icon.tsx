type IconName =
  | "disc"
  | "coin"
  | "trophy"
  | "star"
  | "check"
  | "flame"
  | "calendar"
  | "flag"
  | "chart";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** Shared stroke-style SVG paths, drawn at a 24x24 viewBox with `currentColor`. */
const PATHS: Record<IconName, string> = {
  disc: "M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0Z",
  coin: "M12 21a9 9 0 1 0 0-18 9 9 0 1 0 0 18Z M12 7v10 M9.5 9.5h3.25a1.75 1.75 0 0 1 0 3.5h-2a1.75 1.75 0 0 0 0 3.5H14",
  trophy:
    "M7 4h10v4a5 5 0 0 1-10 0V4Z M7 5H4v2a3 3 0 0 0 3 3 M17 5h3v2a3 3 0 0 1-3 3 M9 17h6 M10 13.5 9 17 M14 13.5l1 3.5 M8 21h8",
  star: "M12 2.5l2.95 6.27 6.55.79-4.86 4.66 1.28 6.53L12 17.6l-5.92 3.15 1.28-6.53-4.86-4.66 6.55-.79L12 2.5Z",
  check: "M4 12.5 9 17.5 20 6.5",
  flame:
    "M12 2.5c1.2 2.4 3 4.3 3 7a3 3 0 1 1-6 0c0-.8.2-1.4.5-2-1.4 1.2-2.5 3-2.5 5.2a5 5 0 0 0 10 0c0-4.5-3.2-7-5-10.2Z",
  calendar:
    "M4 5.5h16v15H4v-15Z M4 9.5h16 M8 3v4 M16 3v4",
  flag: "M5 21V4 M5 4h13l-3 3.5L18 11H5",
  chart: "M3 3v18h18 M7 16l4-4 4 4 4-7",
};

/** Consistent stroke-style icon, replacing ad-hoc emoji in chrome/UI elements. */
export default function Icon({ name, size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
