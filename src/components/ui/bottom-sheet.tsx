"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Portaled bottom sheet — always visible in viewport regardless of scroll containers. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleEscape]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className={cn("fixed inset-0 z-[200] flex items-end justify-center", className)}>
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#081120]/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-lg rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(8,17,32,0.2)]",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "max-h-[88dvh] overflow-y-auto overscroll-contain",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <div className="sticky top-0 z-10 flex flex-col items-center bg-white pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-[#081120]/15" />
          {title && (
            <h2 className="mt-3 px-6 text-lg font-bold text-[#081120]">{title}</h2>
          )}
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
