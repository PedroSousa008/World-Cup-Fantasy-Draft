import type { PlayerPosition } from "@/lib/players/types";

/**
 * A player's position is fixed at creation. Squad slots, draft filters,
 * and substitutions must match this position.
 */
export function assertPositionMatch(
  playerPosition: PlayerPosition,
  requiredPosition: PlayerPosition
): { ok: true } | { ok: false; error: string } {
  if (playerPosition === requiredPosition) return { ok: true };
  return {
    ok: false,
    error: `This player is locked as ${playerPosition} and cannot be used as ${requiredPosition}.`,
  };
}
