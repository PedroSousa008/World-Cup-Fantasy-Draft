"use server";

import { revalidatePath } from "next/cache";
import { registerPlayerFromFile, type RegisterPlayerInput } from "@/lib/players/register-from-file";
import { invalidateDraftCache } from "@/lib/draft/draft-cache";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";

export async function registerPlayerFromFileAction(
  input: RegisterPlayerInput
): Promise<OwnerActionResult<{ playerId: string; photoUrl: string; created: boolean }>> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  try {
    const result = await registerPlayerFromFile(input);
    invalidateDraftCache();
    revalidatePath("/owner/players");
    revalidatePath(`/owner/players/${input.nationSlug}`);
    revalidatePath("/my-team/draft");
    return {
      ok: true,
      data: {
        playerId: result.playerId,
        photoUrl: result.photoUrl,
        created: result.created,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to register player",
    };
  }
}
