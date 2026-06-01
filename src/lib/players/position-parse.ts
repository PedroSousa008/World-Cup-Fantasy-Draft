import type { PlayerPosition } from "@/lib/players/types";
import { isValidPlayerPosition } from "@/lib/players/types";

/** Parse "Goalkeeper", "GK", "Attacker", etc. into a locked position code. */
export function parsePositionInput(input: string): PlayerPosition | null {
  const raw = input.trim();
  if (isValidPlayerPosition(raw)) return raw;

  const s = raw.toLowerCase();
  if (s.includes("goal") || s === "gk" || s === "gkp") return "GK";
  if (s.includes("defen") || s === "def" || s === "cb" || s === "lb" || s === "rb") return "DEF";
  if (s.includes("mid") || s === "cm" || s === "dm" || s === "am") return "MID";
  if (s.includes("attack") || s.includes("strik") || s === "fwd" || s === "fw") return "FWD";

  return null;
}
