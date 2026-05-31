import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup Fantasy Draft",
  description: "Private World Cup Fantasy Draft competition for friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
