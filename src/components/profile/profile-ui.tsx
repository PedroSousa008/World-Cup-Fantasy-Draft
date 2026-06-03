"use client";

import { cn } from "@/lib/utils";

export function ProfileSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-display text-lg text-white">{title}</h2>
        {description ? (
          <p className="text-body mt-1 text-sm text-white/50">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ProfileStatCard({
  label,
  value,
  subValue,
  accent = "blue",
}: {
  label: string;
  value: string;
  subValue?: string;
  accent?: "blue" | "green" | "gold";
}) {
  const accentClass = {
    blue: "text-[#0066FF]",
    green: "text-[#00C853]",
    gold: "text-amber-400",
  }[accent];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p>
      <p className={cn("text-display mt-2 text-2xl", accentClass)}>{value}</p>
      {subValue ? <p className="mt-1 text-xs text-white/50">{subValue}</p> : null}
    </div>
  );
}

export function ProfileRecordCard({
  title,
  primary,
  secondary,
}: {
  title: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{title}</p>
      <p className="text-display mt-2 text-lg text-white">{primary}</p>
      <p className="mt-1 text-sm text-[#0066FF]">{secondary}</p>
    </div>
  );
}

export function ProfileLeaderRow({
  label,
  name,
  nationFlag,
  stat,
  statLabel,
}: {
  label: string;
  name: string;
  nationFlag: string;
  stat: string;
  statLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
        <p className="truncate text-sm font-semibold text-white">
          {name} <span className="ml-1">{nationFlag}</span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-display text-lg text-[#0066FF]">{stat}</p>
        <p className="text-[10px] text-white/40">{statLabel}</p>
      </div>
    </div>
  );
}
