"use client";

function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col rounded-xl bg-white/95 p-2 shadow-md ring-1 ring-black/5">
      <div className="mx-auto h-12 w-12 rounded-full bg-[#081120]/8" />
      <div className="mx-auto mt-2 h-3 w-14 rounded bg-[#081120]/8" />
      <div className="mx-auto mt-1 h-2 w-10 rounded bg-[#081120]/6" />
      <div className="mx-auto mt-2 h-8 w-full rounded-lg bg-[#081120]/6" />
    </div>
  );
}

export function DraftSkeleton() {
  return (
    <div className="overflow-x-hidden pb-6">
      <div className="space-y-4 px-4">
        <div>
          <h2 className="text-display text-xl">Draft</h2>
          <p className="text-body text-sm text-white/50">Loading players…</p>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/8 p-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-white/10" />
          ))}
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-16 rounded-full bg-white/10" />
          ))}
        </div>
        <div className="h-11 rounded-xl bg-white/10" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
