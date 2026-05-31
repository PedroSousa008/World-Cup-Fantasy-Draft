"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-2xl bg-white/10 p-1 scrollbar-none",
        "snap-x snap-mandatory",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-[44px] flex-1 snap-center whitespace-nowrap rounded-xl px-4 py-2.5",
              "text-sm font-semibold transition-all duration-300",
              "active:scale-[0.97]",
              isActive
                ? "bg-white text-[#081120] shadow-sm"
                : "text-white/60 hover:text-white/80"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface PillTabsProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Horizontally scrollable pill tabs for filters */
export function PillTabs({ options, value, onChange, className }: PillTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scrollbar-none",
        "snap-x snap-mandatory",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-[44px] shrink-0 snap-start rounded-full px-5 py-2",
              "text-sm font-semibold transition-all duration-200",
              "active:scale-[0.96]",
              isActive
                ? "bg-[#0066FF] text-white shadow-[0_4px_16px_rgba(0,102,255,0.35)]"
                : "bg-white/10 text-white/70"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
