import { cache } from "react";
import { getPlatformSettings } from "@/lib/auth/permissions";
import { DEFAULT_BRANDING, type AppBranding } from "@/lib/branding/types";

export const getBranding = cache(async (): Promise<AppBranding> => {
  try {
    const settings = await getPlatformSettings();
    return {
      appName: settings.appName ?? DEFAULT_BRANDING.appName,
      appShortName: settings.appShortName ?? DEFAULT_BRANDING.appShortName,
      appLogoUrl: settings.appLogoUrl,
      appIconUrl: settings.appIconUrl,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
});
