"use client";

import {
  WorldCupPlayerCard,
  type WorldCupCardData,
} from "@/components/player/world-cup-player-card";
import type { MatchStatus } from "@/lib/mock/my-team-data";

export interface FantasyCardPlayer {
  id: string;
  name: string;
  position: string;
  nation: string;
  totalPoints: number;
  matchdayPoints: number;
  upcomingFixture: string;
  matchDate?: string;
  matchStatus?: MatchStatus;
  photoUrl?: string;
  currentMatchdayPoints?: number;
  managerNationAbbr?: string;
}

interface FantasyPlayerCardProps {
  player: FantasyCardPlayer;
  size?: "pitch" | "bench" | "list" | "full";
  /** Team tab cards use matchday badge + manager nation abbr */
  teamLayout?: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onClick?: () => void;
  className?: string;
}

function toWorldCup(player: FantasyCardPlayer): WorldCupCardData {
  return {
    id: player.id,
    name: player.name,
    photoUrl: player.photoUrl,
    nation: player.nation,
    position: player.position,
    totalPoints: player.totalPoints,
    matchdayPoints: player.currentMatchdayPoints ?? player.matchdayPoints ?? 0,
    upcomingFixture: player.upcomingFixture,
    matchDate: player.matchDate,
    managerNationAbbr: player.managerNationAbbr,
    isCaptain: false,
    isViceCaptain: false,
  };
}

export function FantasyPlayerCard({
  player,
  size = "pitch",
  teamLayout = false,
  isCaptain,
  isViceCaptain,
  onClick,
  className,
}: FantasyPlayerCardProps) {
  const mapped = toWorldCup(player);
  mapped.isCaptain = isCaptain;
  mapped.isViceCaptain = isViceCaptain;

  const cardSize = size === "pitch" ? "pitch" : size;

  return (
    <WorldCupPlayerCard
      player={mapped}
      size={cardSize}
      variant={teamLayout ? "team" : "default"}
      onClick={onClick}
      className={className}
    />
  );
}
