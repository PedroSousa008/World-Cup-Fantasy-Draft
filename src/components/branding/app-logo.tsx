"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BallMark } from "@/components/design/ball-mark";
import { useBranding } from "@/contexts/branding-context";
import { APP_LOGO_PATH } from "@/lib/branding/assets";

interface AppLogoProps {
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  nameClassName?: string;
  variant?: "logo" | "icon";
  priority?: boolean;
}

const markSizes = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-28 w-28",
  hero: "h-40 w-40 sm:h-48 sm:w-48",
};

function resolveSrc(
  branding: { logoSrc: string | null; iconSrc: string | null },
  variant: "logo" | "icon"
) {
  if (variant === "icon") {
    return branding.iconSrc ?? APP_LOGO_PATH;
  }
  return branding.logoSrc ?? APP_LOGO_PATH;
}

function LogoImage({
  src,
  alt,
  size,
  priority,
  onError,
}: {
  src: string;
  alt: string;
  size: keyof typeof markSizes;
  priority?: boolean;
  onError?: () => void;
}) {
  return (
    <div className={cn("relative shrink-0", markSizes[size])}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="h-full w-full object-contain"
        onError={onError}
      />
    </div>
  );
}

export function AppLogo({
  showName = false,
  size = "md",
  className,
  nameClassName,
  variant = "logo",
  priority = false,
}: AppLogoProps) {
  const branding = useBranding();
  const [imgFailed, setImgFailed] = useState(false);
  const src = resolveSrc(branding, variant);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {imgFailed ? (
        <BallMark size={size === "hero" || size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
      ) : (
        <LogoImage
          src={src}
          alt={branding.appName}
          size={size}
          priority={priority}
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
  showName = false,
  size = "md",
  className,
  nameClassName,
  variant = "logo",
  priority = false,
}: AppLogoProps & {
  branding: {
    appName: string;
    appShortName: string;
    logoSrc: string | null;
    iconSrc: string | null;
  };
}) {
  const src = resolveSrc(branding, variant);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoImage src={src} alt={branding.appName} size={size} priority={priority} />
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

export { APP_LOGO_PATH };
