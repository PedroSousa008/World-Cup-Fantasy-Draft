"use client";

import { ChevronDown } from "lucide-react";
import { FORMATIONS, type FormationId } from "@/lib/squad/formations";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormationSelectorProps {
  value: FormationId;
  onChange: (id: FormationId) => void;
}

export function FormationSelector({ value, onChange }: FormationSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative px-4">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
        Formation
      </p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-[48px] w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left font-bold text-white transition-all active:scale-[0.99]"
      >
        <span className="text-lg">{value}</span>
        <ChevronDown className={cn("h-5 w-5 text-white/50 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-4 right-4 z-50 mt-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1526]/95 shadow-2xl backdrop-blur-xl">
            {FORMATIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onChange(f.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full min-h-[48px] items-center justify-between px-4 py-3 text-sm font-semibold transition-colors",
                  f.id === value
                    ? "bg-[#0066FF]/20 text-[#0066FF]"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                {f.label}
                <span className="text-xs text-white/35">
                  {f.def}-{f.mid}-{f.fwd}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface TeamSummaryCardProps {
  teamName: string;
  nation: string;
  nationFlag: string;
  totalPoints: number;
  formation: string;
  playersSelected: number;
  totalSlots: number;
}

export function TeamSummaryCard({
  teamName,
  nation,
  nationFlag,
  totalPoints,
  formation,
  playersSelected,
  totalSlots,
}: TeamSummaryCardProps) {
  return (
    <div className="mx-4 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{nationFlag}</span>
            <h1 className="text-xl font-bold text-[#081120]">{teamName}</h1>
          </div>
          <p className="mt-0.5 text-sm text-[#081120]/50">{nation}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums text-[#0066FF]">
            {totalPoints.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#081120]/40">
            Points
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-full bg-[#0066FF]/10 px-3 py-1 text-xs font-bold text-[#0066FF]">
          {formation}
        </span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold",
            playersSelected === totalSlots
              ? "bg-[#00C853]/10 text-[#00A844]"
              : "bg-[#E53935]/10 text-[#E53935]"
          )}
        >
          {playersSelected}/{totalSlots} Players
        </span>
      </div>
    </div>
  );
}

export function SquadValidationBanner({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="mx-4 rounded-xl border border-[#E53935]/20 bg-[#E53935]/8 px-4 py-3">
      {warnings.slice(0, 2).map((w) => (
        <p key={w} className="text-xs font-medium text-[#E53935]">
          {w}
        </p>
      ))}
    </div>
  );
}

export function TeamStrengthSection({
  projection,
  diversity,
  strength,
}: {
  projection: number;
  diversity: number;
  strength: number;
}) {
  const bars = [
    { label: "Fantasy Projection", value: Math.min(100, Math.round(projection / 20)), display: projection },
    { label: "Nation Diversity", value: diversity, display: `${diversity}%` },
    { label: "Team Strength", value: strength, display: `${strength}/100` },
  ];

  return (
    <div className="mx-4 space-y-3 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#081120]/40">
        Team Strength
      </p>
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-[#081120]/60">{bar.label}</span>
            <span className="font-bold text-[#081120]">{bar.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#081120]/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#00C853] transition-all duration-700 ease-out"
              style={{ width: `${bar.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
