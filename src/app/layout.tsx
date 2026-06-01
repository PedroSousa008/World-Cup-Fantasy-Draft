import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { BrandingProvider } from "@/contexts/branding-context";
import { getBranding } from "@/lib/branding/get-branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  return {
    title: branding.appName,
    description: "Private World Cup fantasy competition for friends",
    icons: branding.iconSrc
      ? { icon: branding.iconSrc, apple: branding.iconSrc }
      : { icon: "/favicon.svg" },
    appleWebApp: {
      title: branding.appShortName,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#081120",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBranding();

  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden font-sans antialiased`}
      >
        <BrandingProvider branding={branding}>
          <SessionProvider>{children}</SessionProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
