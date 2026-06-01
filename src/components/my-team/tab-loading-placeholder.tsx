"use client";

export function TabLoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center px-4 pb-8">
      <p className="text-sm font-medium text-white/45">Loading {label}…</p>
    </div>
  );
}
