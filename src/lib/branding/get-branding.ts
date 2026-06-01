import { APP_NAME, APP_SHORT_NAME, APP_LOGO_PATH } from "@/lib/branding/assets";
import type { AppBranding } from "@/lib/branding/types";

/**
 * Returns branding config. Logo paths always point to /public files.
 * Do NOT use fs.existsSync — public/ assets are served as static files on Vercel
 * but are not reliably readable from the serverless filesystem at runtime.
 */
export async function getBranding(): Promise<AppBranding> {
  return {
    appName: APP_NAME,
    appShortName: APP_SHORT_NAME,
    logoSrc: APP_LOGO_PATH,
    iconSrc: APP_LOGO_PATH,
  };
}
