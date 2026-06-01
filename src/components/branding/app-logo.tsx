"use client";

import { cn } from "@/lib/utils";
import { BallMark } from "@/components/design/ball-mark";
import { useBranding } from "@/contexts/branding-context";

interface AppLogoProps {
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  nameClassName?: string;
  /** Use icon asset when true, otherwise full logo */
  variant?: "logo" | "icon";
}

const markSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

export function AppLogo({
  showName = true,
  size = "md",
  className,
  nameClassName,
  variant = "logo",
}: AppLogoProps) {
  const branding = useBranding();
  const imageUrl =
    variant === "icon"
      ? branding.appIconUrl ?? branding.appLogoUrl
      : branding.appLogoUrl ?? branding.appIconUrl;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {imageUrl ? (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl bg-white/5",
            markSizes[size]
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={branding.appName}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <BallMark size={size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
      )}
      {showName && (
        <span
          className={cn(
            "truncate text-display text-base font-bold tracking-tight text-white sm:text-lg",
            nameClassName
          )}
        >
          {branding.appShortName || branding.appName}
        </span>
      )}
    </div>
  );
}

/** Server-safe logo for pages without client provider */
export function AppLogoStatic({
  branding,
  showName = true,
  size = "md",
  className,
  nameClassName,
  variant = "logo",
}: AppLogoProps & { branding: { appName: string; appShortName: string; appLogoUrl: string | null; appIconUrl: string | null } }) {
  const imageUrl =
    variant === "icon"
      ? branding.appIconUrl ?? branding.appLogoUrl
      : branding.appLogoUrl ?? branding.appIconUrl;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {imageUrl ? (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl bg-white/5",
            markSizes[size]
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={branding.appName}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <BallMark size={size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
      )}
      {showName && (
        <span
          className={cn(
            "truncate text-display text-base font-bold tracking-tight text-white sm:text-lg",
            nameClassName
          )}
        >
          {branding.appShortName || branding.appName}
        </span>
      )}
    </div>
  );
}
