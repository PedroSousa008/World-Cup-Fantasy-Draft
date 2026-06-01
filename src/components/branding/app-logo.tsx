"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BallMark } from "@/components/design/ball-mark";
import { useBranding } from "@/contexts/branding-context";

interface AppLogoProps {
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  nameClassName?: string;
  variant?: "logo" | "icon";
}

const markSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

function LogoImage({
  src,
  alt,
  size,
  onError,
}: {
  src: string;
  alt: string;
  size: keyof typeof markSizes;
  onError?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-white/5",
        markSizes[size]
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
        onError={onError}
      />
    </div>
  );
}

export function AppLogo({
  showName = true,
  size = "md",
  className,
  nameClassName,
  variant = "logo",
}: AppLogoProps) {
  const branding = useBranding();
  const [imgFailed, setImgFailed] = useState(false);

  const src =
    variant === "icon"
      ? branding.iconSrc ?? branding.logoSrc
      : branding.logoSrc ?? branding.iconSrc;

  const showPlaceholder = !src || imgFailed;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {showPlaceholder ? (
        <BallMark size={size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
      ) : (
        <LogoImage
          src={src}
          alt={branding.appName}
          size={size}
          onError={() => setImgFailed(true)}
        />
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

export function AppLogoStatic({
  branding,
  showName = true,
  size = "md",
  className,
  nameClassName,
  variant = "logo",
}: AppLogoProps & { branding: { appName: string; appShortName: string; logoSrc: string | null; iconSrc: string | null } }) {
  const src =
    variant === "icon"
      ? branding.iconSrc ?? branding.logoSrc
      : branding.logoSrc ?? branding.iconSrc;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {src ? (
        <LogoImage src={src} alt={branding.appName} size={size} />
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
