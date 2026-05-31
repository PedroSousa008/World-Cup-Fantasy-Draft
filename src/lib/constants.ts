export const NATIONS = [
  "Argentina",
  "Australia",
  "Belgium",
  "Brazil",
  "Canada",
  "Colombia",
  "Croatia",
  "England",
  "France",
  "Germany",
  "Italy",
  "Japan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "Portugal",
  "Spain",
  "USA",
  "Uruguay",
] as const;

export type Nation = (typeof NATIONS)[number];

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "World Cup Fantasy Draft";
