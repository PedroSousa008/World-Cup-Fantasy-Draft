"use client";

import { memo } from "react";
import { PlayerAvatar } from "@/components/player/player-avatar";
import { getNationFlag } from "@/lib/nations";
import { getPositionLabel } from "@/lib/players/types";
import type { PlayerPosition } from "@/lib/players/types";
import { getNationTheme, parseFixture } from "@/lib/nation-theme";
import { cn } from "@/lib/utils";

export interface WorldCupCardData {
  id: string;
  name: string;
  photoUrl?: string | null;
  /** Player's national team (card theme + label) */
  nation: string;
  position: PlayerPosition | string;
  totalPoints: number;
  matchdayPoints?: number;
  upcomingFixture?: string;
  matchDate?: string;
  /** Owner user's selected nation — top-left badge only when assigned */
  ownerSelectedNation?: string | null;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

interface WorldCupPlayerCardProps {
  player: WorldCupCardData;
  size?: "draft" | "bench" | "pitch" | "list" | "full";
  onClick?: () => void;
  className?: string;
  footer?: React.ReactNode;
}

function OwnerNationBadge({
  nation,
  size,
}: {
  nation: string | null | undefined;
  size: WorldCupPlayerCardProps["size"];
}) {
  const sizeClass = {
    draft: "h-5 w-5 text-[9px]",
    pitch: "h-5 w-5 text-[9px]",
    bench: "h-6 w-6 text-[10px]",
    list: "h-7 w-7 text-[11px]",
    full: "h-9 w-9 text-sm",
  }[size ?? "draft"];

  if (!nation) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-black/20 ring-1 ring-white/25",
          sizeClass
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-black/35 shadow-md ring-1 ring-[#FFD700]/40 backdrop-blur-sm",
        sizeClass
      )}
      title={`Owned by manager (${nation})`}
    >
      {getNationFlag(nation)}
    </span>
  );
}

