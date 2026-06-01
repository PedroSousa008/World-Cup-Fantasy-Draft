import { getBranding } from "@/lib/branding/get-branding";

export async function GET() {
  const branding = await getBranding();

  if (branding.appIconUrl?.startsWith("data:image/")) {
    const [meta, base64] = branding.appIconUrl.split(",");
    const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/png";
    const buffer = Buffer.from(base64, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  if (branding.appLogoUrl?.startsWith("data:image/")) {
    const [meta, base64] = branding.appLogoUrl.split(",");
    const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/png";
    const buffer = Buffer.from(base64, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" fill="#F8F9FA"/><path d="M24 4 C34 12, 40 22, 38 32 C36 42, 28 46, 24 44 C20 46, 12 42, 10 32 C8 22, 14 12, 24 4Z" fill="#0066FF" opacity="0.85"/><path d="M8 28 C14 34, 22 38, 30 36 C38 34, 42 28, 40 22" stroke="#E53935" stroke-width="2.5" stroke-linecap="round" opacity="0.9" fill="none"/><path d="M38 18 C32 14, 26 12, 20 16 C14 20, 12 28, 16 34" stroke="#00C853" stroke-width="2" stroke-linecap="round" opacity="0.85" fill="none"/></svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
