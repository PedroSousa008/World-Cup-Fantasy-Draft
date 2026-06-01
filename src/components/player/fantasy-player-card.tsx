"use client";

import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/player/player-avatar";
import { getNationFlag } from "@/lib/nations";
import { getNationTheme, parseFixture } from "@/lib/nation-theme";
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
}

interface FantasyPlayerCardProps {
  player: FantasyCardPlayer;
  size?: "pitch" | "bench" | "list" | "full";
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onClick?: () => void;
  className?: string;
}

function PlayerPhoto({
  name,
  photoUrl,
  size,
}: {
  name: string;
  photoUrl?: string;
  size: "pitch" | "bench" | "list" | "full";
}) {
  const sizeMap = {
    pitch: "h-10 w-10",
    bench: "h-12 w-12",
    list: "h-14 w-14",
    full: "h-28 w-28",
  };

  const initialsMap = {
    pitch: "text-[10px]",
    bench: "text-xs",
    list: "text-sm",
    full: "text-3xl",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full shadow-inner ring-2 ring-[#FFD700]/40",
        sizeMap[size]
      )}
    >
      <PlayerAvatar
        name={name}
        photoUrl={photoUrl}
        className={cn("h-full w-full rounded-full", sizeMap[size])}
        initialsClassName={cn(
          "h-full w-full rounded-full font-black text-white",
          "bg-gradient-to-br from-white/30 to-white/5",
          initialsMap[size]
        )}
      />
    </div>
  );
}

function CaptainBadge({ type, size }: { type: "C" | "VC"; size: "pitch" | "bench" | "list" | "full" }) {
  const sizeClass = {
    pitch: "h-4 w-4 text-[7px]",
    bench: "h-5 w-5 text-[8px]",
    list: "h-5 w-5 text-[8px]",
    full: "h-7 w-7 text-[10px]",
  }[size];

  return (
    <span
      className={cn(
        "absolute z-10 flex items-center justify-center rounded-full font-black text-white shadow-lg ring-2 ring-[#FFD700]/60",
        type === "C"
          ? "bg-gradient-to-br from-[#FFD700] to-[#B8860B] text-[#081120]"
          : "bg-gradient-to-br from-[#081120] to-[#1a2a4a] text-[#FFD700]",
        sizeClass
      )}
    >
      {type}
    </span>
  );
}

