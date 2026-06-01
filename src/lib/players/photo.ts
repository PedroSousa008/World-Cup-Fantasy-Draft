/**
 * Player images are stored under public/players/{nation-slug}/
 * DB photoUrl is a public path e.g. /players/portugal/mbappe.jpg
 */

export function nationImageDir(slug: string): string {
  return `players/${slug}`;
}

export function nationImagePublicPath(slug: string): string {
  return `/${nationImageDir(slug)}`;
}

/** Build a public URL for a file inside a nation's folder. */
export function buildPlayerPhotoPath(slug: string, filename: string): string {
  const clean = filename.replace(/^\/+/, "").split("/").pop() ?? filename;
  return `${nationImagePublicPath(slug)}/${clean}`;
}

/** Normalize stored photoUrl or path fragment to a browser-ready src. */
export function resolvePlayerPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl?.trim()) return null;
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
  if (photoUrl.startsWith("/")) return photoUrl;
  return `/${photoUrl.replace(/^\/+/, "")}`;
}

/** Infer nation slug from an uploaded path like players/portugal/photo.jpg */
export function slugFromPhotoPath(photoPath: string): string | null {
  const normalized = photoPath.replace(/^\/+/, "");
  const match = normalized.match(/^players\/([^/]+)\//);
  return match?.[1] ?? null;
}
