import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import { EmptyState } from "@/components/ui/card";
import type { GroupTable, ThirdPlaceRow } from "@/lib/tournament/types";

interface TableViewProps {
  tables: GroupTable[];
  bestThird: ThirdPlaceRow[];
}

export function TableView({ tables, bestThird }: TableViewProps) {
  if (tables.every((t) => t.rows.every((r) => r.played === 0))) {
    return (
      <EmptyState
        title="No results yet"
        description="Group tables update automatically when the Owner enters match results."
        accent="blue"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <GroupTableCard key={table.group} table={table} />
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Best third-placed teams</h2>
        <p className="text-sm text-white/55">Top 8 advance (32 teams total with group winners and runners-up).</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Grp</th>
                <th className="px-3 py-2">P</th>
                <th className="px-3 py-2">GD</th>
                <th className="px-3 py-2">Pts</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bestThird.map((row) => (
                <tr key={row.teamId} className="border-b border-white/5 text-white">
                  <td className="px-3 py-2 font-semibold">{row.position}</td>
                  <td className="px-3 py-2">
                    <span className="mr-2">{row.flagEmoji ?? getNationFlag(row.teamName)}</span>
                    {row.teamName}
                  </td>
                  <td className="px-3 py-2">{row.group}</td>
                  <td className="px-3 py-2">{row.played}</td>
                  <td className="px-3 py-2">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                  <td className="px-3 py-2 font-semibold">{row.points}</td>
                  <td className="px-3 py-2">
                    <QualBadge qualified={row.qualified} eliminated={row.eliminated} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function GroupTableCard({ table }: { table: GroupTable }) {
  return (
    <div className="wc-card overflow-hidden p-0">
      <div className="border-b border-[#081120]/8 bg-[#0066FF]/8 px-4 py-3">
        <h3 className="text-base font-bold text-[#081120]">Group {table.group}</h3>
      </div>
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="text-left text-[#081120]/50">
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">Team</th>
            <th className="px-2 py-2">P</th>
            <th className="px-2 py-2">W</th>
            <th className="px-2 py-2">D</th>
            <th className="px-2 py-2">L</th>
            <th className="px-2 py-2">GF</th>
            <th className="px-2 py-2">GA</th>
            <th className="px-2 py-2">GD</th>
            <th className="px-2 py-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr
              key={row.teamId}
              className={cn(
                "border-t border-[#081120]/5",
                row.qualified && "bg-[#00C853]/10",
                row.eliminated && !row.qualified && row.played > 0 && "opacity-60"
              )}
            >
              <td className="px-2 py-2 font-semibold">{row.position}</td>
              <td className="max-w-[100px] truncate px-2 py-2 font-medium">
                <span className="mr-1">{row.flagEmoji ?? getNationFlag(row.teamName)}</span>
                {row.teamName}
              </td>
              <td className="px-2 py-2">{row.played}</td>
              <td className="px-2 py-2">{row.won}</td>
              <td className="px-2 py-2">{row.drawn}</td>
              <td className="px-2 py-2">{row.lost}</td>
              <td className="px-2 py-2">{row.goalsFor}</td>
              <td className="px-2 py-2">{row.goalsAgainst}</td>
              <td className="px-2 py-2">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="px-2 py-2 font-bold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.some((r) => r.qualified || r.eliminated) && (
        <div className="flex flex-wrap gap-2 border-t border-[#081120]/8 px-3 py-2">
          {table.rows
            .filter((r) => r.qualified)
            .map((r) => (
              <span
                key={r.teamId}
                className="rounded-full bg-[#00C853]/15 px-2 py-0.5 text-xs font-semibold text-[#00A844]"
              >
                {r.teamName} qualified
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

function QualBadge({ qualified, eliminated }: { qualified: boolean; eliminated: boolean }) {
  if (qualified) {
    return <span className="font-semibold text-[#00C853]">Qualified</span>;
  }
  if (eliminated) {
    return <span className="text-[#E53935]">Out</span>;
  }
  return <span className="text-white/40">—</span>;
}
