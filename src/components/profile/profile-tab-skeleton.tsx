import type { ProfileTabSlug } from "@/lib/profile/types";

export function ProfileOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function ProfileRecordsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function ProfileSquadSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-white/5" />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-white/6 px-3 py-3">
            <div className="h-9 w-9 rounded-full bg-white/5" />
            <div className="h-4 flex-1 rounded bg-white/5" />
            <div className="h-4 w-8 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePredictionsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
      </div>
      <div className="h-24 rounded-2xl bg-white/5" />
    </div>
  );
}

export function ProfileAchievementsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex justify-between border-b border-white/6 px-4 py-3">
            <div className="h-4 w-12 rounded bg-white/5" />
            <div className="h-4 w-8 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileTabSkeleton({ tab }: { tab: ProfileTabSlug }) {
  switch (tab) {
    case "overview":
      return <ProfileOverviewSkeleton />;
    case "records":
      return <ProfileRecordsSkeleton />;
    case "squad":
      return <ProfileSquadSkeleton />;
    case "predictions":
      return <ProfilePredictionsSkeleton />;
    case "achievements":
      return <ProfileAchievementsSkeleton />;
    default:
      return <ProfileOverviewSkeleton />;
  }
}
