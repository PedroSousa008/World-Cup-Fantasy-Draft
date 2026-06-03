"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/lib/actions/profile";
import { invalidateProfileTabCache } from "@/lib/profile/profile-cache";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileEditDialogProps {
  username: string;
  teamName: string;
  onSaved?: () => void;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-white/15 bg-[#0B1526] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#0066FF] focus:outline-none focus:ring-1 focus:ring-[#0066FF]";

export function ProfileEditDialog({
  username: initialUsername,
  teamName: initialTeamName,
  onSaved,
}: ProfileEditDialogProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [teamName, setTeamName] = useState(initialTeamName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openDialog = () => {
    setUsername(initialUsername);
    setTeamName(initialTeamName);
    setError(null);
    setOpen(true);
  };

  const save = () => {
    setError(null);
    startTransition(() => {
      void updateProfileAction({ username, teamName }).then(async (result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        invalidateProfileTabCache();
        await updateSession({ username: result.username, teamName: result.teamName });
        setOpen(false);
        onSaved?.();
        router.refresh();
      });
    });
  };

  return (
    <>
      <Button variant="secondary" size="sm" className="shrink-0 gap-2" onClick={openDialog}>
        <Pencil className="h-3.5 w-3.5" />
        Edit Profile
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !pending && setOpen(false)}
          />
          <div
            className={cn(
              "relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#081120] p-5 shadow-2xl",
              "animate-in fade-in slide-in-from-bottom-4 duration-200"
            )}
          >
            <h3 className="text-display text-lg text-white">Edit Profile</h3>
            <p className="mt-1 text-sm text-white/50">
              Changes sync across the app automatically.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  Username
                </span>
                <input
                  className={INPUT_CLASS}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={32}
                  disabled={pending}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  Team Name
                </span>
                <input
                  className={INPUT_CLASS}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  maxLength={64}
                  disabled={pending}
                />
              </label>
              {error ? <p className="text-sm text-[#E53935]">{error}</p> : null}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={save}
                isLoading={pending}
                disabled={pending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
