export interface AppBranding {
  appName: string;
  appShortName: string;
  appLogoUrl: string | null;
  appIconUrl: string | null;
}

export const DEFAULT_BRANDING: AppBranding = {
  appName: "World Cup Fantasy Draft",
  appShortName: "WC Fantasy",
  appLogoUrl: null,
  appIconUrl: null,
};
