"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlayerAction, uploadPlayerPhotoAction } from "@/lib/actions/owner/players";
import { PLAYER_POSITIONS } from "@/lib/players/types";
import { Button } from "@/components/ui/button";

interface CreatePlayerFormProps {
  nationSlug: string;
  nationName: string;
}

export function CreatePlayerForm({ nationSlug, nationName }: CreatePlayerFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState<string>("FWD");
  const [club, setClub] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        const created = await createPlayerAction({
          name,
          position,
          nationSlug,
          club: club || undefined,
        });

        if (!created.ok) {
          setError(created.error);
          return;
        }

        if (file && created.data?.playerId) {
          const fd = new FormData();
          fd.set("playerId", created.data.playerId);
          fd.set("file", file);
          const uploaded = await uploadPlayerPhotoAction(fd);
          if (!uploaded.ok) {
            setError(uploaded.error);
            return;
          }
        }

        setName("");
        setClub("");
        setFile(null);
        router.refresh();
      })();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5"
    >
      <h3 className="font-bold text-[#081120]">Add player — {nationName}</h3>
      <p className="text-xs text-[#081120]/50">
        Position is locked at creation. Image saves to{" "}
        <code className="rounded bg-[#081120]/5 px-1">players/{nationSlug}/</code>
      </p>

      {error && (
        <p className="rounded-lg bg-[#E53935]/10 px-3 py-2 text-xs text-[#E53935]">{error}</p>
      )}

      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Player name"
        className="h-11 w-full rounded-xl border border-[#081120]/10 px-3 text-sm text-[#081120]"
      />

      <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="h-11 w-full rounded-xl border border-[#081120]/10 px-3 text-sm text-[#081120]"
      >
        {PLAYER_POSITIONS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <input
        value={club}
        onChange={(e) => setClub(e.target.value)}
        placeholder="Club (optional)"
        className="h-11 w-full rounded-xl border border-[#081120]/10 px-3 text-sm text-[#081120]"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-xs text-[#081120]/60"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create player"}
      </Button>
    </form>
  );
}
