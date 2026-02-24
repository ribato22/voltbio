/* ============================================================
   VoltBio — Core Type Definitions
   ============================================================ */

/** Individual link item in the user's bio page */
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  target: "_blank" | "_self";
  isEmbed?: boolean;
  validFrom?: string;
  validUntil?: string;
}

/** User profile information */
export interface Profile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  location?: string;
  phone?: string;
  email?: string;
}

/** Theme color configuration */
export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  accent: string;
  linkHover: string;
}

/** Theme configuration */
export interface ThemeConfig {
  preset: string;
  mode: "light" | "dark" | "system";
  colors: ThemeColors;
  font: string;
  buttonStyle: "rounded" | "pill" | "square" | "outline";
  animation: "none" | "fade-up" | "slide-in" | "scale";
  backgroundPattern: "none" | "dots" | "grid" | "gradient" | "noise";
}

/** SEO configuration */
export interface SeoConfig {
  title: string;
  description: string;
  ogImage?: string;
  favicon?: string;
}

/** Application settings */
export interface AppSettings {
  showFooter: boolean;
  footerText: string;
  analyticsId?: string;
  locale: "en" | "id";
}

/** Complete profile configuration (top-level JSON structure) */
export interface ProfileConfig {
  version: string;
  profile: Profile;
  links: LinkItem[];
  theme: ThemeConfig;
  seo: SeoConfig;
  settings: AppSettings;
}

/** Named theme preset */
export interface ThemePreset {
  id: string;
  name: string;
  preview: string;
  colors: ThemeColors;
  font: string;
  buttonStyle: ThemeConfig["buttonStyle"];
}

/** Editor active panel */
export type EditorPanel = "profile" | "links" | "theme" | "seo" | "settings";
