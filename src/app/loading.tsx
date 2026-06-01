import { getBranding } from "@/lib/branding/get-branding";
import { AppLogoStatic } from "@/components/branding/app-logo";
import { WorldCupBackground } from "@/components/design/world-cup-background";

export default async function Loading() {
  const branding = await getBranding();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
      <WorldCupBackground theme="auth" />
      <div className="animate-wc-float">
        <AppLogoStatic branding={branding} showName={false} size="hero" priority />
      </div>
      <p className="mt-6 text-sm text-white/45">Loading…</p>
    </div>
  );
}
