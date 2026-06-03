import { BetsSectionPrefetch } from "@/components/bets/bets-section-prefetch";

export default function BetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BetsSectionPrefetch />
      {children}
    </>
  );
}
