export function KnockoutBracketSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-64 rounded bg-white/10" />
      <div className="overflow-hidden rounded-2xl border border-[#E53935]/20 bg-[#0a1628]/80 p-4">
        <div className="flex min-w-[1100px] gap-3">
          {[0, 1, 2, 3].map((col) => (
            <div key={col} className="flex flex-1 flex-col gap-3">
              <div className="mx-auto h-3 w-20 rounded bg-white/10" />
              {Array.from({ length: 8 - col * 2 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-9 rounded-lg bg-white/10" />
                  <div className="h-9 rounded-lg bg-white/10" />
                </div>
              ))}
            </div>
          ))}
          <div className="flex w-[140px] flex-col items-center justify-center gap-4">
            <div className="h-20 w-full rounded-lg bg-white/10" />
            <div className="h-16 w-28 rounded-xl bg-[#FFD700]/10" />
          </div>
          {[0, 1, 2, 3].map((col) => (
            <div key={`r-${col}`} className="flex flex-1 flex-col gap-3">
              <div className="mx-auto h-3 w-20 rounded bg-white/10" />
              {Array.from({ length: 8 - col * 2 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-9 rounded-lg bg-white/10" />
                  <div className="h-9 rounded-lg bg-white/10" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
