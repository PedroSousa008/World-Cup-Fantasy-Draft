"use client";

import { cn } from "@/lib/utils";
import { resolvePlayerPhotoUrl } from "@/lib/players/photo";

interface PlayerAvatarProps {
  name: string;
  photoUrl?: string | null;
  className?: string;
  initialsClassName?: string;
  /** Use native lazy loading for grid thumbnails */
  lazy?: boolean;
}

export function PlayerAvatar({
  name,
  photoUrl,
  className,
  initialsClassName,
  lazy = false,
}: PlayerAvatarProps) {
  const src = resolvePlayerPhotoUrl(photoUrl);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading={lazy ? "lazy" : undefined}
        decoding="async"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF]/20 to-[#0066FF]/5 font-black text-[#0066FF]",
        className,
        initialsClassName
      )}
    >
      {initials}
    </span>
  );
}
