/* ============================================================
   VoltBio — Core Type Definitions
   ============================================================ */

/** Testimonial / Review card */
export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

/** Tab/page in the Multi-Page Hub */
export interface HubTab {
  id: string;
  label: string;
  linkIds: string[];  // ordered list of LinkItem IDs in this tab
}

/** Field definition for Smart Action Buttons */
export interface ActionField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "date" | "select";
  options?: string[];  // for "select" type
}

/** Configuration for WhatsApp template action */
export interface ActionConfig {
  whatsappNumber: string;
  messageTemplate: string;  // e.g. "Halo, saya {nama}. Booking: {layanan} tgl {tanggal}"
  fields: ActionField[];
}

/** Individual link item in the user's bio page */
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  target: "_blank" | "_self";
  /** 'link' = clickable URL, 'header' = section divider, 'action' = smart form button, 'donation' = tip jar */
  type?: "link" | "header" | "action" | "donation";
  isEmbed?: boolean;
  /** Display as inline PDF viewer */
  isPdfEmbed?: boolean;
  validFrom?: string;
  validUntil?: string;
  /** Password-protected link fields */
  isLocked?: boolean;
  encryptedUrl?: string;
  /** Smart Action Button config (WhatsApp template) */
  actionConfig?: ActionConfig;
  /** Donation block fields */
  donationPlatform?: "qris" | "saweria" | "trakteer" | "kofi" | "patreon";
  qrisImage?: string;       // Base64 compressed QRIS barcode
  donationCta?: string;     // Custom CTA text, e.g. "Traktir saya kopi ☕"
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
  /** Power-user custom CSS, scoped to #voltbio-page */
  customCSS?: string;
}

/** Complete profile configuration (top-level JSON structure) */
export interface ProfileConfig {
  version: string;
  profile: Profile;
  links: LinkItem[];
  testimonials?: Testimonial[];
  pages?: HubTab[];
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
export type EditorPanel = "profile" | "links" | "theme" | "seo" | "settings" | "testimonials" | "pages";
