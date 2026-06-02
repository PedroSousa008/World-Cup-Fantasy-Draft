import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import type { GroupStandingRow, GroupTable, ThirdPlaceRow } from "@/lib/tournament/types";

interface TableViewProps {
  tables: GroupTable[];
  bestThird: ThirdPlaceRow[];
  /** Show manual-override badges (Owner view). */
  showOverrideBadges?: boolean;
}

export function TableView({ tables, bestThird, showOverrideBadges = false }: TableViewProps) {
  const hasAnyResults = tables.some((t) => t.rows.some((r) => r.played > 0));

  return (
    <div className="group-stage-tables space-y-8">
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
        <section className="space-y-3">
          <GroupStageHeader title="BEST THIRD-PLACED TEAMS" />
          <p className="text-sm text-white/55">
            Top 8 advance (32 teams total with group winners and runners-up).
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#4a90d9]/40 bg-gradient-to-b from-[#0d1f3c] to-[#081120] shadow-[inset_0_0_60px_rgba(0,60,120,0.2)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-[#4a90d9]/30 bg-[#0a1628]/60 text-[10px] font-bold uppercase tracking-wider text-white/70">
                    <th className="px-3 py-2.5 text-center">#</th>
                    <th className="px-3 py-2.5 text-left">Team</th>
                    <th className="px-3 py-2.5 text-center">Grp</th>
                    <th className="px-3 py-2.5 text-center">Games</th>
                    <th className="px-3 py-2.5 text-center">G</th>
                    <th className="px-3 py-2.5 text-center">Pts</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bestThird.map((row) => (
                    <tr
                      key={row.teamId}
                      className="border-b border-white/5 text-white last:border-0"
                    >
                      <td className="px-3 py-2.5 text-center font-bold">{row.position}</td>
                      <td className="px-3 py-2.5">
                        <span className="mr-2 text-lg leading-none">
                          {row.flagEmoji ?? getNationFlag(row.teamName)}
                        </span>
                        <span className="font-semibold">{row.teamName}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium text-white/80">
                        {row.group}
                      </td>
                      <td className="px-3 py-2.5 text-center">{row.played}</td>
                      <td className="px-3 py-2.5 text-center font-medium">
                        {formatGoalDiff(row.goalDifference)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold">{row.points}</td>
                      <td className="px-3 py-2.5 text-center">
                        <QualBadge qualified={row.qualified} eliminated={row.eliminated} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    <article className="overflow-hidden rounded-2xl border border-[#4a90d9]/45 bg-gradient-to-b from-[#0d1f3c] via-[#0a1628] to-[#081120] shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_0_80px_rgba(0,50,100,0.15)]">
      <div className="relative border-b border-[#4a90d9]/35 bg-[#0a1628]/90 px-4 py-3">
        <GroupStageHeader title={`GROUP ${table.group}`} />
        {showOverrideBadges && hasOverride && (
          <span className="mt-2 inline-flex rounded-full border border-amber-400/50 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
            Manual Override Active
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[340px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#4a90d9]/25 bg-[#0a1628]/50 text-[10px] font-bold uppercase tracking-wider text-white/65">
              <th className="sticky left-0 z-10 min-w-[140px] bg-[#0a1628]/95 px-3 py-2.5 text-left backdrop-blur-sm">
                Team
              </th>
              <th className="px-2 py-2.5 text-center">Games</th>
              <th className="px-2 py-2.5 text-center">W</th>
              <th className="px-2 py-2.5 text-center">L</th>
              <th className="px-2 py-2.5 text-center">D</th>
              <th className="px-2 py-2.5 text-center">G</th>
              <th className="px-3 py-2.5 text-center">Points</th>
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
      </div>
    </article>
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
        "border-b border-white/[0.06] text-white transition-colors last:border-0",
        row.qualified && "bg-emerald-500/[0.08]"
      )}
    >
      <td
        className={cn(
          "sticky left-0 z-10 border-r border-[#E53935]/40 bg-[#0a1628]/95 px-2 py-2.5 backdrop-blur-sm",
          accent.rowBg
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-xs font-black",
              accent.posBox
            )}
          >
            {row.position}
          </span>
          <span className="text-lg leading-none">
            {row.flagEmoji ?? getNationFlag(row.teamName)}
          </span>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold leading-tight">{row.teamName}</span>
            {showOverrideBadge && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-amber-400">
                Override
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-2.5 text-center font-medium tabular-nums">{row.played}</td>
      <td className="px-2 py-2.5 text-center tabular-nums">{row.won}</td>
      <td className="px-2 py-2.5 text-center tabular-nums">{row.lost}</td>
      <td className="px-2 py-2.5 text-center tabular-nums">{row.drawn}</td>
      <td className="px-2 py-2.5 text-center font-semibold tabular-nums">
        {formatGoalDiff(row.goalDifference)}
      </td>
      <td className="px-3 py-2.5 text-center text-base font-black tabular-nums">{row.points}</td>
    </tr>
  );
}

function GroupStageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px flex-1 max-w-[48px] bg-gradient-to-r from-transparent to-white/30" />
      <span className="text-xs font-black tracking-[0.2em] text-white sm:text-sm">{title}</span>
      <span className="h-px flex-1 max-w-[48px] bg-gradient-to-l from-transparent to-white/30" />
    </div>
  );
}

function positionAccent(position: number) {
  switch (position) {
    case 1:
    case 2:
      return {
        posBox: "border-emerald-400 bg-emerald-500/20 text-emerald-100",
        rowBg: "border-l-[3px] border-l-emerald-400",
      };
    case 3:
      return {
        posBox: "border-amber-400 bg-amber-500/20 text-amber-100",
        rowBg: "border-l-[3px] border-l-amber-400",
      };
    default:
      return {
        posBox: "border-red-500/70 bg-red-950/40 text-red-200/90",
        rowBg: "border-l-[3px] border-l-red-500/80",
      };
  }
}

function formatGoalDiff(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

function QualBadge({ qualified, eliminated }: { qualified: boolean; eliminated: boolean }) {
  if (qualified) {
    return <span className="text-xs font-bold text-emerald-400">Qualified</span>;
  }
  if (eliminated) {
    return <span className="text-xs font-semibold text-red-400/90">Out</span>;
  }
  return <span className="text-white/35">—</span>;
}
