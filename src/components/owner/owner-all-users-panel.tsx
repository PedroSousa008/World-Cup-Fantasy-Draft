"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { Button } from "@/components/ui/button";
import { WORLD_CUP_NATIONS } from "@/lib/nations/world-cup-nations";
import {
  deleteOwnerUserAction,
  updateOwnerUserAction,
} from "@/lib/actions/owner/users";
import type { OwnerUserRow } from "@/lib/owner/get-users-data";
import { cn } from "@/lib/utils";

interface OwnerAllUsersPanelProps {
  users: OwnerUserRow[];
}

type EditForm = {
  username: string;
  teamName: string;
  selectedNation: string;
  totalPoints: string;
};

function toEditForm(user: OwnerUserRow): EditForm {
  return {
    username: user.username,
    teamName: user.teamName,
    selectedNation: user.selectedNation,
    totalPoints: String(user.totalPoints),
  };
}

export function OwnerAllUsersPanel({ users }: OwnerAllUsersPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<OwnerUserRow | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnerUserRow | null>(null);

  const nationOptions = useMemo(
    () => WORLD_CUP_NATIONS.map((n) => n.name).sort((a, b) => a.localeCompare(b)),
    []
  );

  const openEdit = (user: OwnerUserRow) => {
    setError(null);
    setEditingUser(user);
    setEditForm(toEditForm(user));
  };

  const closeEdit = () => {
    if (pending) return;
    setEditingUser(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editingUser || !editForm) return;

    const totalPoints = Number.parseInt(editForm.totalPoints, 10);
    if (!Number.isFinite(totalPoints)) {
      setError("Total points must be a whole number.");
      return;
    }

    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await updateOwnerUserAction({
          userId: editingUser.id,
          username: editForm.username.trim(),
          teamName: editForm.teamName.trim(),
          selectedNation: editForm.selectedNation,
          totalPoints,
        });

        if (!result.ok) {
          setError(result.error ?? "Could not save changes.");
          return;
        }

        closeEdit();
        router.refresh();
      })();
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await deleteOwnerUserAction(deleteTarget.id);
        if (!result.ok) {
          setError(result.error ?? "Could not delete user.");
          return;
        }
        setDeleteTarget(null);
        router.refresh();
      })();
    });
  };

  if (users.length === 0) {
    return (
      <div className="wc-card-dark rounded-2xl px-4 py-10 text-center">
        <p className="text-sm text-white/55">No users yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && !editingUser && !deleteTarget && (
        <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">{error}</p>
      )}

      <div className="hidden overflow-hidden rounded-2xl border border-white/8 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.03] text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-semibold">User Name</th>
              <th className="px-4 py-3 font-semibold">Username</th>
              <th className="px-4 py-3 font-semibold">Team Name</th>
              <th className="px-4 py-3 font-semibold">Nation</th>
              <th className="px-4 py-3 font-semibold text-right">Points</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-white/5 bg-white/[0.02] last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-white">{user.username}</td>
                <td className="px-4 py-3 text-white/60">@{user.username}</td>
                <td className="px-4 py-3 text-white/85">{user.teamName}</td>
                <td className="px-4 py-3 text-white/70">{user.selectedNation}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#0066FF]">
                  {user.totalPoints.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(user)}
                      disabled={user.role === "OWNER"}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold",
                        user.role === "OWNER"
                          ? "cursor-not-allowed bg-white/5 text-white/25"
                          : "bg-[#E53935]/15 text-[#E53935]"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="wc-card-dark space-y-3 rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{user.username}</p>
                <p className="truncate text-xs text-white/45">@{user.username}</p>
              </div>
              <p className="shrink-0 text-lg font-black tabular-nums text-[#0066FF]">
                {user.totalPoints.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-white/40">Team</p>
                <p className="truncate font-medium text-white/85">{user.teamName}</p>
              </div>
              <div>
                <p className="text-white/40">Nation</p>
                <p className="truncate font-medium text-white/85">{user.selectedNation}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(user)}
                className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-xl bg-white/10 text-sm font-semibold text-white"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(user)}
                disabled={user.role === "OWNER"}
                className={cn(
                  "flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-xl text-sm font-semibold",
                  user.role === "OWNER"
                    ? "cursor-not-allowed bg-white/5 text-white/25"
                    : "bg-[#E53935]/15 text-[#E53935]"
                )}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <MobileFullScreenModal
        open={Boolean(editingUser && editForm)}
        onClose={closeEdit}
        title="Edit user"
        subtitle={editingUser?.teamName}
      >
        {editingUser && editForm && (
          <div className="mx-auto flex max-w-md flex-col gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                User Name
              </span>
              <input
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-[#0066FF]/50"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                Team Name
              </span>
              <input
                value={editForm.teamName}
                onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-[#0066FF]/50"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                Selected Nation
              </span>
              <select
                value={editForm.selectedNation}
                onChange={(e) =>
                  setEditForm({ ...editForm, selectedNation: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-[#0B1526] px-3 py-2.5 text-white outline-none focus:border-[#0066FF]/50"
              >
                {nationOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                Total Points
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={editForm.totalPoints}
                onChange={(e) => setEditForm({ ...editForm, totalPoints: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-[#0066FF]/50"
              />
              <p className="text-xs text-white/40">
                Automatic: {editingUser.automaticPoints.toLocaleString()} · Adjustment:{" "}
                {(
                  (Number.parseInt(editForm.totalPoints, 10) || 0) -
                  editingUser.automaticPoints
                ).toLocaleString()}
              </p>
            </label>

            {error && (
              <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={closeEdit}
                className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={saveEdit}
                className="flex-1"
              >
                {pending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </MobileFullScreenModal>

      <MobileFullScreenModal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!pending) setDeleteTarget(null);
        }}
        title="Delete account"
        subtitle={deleteTarget?.username}
      >
        {deleteTarget && (
          <div className="mx-auto flex max-w-md flex-col gap-4">
            <p className="text-sm text-white/70">
              Permanently delete <span className="font-semibold text-white">{deleteTarget.username}</span>{" "}
              and all their data? This cannot be undone.
            </p>

            {error && (
              <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={confirmDelete}
                className="flex-1 bg-[#E53935] hover:bg-[#C62828]"
              >
                {pending ? "Deleting…" : "Delete Account"}
              </Button>
            </div>
          </div>
        )}
      </MobileFullScreenModal>
    </div>
  );
}
