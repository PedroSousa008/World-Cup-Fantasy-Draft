import type { MetadataRoute } from "next";
import { getBranding } from "@/lib/branding/get-branding";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const branding = await getBranding();

  return {
    name: branding.appName,
    short_name: branding.appShortName,
    description: "Private World Cup fantasy competition",
    start_url: "/",
    display: "standalone",
    background_color: "#081120",
    theme_color: "#081120",
    icons: [
      {
        src: "/api/branding/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/branding/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
