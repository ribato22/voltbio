/* ============================================================
   VoltBio — Utility Functions
   ============================================================ */

import { clsx, type ClassValue } from "clsx";

/** Merge class names with clsx (Tailwind-friendly) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Detect social platform icon from URL */
export function detectSocialIcon(url: string): string {
  const patterns: Record<string, string> = {
    "github.com": "github",
    "twitter.com": "twitter",
    "x.com": "twitter",
    "instagram.com": "instagram",
    "linkedin.com": "linkedin",
    "facebook.com": "facebook",
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "tiktok.com": "tiktok",
    "discord.gg": "discord",
    "discord.com": "discord",
    "t.me": "telegram",
    "telegram.me": "telegram",
    "wa.me": "whatsapp",
    "whatsapp.com": "whatsapp",
    "twitch.tv": "twitch",
    "spotify.com": "spotify",
    "open.spotify.com": "spotify",
    "medium.com": "medium",
    "dev.to": "dev",
    "dribbble.com": "dribbble",
    "behance.net": "behance",
    "figma.com": "figma",
    "notion.so": "notion",
    "reddit.com": "reddit",
    "pinterest.com": "pinterest",
    "snapchat.com": "snapchat",
    "threads.net": "threads",
    "mastodon.social": "mastodon",
    "bsky.app": "bluesky",
    "codepen.io": "codepen",
    "stackoverflow.com": "stackoverflow",
    "producthunt.com": "producthunt",
    "patreon.com": "patreon",
    "buymeacoffee.com": "coffee",
    "ko-fi.com": "coffee",
    "calendly.com": "calendar",
    "cal.com": "calendar",
    "mailto:": "mail",
  };

  try {
    const hostname = url.startsWith("mailto:")
      ? "mailto:"
      : new URL(url).hostname.replace("www.", "");

    for (const [pattern, icon] of Object.entries(patterns)) {
      if (hostname.includes(pattern)) return icon;
    }
  } catch {
    // invalid URL, use default icon
  }

  return "link";
}

/** Apply theme colors as CSS custom properties */
export function applyThemeColors(colors: Record<string, string>) {
  const root = document.documentElement;
  if (colors.background) root.style.setProperty("--lf-bg", colors.background);
  if (colors.cardBackground) root.style.setProperty("--lf-card-bg", colors.cardBackground);
  if (colors.text) root.style.setProperty("--lf-text", colors.text);
  if (colors.accent) root.style.setProperty("--lf-accent", colors.accent);
  if (colors.linkHover) root.style.setProperty("--lf-link-hover", colors.linkHover);
}

/** Sanitize URL to prevent XSS (basic CSP mitigation) */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const allowed = ["http:", "https:", "mailto:", "tel:"];
    if (!allowed.includes(parsed.protocol)) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

/** Generate a deterministic avatar placeholder */
export function getAvatarFallback(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
