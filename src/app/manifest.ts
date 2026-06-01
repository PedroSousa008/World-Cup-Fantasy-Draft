import type { MetadataRoute } from "next";
import { getBranding } from "@/lib/branding/get-branding";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const branding = await getBranding();

  const icons = branding.iconSrc
    ? [
        { src: branding.iconSrc, sizes: "512x512", type: "image/png", purpose: "any" as const },
        { src: branding.iconSrc, sizes: "512x512", type: "image/png", purpose: "maskable" as const },
      ]
    : [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" as const }];

  return {
    name: branding.appName,
    short_name: branding.appShortName,
    description: "Private World Cup fantasy competition",
    start_url: "/",
    display: "standalone",
    background_color: "#081120",
    theme_color: "#081120",
    icons,
  };
}
