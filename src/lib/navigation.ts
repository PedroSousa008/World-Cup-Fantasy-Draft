import {
  Calendar,
  LayoutDashboard,
  Target,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  { label: "My Team", href: "/my-team", icon: LayoutDashboard },
  { label: "Predictions", href: "/predictions", icon: Target },
  { label: "Bets & Punishments", href: "/bets", icon: Trophy },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Profile", href: "/profile/overview", icon: User },
];

export const OWNER_NAV: NavItem[] = [
  { label: "Owner Dashboard", href: "/owner", icon: LayoutDashboard, ownerOnly: true },
];

export type SubTab = {
  label: string;
  slug: string;
  shortLabel?: string;
};

export const MY_TEAM_TABS: SubTab[] = [
  { label: "Team", slug: "team" },
  { label: "Rankings", slug: "rankings" },
  { label: "Draft Room", shortLabel: "Draft", slug: "draft" },
  { label: "Powers", slug: "powers" },
];

export const PREDICTIONS_TABS: SubTab[] = [
  { label: "Tournament Predictions", slug: "tournament" },
  { label: "Match Predictions", slug: "matches" },
];

export const BETS_TABS: SubTab[] = [
  { label: "Bets", slug: "bets" },
  { label: "Punishments & Rewards", slug: "punishments" },
];

export const PROFILE_TABS: SubTab[] = [
  { label: "Overview", slug: "overview" },
  { label: "Records", slug: "records" },
  { label: "Squad Stats", slug: "squad", shortLabel: "Squad" },
  { label: "Predictions & Bets", slug: "predictions", shortLabel: "Predictions" },
  { label: "Achievements", slug: "achievements" },
];

export const CALENDAR_TABS: SubTab[] = [
  { label: "Calendar", slug: "calendar" },
  { label: "Games", slug: "games" },
  { label: "Table", slug: "table" },
];

/** Table tab links to nested group / knockout views. */
export function calendarTabHref(tab: SubTab): string {
  if (tab.slug === "table") return "/calendar/table/group-stage";
  return `/calendar/${tab.slug}`;
}

export const CALENDAR_TABLE_TABS: SubTab[] = [
  { label: "Group Stage", slug: "group-stage" },
  { label: "Knockout Stage", slug: "knockout-stage" },
];

export const OWNER_MATCHES_EVENTS_TABS: SubTab[] = [
  { label: "Matches", slug: "matches" },
  { label: "Events", slug: "events" },
];

export const OWNER_EVENTS_TABS: SubTab[] = [
  { label: "Group Stage", slug: "group-stage" },
  { label: "Knockout", slug: "knockout" },
];

export const OWNER_PLAYERS_TABS: SubTab[] = [
  { label: "Nations & Players", slug: "nations" },
  { label: "Teams", slug: "teams" },
];

export function getDefaultTab(tabs: SubTab[]): string {
  return tabs[0]?.slug ?? "";
}
