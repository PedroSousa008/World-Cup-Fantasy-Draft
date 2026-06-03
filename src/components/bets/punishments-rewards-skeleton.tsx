export function PunishmentsRewardsSkeleton({ rowCount = 10 }: { rowCount?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
      <div className="grid grid-cols-[3.5rem_1fr] border-b border-white/10 bg-white/[0.04]">
        <div className="px-3 py-3">
          <div className="mx-auto h-3 w-10 animate-pulse rounded bg-white/10" />
        </div>
        <div className="px-3 py-3">
          <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <ul>
        {Array.from({ length: rowCount }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[3.5rem_1fr] border-b border-white/[0.06] last:border-b-0"
          >
            <div className="flex items-center justify-center border-r border-white/[0.06] py-3">
              <div className="h-4 w-4 animate-pulse rounded bg-white/10" />
            </div>
            <div className="px-3 py-3">
              <div className="h-4 w-full max-w-[220px] animate-pulse rounded bg-white/10" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
