"use client";

import {
  Globe,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Music,
  PenTool,
  BookOpen,
  Coffee,
  Calendar,
  Mail,
  Link as LinkIcon,
  ExternalLink,
  Code,
  Camera,
  Heart,
} from "lucide-react";
import {
  WhatsAppIcon,
  TikTokIcon,
  SpotifyIcon,
  DiscordIcon,
  TelegramIcon,
  RedditIcon,
  PinterestIcon,
  ThreadsIcon,
  BlueskyIcon,
} from "@/components/preview/BrandIcons";
import { cn } from "@/lib/utils";

/**
 * Map from detected icon key → React component.
 *
 * Key platforms use real brand SVGs from BrandIcons.tsx.
 * Others use Lucide icons as a sensible fallback.
 */
const iconMap: Record<string, React.ReactNode> = {
  // ── Brand SVGs (recognizable silhouettes) ──
  whatsapp: <WhatsAppIcon />,
  tiktok: <TikTokIcon />,
  spotify: <SpotifyIcon />,
  discord: <DiscordIcon />,
  telegram: <TelegramIcon />,
  reddit: <RedditIcon />,
  pinterest: <PinterestIcon />,
  threads: <ThreadsIcon />,
  bluesky: <BlueskyIcon />,

  // ── Lucide icons (already recognizable) ──
  globe: <Globe />,
  github: <Github />,
  twitter: <Twitter />,
  instagram: <Instagram />,
  linkedin: <Linkedin />,
  facebook: <Facebook />,
  youtube: <Youtube />,

  // ── Lucide fallbacks for niche platforms ──
  twitch: <Music />,
  medium: <BookOpen />,
  dev: <Code />,
  dribbble: <PenTool />,
  behance: <PenTool />,
  figma: <PenTool />,
  notion: <BookOpen />,
  snapchat: <Camera />,
  mastodon: <Globe />,
  codepen: <Code />,
  stackoverflow: <Code />,
  producthunt: <ExternalLink />,
  patreon: <Heart />,
  coffee: <Coffee />,
  calendar: <Calendar />,
  mail: <Mail />,
  link: <LinkIcon />,
};

/**
 * Brand colors per social platform (used for hover tints).
 */
const brandColors: Record<string, string> = {
  github: "#6e5494",
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  youtube: "#FF0000",
  spotify: "#1DB954",
  discord: "#5865F2",
  telegram: "#26A5E4",
  whatsapp: "#25D366",
  twitch: "#9146FF",
  tiktok: "#000000",
  reddit: "#FF4500",
  dribbble: "#EA4C89",
  figma: "#F24E1E",
  bluesky: "#0085FF",
  mastodon: "#6364FF",
  threads: "#000000",
  medium: "#000000",
  pinterest: "#E60023",
  patreon: "#FF424D",
};

interface SocialIconProps {
  /** The detected icon key from `detectSocialIcon()` */
  iconKey: string;
  /** Icon size in pixels */
  size?: number;
  /** Additional class names */
  className?: string;
  /** Whether to show brand color on hover */
  brandHover?: boolean;
}

export function SocialIcon({
  iconKey,
  size = 20,
  className,
  brandHover = false,
}: SocialIconProps) {
  const icon = iconMap[iconKey] || iconMap.link;
  const color = brandColors[iconKey];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 transition-colors duration-200",
        brandHover && color && "hover:opacity-90",
        className
      )}
      style={{
        width: size,
        height: size,
        ...(brandHover && color ? { "--brand-color": color } as React.CSSProperties : {}),
      }}
      role="img"
      aria-label={`${iconKey} icon`}
    >
      <span
        className="[&>svg]:w-full [&>svg]:h-full"
        style={{ width: size, height: size }}
      >
        {icon}
      </span>
    </span>
  );
}

/**
 * Convenience: auto-detect icon from URL and render it.
 */
export { SocialIcon as default };
