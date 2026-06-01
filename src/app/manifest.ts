import type { MetadataRoute } from "next";
import { APP_LOGO_PATH, APP_NAME, APP_SHORT_NAME } from "@/lib/branding/assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: "Private World Cup fantasy competition",
    start_url: "/",
    display: "standalone",
    background_color: "#081120",
    theme_color: "#081120",
    icons: [
      {
        src: APP_LOGO_PATH,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_LOGO_PATH,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
