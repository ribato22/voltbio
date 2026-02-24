/* ============================================================
   VoltBio — Theme Effect CSS Generator
   Pure CSS-only visual effects for advanced themes.
   Used by both BioPage (live) and export (static HTML).
   ============================================================ */

import type { ThemeConfig } from "@/types";

export type ThemeEffect = NonNullable<ThemeConfig["themeEffect"]>;

/**
 * Returns additional inline CSS styles for link cards
 * based on the active theme effect. Pure CSS, no JS runtime.
 */
export function getCardEffectStyles(
  effect: ThemeEffect | undefined,
  accent: string
): React.CSSProperties {
  switch (effect) {
    case "glassmorphism":
      return {
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      };
    case "brutalism":
      return {
        border: `3px solid #000`,
        boxShadow: "4px 4px 0px #000",
        borderRadius: "0px",
      };
    case "neon-glow":
      return {
        border: `1px solid ${accent}60`,
        boxShadow: `0 0 15px ${accent}30, 0 0 30px ${accent}15, inset 0 0 15px ${accent}08`,
      };
    case "paper":
      return {
        border: "1px solid #e8e0d4",
        boxShadow: "2px 2px 8px rgba(139,115,85,0.1)",
      };
    case "retrowave":
      return {
        borderBottom: `2px solid ${accent}`,
        boxShadow: `0 4px 20px ${accent}25`,
        background: `linear-gradient(180deg, ${accent}10, transparent)`,
      };
    default:
      return {};
  }
}

/**
 * Returns CSS string for <style> block in exported HTML.
 * Applies effect-specific overrides to .link-card elements.
 */
export function getEffectCSSForExport(
  effect: ThemeEffect | undefined,
  accent: string
): string {
  switch (effect) {
    case "glassmorphism":
      return `
        .link-card {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.15) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }`;
    case "brutalism":
      return `
        .link-card {
          border: 3px solid #000 !important;
          box-shadow: 4px 4px 0px #000;
          border-radius: 0px !important;
        }
        .link-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000;
        }`;
    case "neon-glow":
      return `
        .link-card {
          border: 1px solid ${accent}60 !important;
          box-shadow: 0 0 15px ${accent}30, 0 0 30px ${accent}15, inset 0 0 15px ${accent}08;
        }
        .link-card:hover {
          box-shadow: 0 0 20px ${accent}50, 0 0 40px ${accent}25, inset 0 0 20px ${accent}12;
        }`;
    case "paper":
      return `
        .link-card {
          border: 1px solid #e8e0d4 !important;
          box-shadow: 2px 2px 8px rgba(139,115,85,0.1);
        }`;
    case "retrowave":
      return `
        .link-card {
          border-bottom: 2px solid ${accent} !important;
          box-shadow: 0 4px 20px ${accent}25;
          background: linear-gradient(180deg, ${accent}10, transparent) !important;
        }`;
    default:
      return "";
  }
}
