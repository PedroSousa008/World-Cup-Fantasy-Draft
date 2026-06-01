import type { PowerType } from "@prisma/client";

export type PowerDisplayStatus =
  | "available"
  | "pending"
  | "active"
  | "used"
  | "expired"
  | "awaiting_acceptance";

export interface PowerHistoryEntry {
  powerType: PowerType;
  name: string;
  icon: string;
  matchday: number | null;
  targetLabel: string | null;
  resultLabel: string | null;
  pointsEffect: number | null;
  status: PowerDisplayStatus;
  settledAt: string | null;
}

export interface PowerNotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface RivalChallengeItem {
  id: string;
  challengerTeamName: string;
  opponentTeamName: string;
  matchday: number;
  status: string;
  isIncoming: boolean;
}

export interface PowerCardData {
  type: PowerType;
  name: string;
  icon: string;
  description: string;
  displayStatus: PowerDisplayStatus;
  matchday: number | null;
  targetLabel: string | null;
  pointsEffect: number | null;
  resultSummary: string | null;
  canActivate: boolean;
  rivalChallengeId: string | null;
}

export interface PowersPageData {
  powers: PowerCardData[];
  history: PowerHistoryEntry[];
  notifications: PowerNotificationItem[];
  pendingRivalChallenges: RivalChallengeItem[];
  openMatchdays: number[];
  squadPlayers: { id: string; name: string; position: string }[];
  otherUsers: { id: string; teamName: string }[];
  opponentSquads: Record<string, { id: string; name: string }[]>;
  wildcardActive: boolean;
  wildcardMatchday: number | null;
  unassignedPlayers: { id: string; name: string; position: string }[];
}
