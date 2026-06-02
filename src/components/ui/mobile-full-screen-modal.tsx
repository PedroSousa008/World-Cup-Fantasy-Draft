"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileFullScreenModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/** Fixed viewport overlay portaled to document.body — always visible regardless of scroll. */
export function MobileFullScreenModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: MobileFullScreenModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#081120]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className="wc-glass flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          {subtitle && <p className="text-xs text-white/45">{subtitle}</p>}
          <h2 className="truncate text-lg font-bold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4",
          "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
