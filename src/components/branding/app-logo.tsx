"use client";

import { useState } from "react";
import Image from "next/image";
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
  sm: { class: "h-9 w-9", px: 36 },
  md: { class: "h-11 w-11", px: 44 },
  lg: { class: "h-16 w-16", px: 64 },
  xl: { class: "h-28 w-28", px: 112 },
  hero: { class: "h-40 w-40 sm:h-48 sm:w-48", px: 192 },
};

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
  const { class: sizeClass, px } = markSizes[size];

  return (
    <div className={cn("relative shrink-0", sizeClass)}>
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        priority={priority}
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
  priority = false,
}: AppLogoProps) {
  const branding = useBranding();
  const [imgFailed, setImgFailed] = useState(false);

  const src =
    variant === "icon"
      ? branding.iconSrc ?? branding.logoSrc
      : branding.logoSrc ?? branding.iconSrc;

  const showPlaceholder = !src || imgFailed;
  // Full logo already contains the app name — hide redundant text
  const displayName = showName && !branding.logoSrc;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {showPlaceholder ? (
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
      {displayName && (
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
  priority = false,
}: AppLogoProps & {
  branding: {
    appName: string;
    appShortName: string;
    logoSrc: string | null;
    iconSrc: string | null;
  };
}) {
  const src =
    variant === "icon"
      ? branding.iconSrc ?? branding.logoSrc
      : branding.logoSrc ?? branding.iconSrc;

  const displayName = showName && !branding.logoSrc;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {src ? (
        <LogoImage src={src} alt={branding.appName} size={size} priority={priority} />
      ) : (
        <BallMark size={size === "hero" || size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
      )}
      {displayName && (
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

/** Direct path fallback for cases that don't need server branding check */
export { APP_LOGO_PATH };