function WorldCupPlayerCardInner({
  player,
  size = "draft",
  onClick,
  className,
  footer,
}: WorldCupPlayerCardProps) {
  const theme = getNationTheme(player.nation);
  const positionLabel = getPositionLabel(player.position);
  const fixture = player.upcomingFixture ?? "No fixture scheduled";
  const { match, opponent } = parseFixture(fixture);
  const displayName =
    size === "pitch" ? (player.name.split(" ").pop() ?? player.name) : player.name;

  const widthClass = {
    draft: "w-full min-w-0",
    pitch: "w-full max-w-[72px]",
    bench: "w-[96px]",
    list: "w-full",
    full: "w-full max-w-[280px] mx-auto",
  }[size];

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "relative text-left active:scale-[0.97]",
        widthClass,
        onClick && "cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-[2px] shadow-[0_10px_28px_rgba(0,0,0,0.45)]",
          "bg-gradient-to-br from-[#FFD700] via-[#FFF4C2] to-[#C9A227]",
          size === "full" && "rounded-3xl p-[3px]"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[14px]",
            size === "full" && "rounded-[22px]"
          )}
          style={{
            background: `linear-gradient(165deg, ${theme.primary} 0%, ${theme.secondary}40% 40%, ${theme.primary} 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: `radial-gradient(circle at 85% 8%, ${theme.accent} 0%, transparent 45%), radial-gradient(circle at 5% 95%, ${theme.secondary} 0%, transparent 40%)`,
            }}
          />

          {/* Top bar: owner nation (user) left, player nation right */}
          <div
            className={cn(
              "relative flex items-start justify-between",
              size === "draft" && "px-1.5 pt-1.5",
              size === "pitch" && "px-1.5 pt-1.5",
              size === "bench" && "px-2 pt-2",
              size === "list" && "px-3 pt-3",
              size === "full" && "px-4 pt-4"
            )}
          >
            <OwnerNationBadge nation={player.ownerSelectedNation} size={size} />
            <span
              className={cn(
                "rounded-md bg-black/30 px-1.5 py-0.5 font-black tracking-wider text-white ring-1 ring-[#FFD700]/35 backdrop-blur-sm",
                size === "draft" && "text-[7px]",
                size === "pitch" && "text-[7px]",
                size === "bench" && "text-[8px]",
                size === "full" && "text-xs"
              )}
            >
              {theme.abbr}
            </span>
          </div>

          {/* Photo */}
          <div
            className={cn(
              "relative mx-auto flex items-end justify-center",
              size === "draft" && "h-[72px] w-full px-2",
              size === "pitch" && "h-14 px-1",
              size === "bench" && "h-16 px-1.5",
              size === "list" && "h-20 w-20 shrink-0",
              size === "full" && "h-36 px-4"
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-xl bg-black/20 shadow-inner ring-1 ring-white/20",
                size === "draft" && "h-[68px] w-[68px] rounded-full",
                size === "pitch" && "h-10 w-10 rounded-full",
                size === "bench" && "h-12 w-12 rounded-full",
                size === "list" && "h-full w-full rounded-2xl",
                size === "full" && "h-32 w-32 rounded-2xl"
              )}
            >
              <PlayerAvatar
                name={player.name}
                photoUrl={player.photoUrl}
                lazy
                className="h-full w-full"
                initialsClassName="h-full w-full text-sm font-black text-white bg-gradient-to-br from-white/25 to-white/5"
              />
            </div>
            {player.isCaptain && (
              <span className="absolute -right-0.5 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD700] text-[8px] font-black text-[#081120] ring-1 ring-white">
                C
              </span>
            )}
            {player.isViceCaptain && !player.isCaptain && (
              <span className="absolute -right-0.5 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#081120] text-[8px] font-black text-[#FFD700] ring-1 ring-[#FFD700]">
                V
              </span>
            )}
          </div>

          {/* Name + position */}
          <div
            className={cn(
              "bg-gradient-to-b from-black/25 to-black/55 text-center",
              size === "draft" && "px-1.5 py-1.5",
              size === "pitch" && "px-1 py-1",
              size === "bench" && "px-1.5 py-1.5",
              size === "list" && "flex-1 px-2 py-0 text-left",
              size === "full" && "px-4 py-3"
            )}
          >
            <p
              className={cn(
                "truncate font-bold text-white drop-shadow",
                size === "draft" && "text-[10px]",
                size === "pitch" && "text-[9px]",
                size === "bench" && "text-[10px]",
                size === "list" && "text-sm",
                size === "full" && "text-xl"
              )}
            >
              {displayName}
            </p>
            <p
              className={cn(
                "truncate text-white/75",
                size === "draft" && "text-[8px]",
                size === "pitch" && "text-[7px]",
                size === "bench" && "text-[8px]",
                size === "list" && "text-xs",
                size === "full" && "text-sm"
              )}
            >
              {positionLabel} · {getNationFlag(player.nation)}
            </p>
          </div>

          {/* Points */}
          {(size === "draft" || size === "bench" || size === "full" || size === "list") && (
            <div
              className={cn(
                "grid grid-cols-2 gap-px bg-[#FFD700]/15",
                size === "list" && "hidden"
              )}
            >
              <div className={cn("bg-black/45 py-1 text-center", size === "full" && "py-2")}>
                <p
                  className={cn(
                    "font-black tabular-nums text-[#FFD700]",
                    size === "draft" && "text-[11px]",
                    size === "full" && "text-lg"
                  )}
                >
                  {player.totalPoints}
                </p>
                <p className="text-[7px] text-white/45">Pts</p>
              </div>
              <div className={cn("bg-black/45 py-1 text-center", size === "full" && "py-2")}>
                <p
                  className={cn(
                    "font-black tabular-nums text-white",
                    size === "draft" && "text-[11px]",
                    size === "full" && "text-lg"
                  )}
                >
                  {player.matchdayPoints ?? 0}
                </p>
                <p className="text-[7px] text-white/45">MD</p>
              </div>
            </div>
          )}

          {/* Fixture */}
          {size !== "list" && (
            <div
              className={cn(
                "border-t border-[#FFD700]/15 bg-black/50 text-center",
                size === "draft" && "px-1 py-1",
                size === "pitch" && "hidden",
                size === "bench" && "px-1.5 py-1",
                size === "full" && "px-3 py-2.5"
              )}
            >
              <p
                className={cn(
                  "truncate font-semibold text-white/90",
                  size === "draft" && "text-[7px]",
                  size === "bench" && "text-[8px]",
                  size === "full" && "text-sm"
                )}
              >
                {match}
              </p>
              {(size === "draft" || size === "bench" || size === "full") && opponent && (
                <p
                  className={cn(
                    "truncate text-white/45",
                    size === "draft" && "text-[6px]",
                    size === "full" && "text-xs"
                  )}
                >
                  vs {opponent}
                  {player.matchDate ? ` · ${player.matchDate}` : ""}
                </p>
              )}
            </div>
          )}

          {footer && <div className="border-t border-[#FFD700]/10 bg-black/30 p-1.5">{footer}</div>}
        </div>
      </div>
    </Wrapper>
  );
}

export const WorldCupPlayerCard = memo(WorldCupPlayerCardInner);

export function draftCardToWorldCup(player: {
  id: string;
  name: string;
  photoUrl: string | null;
  nation: string;
  position: string;
  totalPoints: number;
  ownerSelectedNation: string | null;
}): WorldCupCardData {
  return {
    id: player.id,
    name: player.name,
    photoUrl: player.photoUrl,
    nation: player.nation,
    position: player.position,
    totalPoints: player.totalPoints,
    matchdayPoints: 0,
    upcomingFixture: "No fixture scheduled",
    ownerSelectedNation: player.ownerSelectedNation,
  };
}
