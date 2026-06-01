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

/** Outer circle + inner padding tuned so the full logo artwork fits without clipping */
const frameSizes = {
  sm: { box: "h-9 w-9", pad: "p-[3px]" },
  md: { box: "h-12 w-12", pad: "p-1" },
  lg: { box: "h-[72px] w-[72px]", pad: "p-1.5" },
  xl: { box: "h-32 w-32", pad: "p-2" },
  hero: { box: "h-44 w-44 sm:h-52 sm:w-52", pad: "p-2.5 sm:p-3" },
} as const;

const ballMarkSizes = {
  sm: "sm" as const,
  md: "sm" as const,
  lg: "md" as const,
  xl: "lg" as const,
  hero: "lg" as const,
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

function LogoFrame({
  size,
  children,
  className,
}: {
  size: keyof typeof frameSizes;
  children: React.ReactNode;
  className?: string;
}) {
  const { box, pad } = frameSizes[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.25)]",
        "ring-2 ring-white/15 ring-offset-2 ring-offset-[#081120]/0",
        box,
        className
      )}
    >
      <div className={cn("flex h-full w-full items-center justify-center", pad)}>
        {children}
      </div>
    </div>
  );
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
  size: keyof typeof frameSizes;
  priority?: boolean;
  onError?: () => void;
}) {
  return (
    <LogoFrame size={size}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="h-full w-full object-contain"
        onError={onError}
      />
    </LogoFrame>
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
        <LogoFrame size={size}>
          <BallMark size={ballMarkSizes[size]} className="h-full w-full" />
        </LogoFrame>
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
