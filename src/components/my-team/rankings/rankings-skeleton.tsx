"use client";

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-[#081120]/8" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/5 rounded-md bg-[#081120]/8" />
      </div>
      <div className="h-6 w-12 shrink-0 rounded-md bg-[#081120]/8" />
    </div>
  );
}

export function RankingsSkeleton() {
  return (
    <div className="space-y-4 overflow-x-hidden px-4 pb-4">
      <div>
        <h2 className="text-display text-xl">Rankings</h2>
        <p className="text-body text-sm text-white/50">Loading standings…</p>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/8 p-0.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 rounded-lg bg-white/10" />
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
