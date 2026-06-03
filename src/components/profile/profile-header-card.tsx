"use client";

import type { ProfileHeader } from "@/lib/profile/types";
import { ProfileEditDialog } from "@/components/profile/profile-edit-dialog";

interface ProfileHeaderCardProps {
  header: ProfileHeader;
  onUpdated?: () => void;
}

export function ProfileHeaderCard({ header, onUpdated }: ProfileHeaderCardProps) {
  const rankLabel = header.rank != null ? `#${header.rank} Overall` : "Unranked";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1526] via-[#081120] to-[#0a1628] p-6 backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#0066FF]/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#00C853]/8 blur-2xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-display text-2xl text-white sm:text-3xl">
            {header.username}{" "}
            <span className="ml-1 text-2xl sm:text-3xl" aria-hidden>
              {header.nationFlag}
            </span>
          </p>
          <p className="text-lg font-medium text-white/85">{header.teamName}</p>
          <p className="text-sm font-semibold text-[#0066FF]">{rankLabel}</p>
          <p className="text-display text-3xl text-white">
            {header.totalPoints.toLocaleString()}{" "}
            <span className="text-base font-normal text-white/45">Points</span>
          </p>
        </div>

        <ProfileEditDialog
          username={header.username}
          teamName={header.teamName}
          onSaved={onUpdated}
        />
      </div>
    </div>
  );
}
