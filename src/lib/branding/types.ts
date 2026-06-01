export interface AppBranding {
  appName: string;
  appShortName: string;
  /** null = no logo.png in public/ — show placeholder */
  logoSrc: string | null;
  /** null = no icon.png or logo.png — use default favicon */
  iconSrc: string | null;
}
