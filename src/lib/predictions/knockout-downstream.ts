import { KNOCKOUT_MATCHES } from "@/lib/tournament/knockout/topology";

/** All knockout match keys downstream of a source match (including the source). */
export function getDownstreamMatchKeys(sourceMatchKey: string): string[] {
  const toClear = new Set<string>([sourceMatchKey]);
  let grew = true;

  while (grew) {
    grew = false;
    for (const def of KNOCKOUT_MATCHES) {
      if (toClear.has(def.key)) continue;
      if (
        (def.feederHomeMatchKey && toClear.has(def.feederHomeMatchKey)) ||
        (def.feederAwayMatchKey && toClear.has(def.feederAwayMatchKey))
      ) {
        toClear.add(def.key);
        grew = true;
      }
    }
  }

  return [...toClear];
}

export function getStrictDownstreamMatchKeys(sourceMatchKey: string): string[] {
  return getDownstreamMatchKeys(sourceMatchKey).filter((key) => key !== sourceMatchKey);
}
