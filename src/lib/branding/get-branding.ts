import { cache } from "react";
import { existsSync } from "fs";
import {
  APP_NAME,
  APP_SHORT_NAME,
  APP_LOGO_PATH,
  APP_ICON_PATH,
  getLogoFilePath,
  getIconFilePath,
} from "@/lib/branding/assets";
import type { AppBranding } from "@/lib/branding/types";

export const getBranding = cache(async (): Promise<AppBranding> => {
  const hasLogo = existsSync(getLogoFilePath());
  const hasIcon = existsSync(getIconFilePath());

  return {
    appName: APP_NAME,
    appShortName: APP_SHORT_NAME,
    logoSrc: hasLogo ? APP_LOGO_PATH : null,
    iconSrc: hasIcon ? APP_ICON_PATH : hasLogo ? APP_LOGO_PATH : null,
  };
});
