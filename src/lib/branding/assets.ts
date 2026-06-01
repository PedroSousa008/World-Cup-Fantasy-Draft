/**
 * App logo & icon — file-based, NOT stored in the database.
 *
 * Drop your files here (project root):
 *
 *   public/logo.png   ← main logo (header, login, profile, etc.)
 *   public/icon.png   ← optional favicon / PWA icon (square, 512×512 recommended)
 *
 * If icon.png is missing, logo.png is used for the favicon too.
 * If logo.png is missing, the default ball placeholder is shown.
 */

export const APP_LOGO_FILE = "logo.png";
export const APP_ICON_FILE = "icon.png";

/** URL paths served by Next.js from /public */
export const APP_LOGO_PATH = "/logo.png";
export const APP_ICON_PATH = "/icon.png";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "World Cup Fantasy Draft 2026";
export const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME ?? "WC Fantasy Draft";

/** Absolute filesystem location (for server-side existence checks) */
export function getLogoFilePath(cwd = process.cwd()) {
  return `${cwd}/public/${APP_LOGO_FILE}`;
}

export function getIconFilePath(cwd = process.cwd()) {
  return `${cwd}/public/${APP_ICON_FILE}`;
}