export function FantasyPlayerCard({
  player,
  size = "pitch",
  isCaptain,
  isViceCaptain,
  onClick,
  className,
}: FantasyPlayerCardProps) {
  const theme = getNationTheme(player.nation);
  const { match, opponent } = parseFixture(player.upcomingFixture);
  const displayName =
    size === "pitch" ? (player.name.split(" ").pop() ?? player.name) : player.name;
  const isLive = player.matchStatus === "live";

  const widthClass = {
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
        "relative overflow-hidden text-left transition-transform active:scale-[0.97]",
        widthClass,
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Card frame */}
      <div
        className={cn(
          "relative rounded-2xl p-[2px] shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
          "bg-gradient-to-br from-[#FFD700] via-[#FFF8DC] to-[#B8860B]",
          size === "full" && "rounded-3xl p-[3px] shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[14px]",
            size === "full" && "rounded-[22px]"
          )}
          style={{
            background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.secondary}55 45%, ${theme.primary}dd 100%)`,
          }}
        >
          {/* Nation pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 10%, ${theme.accent} 0%, transparent 40%), radial-gradient(circle at 10% 90%, ${theme.secondary} 0%, transparent 35%)`,
            }}
          />

          {/* TOP — photo + nation badge */}
          <div
            className={cn(
              "relative flex flex-col items-center",
              size === "pitch" && "px-1.5 pt-2 pb-1",
              size === "bench" && "px-2 pt-2.5 pb-1.5",
              size === "list" && "flex-row gap-3 px-3 py-3",
              size === "full" && "px-5 pt-6 pb-4"
            )}
          >
            {size !== "list" && (
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 rounded-md font-black tracking-wider text-white/90",
                  "bg-black/25 px-1 py-0.5 backdrop-blur-sm ring-1 ring-[#FFD700]/30",
                  size === "pitch" && "text-[7px]",
                  size === "bench" && "text-[8px]",
                  size === "full" && "right-3 top-3 text-xs px-2 py-1"
                )}
              >
                {theme.abbr}
              </span>
            )}

            <div className="relative">
              <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size={size} />
              {isCaptain && (
                <span className="absolute -right-1 -top-1">
                  <CaptainBadge type="C" size={size} />
                </span>
              )}
              {isViceCaptain && !isCaptain && (
                <span className="absolute -right-1 -top-1">
                  <CaptainBadge type="VC" size={size} />
                </span>
              )}
              {isLive && (
                <span className="absolute -bottom-0.5 -left-0.5 h-2 w-2 animate-pulse rounded-full bg-[#E53935] ring-2 ring-white" />
              )}
            </div>

            {size === "list" && (
              <span className="absolute right-3 top-3 rounded-md bg-black/25 px-2 py-0.5 text-[10px] font-black text-white ring-1 ring-[#FFD700]/30">
                {theme.abbr}
              </span>
            )}
          </div>

          {/* MIDDLE — name, position, nation */}
          <div
            className={cn(
              "relative bg-gradient-to-b from-black/30 to-black/50 text-center",
              size === "pitch" && "px-1 py-1.5",
              size === "bench" && "px-1.5 py-2",
              size === "list" && "flex-1 bg-transparent py-0 text-left",
              size === "full" && "px-4 py-3"
            )}
          >
            <p
              className={cn(
                "truncate font-bold text-white drop-shadow-sm",
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
                "text-white/70",
                size === "pitch" && "text-[7px]",
                size === "bench" && "text-[8px]",
                size === "list" && "text-xs",
                size === "full" && "text-sm"
              )}
            >
              {size === "list" ? (
                <>
                  {player.position} · {getNationFlag(player.nation)} {player.nation}
                </>
              ) : (
                <>
                  {player.position} · {theme.abbr}
                </>
              )}
            </p>
          </div>

          {/* STATS */}
          {size !== "pitch" && (
            <div
              className={cn(
                "grid grid-cols-2 gap-px bg-[#FFD700]/20",
                size === "list" && "hidden"
              )}
            >
              <div className={cn("bg-black/40 text-center", size === "bench" && "py-1", size === "full" && "py-2.5")}>
                <p className={cn("font-black text-[#FFD700]", size === "bench" ? "text-xs" : "text-lg")}>
                  {player.totalPoints}
                </p>
                <p className={cn("text-white/50", size === "bench" ? "text-[7px]" : "text-[10px]")}>Pts</p>
              </div>
              <div className={cn("bg-black/40 text-center", size === "bench" && "py-1", size === "full" && "py-2.5")}>
                <p className={cn("font-black text-white", size === "bench" ? "text-xs" : "text-lg")}>
                  {player.matchdayPoints}
                </p>
                <p className={cn("text-white/50", size === "bench" ? "text-[7px]" : "text-[10px]")}>MD</p>
              </div>
            </div>
          )}

          {/* BOTTOM — fixture */}
          <div
            className={cn(
              "relative border-t border-[#FFD700]/20 bg-black/55 text-center",
              size === "pitch" && "px-1 py-1",
              size === "bench" && "px-1.5 py-1.5",
              size === "list" && "hidden",
              size === "full" && "px-4 py-3"
            )}
          >
            <p
              className={cn(
                "font-semibold text-white/90",
                size === "pitch" && "text-[7px] leading-tight",
                size === "bench" && "text-[8px]",
                size === "full" && "text-sm"
              )}
            >
              {match}
            </p>
            {(size === "bench" || size === "full") && (
              <p className={cn("text-white/45", size === "bench" ? "text-[7px]" : "text-xs")}>
                vs {opponent}
                {player.matchDate ? ` · ${player.matchDate}` : ""}
              </p>
            )}
          </div>

          {size === "list" && (
            <div className="absolute bottom-3 right-3 text-right">
              <p className="text-lg font-black text-[#FFD700]">{player.totalPoints}</p>
              <p className="text-[10px] text-white/50">{player.matchdayPoints} MD</p>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
