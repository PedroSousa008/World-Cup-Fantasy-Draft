"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppBranding } from "@/lib/branding/types";

const BrandingContext = createContext<AppBranding | null>(null);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: AppBranding;
  children: ReactNode;
}) {
  return (
    <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): AppBranding {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return ctx;
}
