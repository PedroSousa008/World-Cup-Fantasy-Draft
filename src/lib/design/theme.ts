export type ScreenTheme =
  | "default"
  | "auth"
  | "my-team"
  | "predictions"
  | "bets"
  | "calendar"
  | "profile"
  | "owner";

export function getScreenTheme(pathname: string): ScreenTheme {
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/create-owner")
  ) {
    return "auth";
  }
  if (pathname.startsWith("/my-team")) return "my-team";
  if (pathname.startsWith("/predictions")) return "predictions";
  if (pathname.startsWith("/bets")) return "bets";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/owner")) return "owner";
  return "default";
}

export const WC_COLORS = {
  blue: "#0066FF",
  blueDark: "#0052CC",
  blueDeep: "#003EB3",
  red: "#E53935",
  redDark: "#D62828",
  green: "#00C853",
  greenDark: "#00A844",
  white: "#FFFFFF",
  surface: "#F8F9FA",
  navy: "#081120",
  navyLight: "#0B1526",
} as const;
