import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "World Cup Fantasy Draft",
    short_name: "WC Fantasy",
    description: "Private World Cup fantasy competition",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#059669",
  };
}
