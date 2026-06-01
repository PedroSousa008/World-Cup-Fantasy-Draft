import type { PowerType } from "@prisma/client";

export interface PowerDefinition {
  type: PowerType;
  name: string;
  icon: string;
  description: string;
}

export const POWER_CATALOG: PowerDefinition[] = [
  {
    type: "DOUBLE_POINTS",
    name: "Double Points",
    icon: "✖️2",
    description: "One player from your squad scores double points for a selected matchday.",
  },
  {
    type: "TRIPLE_CAPTAIN",
    name: "Triple Captain",
    icon: "👑",
    description: "Your captain scores triple points instead of double for one matchday.",
  },
  {
    type: "RIVAL_CHALLENGE",
    name: "Rival Challenge",
    icon: "⚔️",
    description:
      "Challenge another manager for one matchday. Winner keeps full points and gains half of the loser's matchday points.",
  },
  {
    type: "LUCKY_DIP",
    name: "Lucky Dip",
    icon: "🎲",
    description:
      "Randomly swap one of your players with a random player from another manager's team. The swap is permanent.",
  },
  {
    type: "WILDCARD",
    name: "Wildcard",
    icon: "🃏",
    description:
      "Unlimited free transfers from unassigned draft players for one matchday, until that matchday starts.",
  },
  {
    type: "CURSE",
    name: "Curse",
    icon: "☠️",
    description:
      "Secretly halve one opponent's player points for a matchday. They are notified after the matchday ends.",
  },
];

export function getPowerDefinition(type: PowerType): PowerDefinition {
  return POWER_CATALOG.find((p) => p.type === type) ?? POWER_CATALOG[0];
}
