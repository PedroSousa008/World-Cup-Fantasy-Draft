import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import type { GroupStandingRow, GroupTable, ThirdPlaceRow } from "@/lib/tournament/types";

interface TableViewProps {
  tables: GroupTable[];
  bestThird: ThirdPlaceRow[];
  /** Show manual-override badges (Owner view). */
  showOverrideBadges?: boolean;
}

const STAT_COL = "w-[9%] px-0.5 py-2 text-center";
const STAT_HEAD = "w-[9%] px-0.5 py-2 text-center font-bold";

export function TableView({ tables, bestThird, showOverrideBadges = false }: TableViewProps) {
  const hasAnyResults = tables.some((t) => t.rows.some((r) => r.played > 0));

  return (
    <div className="group-stage-tables max-w-full space-y-8 overflow-x-hidden">
      {!hasAnyResults && (
        <p className="rounded-xl border border-[#4a90d9]/30 bg-[#0a1628]/80 px-4 py-3 text-center text-sm text-white/60">
          Standings update automatically when the Owner enters match results.
        </p>
      )}

      <div className="space-y-6">
        {tables.map((table) => (
          <GroupStageTable key={table.group} table={table} showOverrideBadges={showOverrideBadges} />
        ))}
      </div>

      {bestThird.some((r) => r.played > 0) && (
        <section className="max-w-full space-y-3 overflow-x-hidden">
          <GroupStageHeader title="BEST THIRD-PLACED TEAMS" />
          <p className="text-sm text-white/55">
            Top 8 advance (32 teams total with group winners and runners-up).
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#4a90d9]/40 bg-gradient-to-b from-[#0d1f3c] to-[#081120] shadow-[inset_0_0_60px_rgba(0,60,120,0.2)]">
            <table className="w-full table-fixed border-collapse text-[11px]">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[32%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#4a90d9]/30 bg-[#0a1628]/60 text-[9px] font-bold uppercase tracking-wide text-white/70">
                  <th className="px-0.5 py-2 text-center">#</th>
                  <th className="px-1 py-2 text-left">Team</th>
                  <th className={STAT_HEAD}>Grp</th>
                  <th className={STAT_HEAD}>Gm</th>
                  <th className={STAT_HEAD}>G</th>
                  <th className={STAT_HEAD}>Pts</th>
                  <th className="w-[14%] px-0.5 py-2 text-center">St</th>
                </tr>
              </thead>
              <tbody>
                {bestThird.map((row) => (
                  <tr
                    key={row.teamId}
                    className="border-b border-white/5 text-white last:border-0"
                  >
                    <td className="px-0.5 py-2 text-center font-bold tabular-nums">{row.position}</td>
                    <td className="px-1 py-2">
                      <TeamCompactCell row={row} />
                    </td>
                    <td className={cn(STAT_COL, "font-medium")}>{row.group}</td>
                    <td className={cn(STAT_COL, "tabular-nums")}>{row.played}</td>
                    <td className={cn(STAT_COL, "font-semibold tabular-nums")}>
                      {formatGoalDiff(row.goalDifference)}
                    </td>
                    <td className={cn(STAT_COL, "font-bold tabular-nums")}>{row.points}</td>
                    <td className="w-[14%] px-0.5 py-2 text-center">
                      <QualBadge qualified={row.qualified} eliminated={row.eliminated} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function GroupStageTable({
  table,
  showOverrideBadges,
}: {
  table: GroupTable;
  showOverrideBadges: boolean;
}) {
  const hasOverride = table.rows.some((r) => r.manualOverride);

  return (
    <article className="max-w-full overflow-hidden rounded-2xl border border-[#4a90d9]/45 bg-gradient-to-b from-[#0d1f3c] via-[#0a1628] to-[#081120] shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_0_80px_rgba(0,50,100,0.15)]">
      <div className="relative border-b border-[#4a90d9]/35 bg-[#0a1628]/90 px-3 py-2.5">
        <GroupStageHeader title={`GROUP ${table.group}`} />
        {showOverrideBadges && hasOverride && (
          <span className="mt-1.5 inline-flex rounded-full border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
            Manual Override
          </span>
        )}
      </div>

      <table className="w-full table-fixed border-collapse text-[11px] sm:text-xs">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#4a90d9]/25 bg-[#0a1628]/50 text-[9px] font-bold uppercase tracking-wide text-white/65 sm:text-[10px]">
            <th className="px-1 py-2 text-left">Team</th>
            <th className={STAT_HEAD}>Gm</th>
            <th className={STAT_HEAD}>W</th>
            <th className={STAT_HEAD}>L</th>
            <th className={STAT_HEAD}>D</th>
            <th className={STAT_HEAD}>G</th>
            <th className="w-[12%] px-0.5 py-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <GroupStandingRowView
              key={row.teamId}
              row={row}
              showOverrideBadge={showOverrideBadges && row.manualOverride}
            />
          ))}
        </tbody>
      </table>
    </article>
  );
}

function TeamCompactCell({
  row,
  showOverrideBadge,
}: {
  row: Pick<GroupStandingRow, "position" | "teamName" | "teamCode" | "flagEmoji">;
  showOverrideBadge?: boolean;
}) {
  const accent = positionAccent(row.position);
  const flag = row.flagEmoji ?? getNationFlag(row.teamName);

  return (
    <div
      className="flex min-w-0 items-center gap-0.5"
      title={row.teamName}
      aria-label={`${row.position}. ${row.teamName}`}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[9px] font-black leading-none",
          accent.posBox
        )}
      >
        {row.position}
      </span>
      <span className="shrink-0 text-base leading-none sm:text-lg">{flag}</span>
      <span className="truncate text-[11px] font-bold tracking-tight sm:text-xs">{row.teamCode}</span>
      {showOverrideBadge && (
        <span className="sr-only">Manual override active</span>
      )}
    </div>
  );
}

function GroupStandingRowView({
  row,
  showOverrideBadge,
}: {
  row: GroupStandingRow;
  showOverrideBadge: boolean;
}) {
  const accent = positionAccent(row.position);

  return (
    <tr
      className={cn(
        "border-b border-white/[0.06] text-white last:border-0",
        row.qualified && "bg-emerald-500/[0.08]"
      )}
    >
      <td
        className={cn(
          "border-r border-[#E53935]/30 px-1 py-1.5",
          accent.rowBg
        )}
      >
        <TeamCompactCell row={row} showOverrideBadge={showOverrideBadge} />
        {showOverrideBadge && (
          <span className="mt-0.5 block text-[8px] font-bold uppercase text-amber-400">OVR</span>
        )}
      </td>
      <td className={cn(STAT_COL, "font-medium tabular-nums")}>{row.played}</td>
      <td className={cn(STAT_COL, "tabular-nums")}>{row.won}</td>
      <td className={cn(STAT_COL, "tabular-nums")}>{row.lost}</td>
      <td className={cn(STAT_COL, "tabular-nums")}>{row.drawn}</td>
      <td className={cn(STAT_COL, "font-semibold tabular-nums")}>
        {formatGoalDiff(row.goalDifference)}
      </td>
      <td className="w-[12%] px-0.5 py-2 text-center text-sm font-black tabular-nums sm:text-base">
        {row.points}
      </td>
    </tr>
  );
}

function GroupStageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-transparent to-white/30" />
      <span className="text-[11px] font-black tracking-[0.15em] text-white sm:text-xs">{title}</span>
      <span className="h-px flex-1 max-w-[40px] bg-gradient-to-l from-transparent to-white/30" />
    </div>
  );
}

function positionAccent(position: number) {
  switch (position) {
    case 1:
    case 2:
      return {
        posBox: "border-emerald-400 bg-emerald-500/20 text-emerald-100",
        rowBg: "border-l-2 border-l-emerald-400",
      };
    case 3:
      return {
        posBox: "border-amber-400 bg-amber-500/20 text-amber-100",
        rowBg: "border-l-2 border-l-amber-400",
      };
    default:
      return {
        posBox: "border-red-500/70 bg-red-950/40 text-red-200/90",
        rowBg: "border-l-2 border-l-red-500/80",
      };
  }
}

function formatGoalDiff(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

function QualBadge({ qualified, eliminated }: { qualified: boolean; eliminated: boolean }) {
  if (qualified) {
    return <span className="text-[9px] font-bold text-emerald-400">Q</span>;
  }
  if (eliminated) {
    return <span className="text-[9px] font-semibold text-red-400/90">X</span>;
  }
  return <span className="text-white/35">—</span>;
}
