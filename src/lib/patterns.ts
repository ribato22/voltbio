/* ============================================================
   VoltBio — Background Pattern Definitions

   Pure CSS patterns using background-image gradients.
   No images, no libraries, no external dependencies.
   ============================================================ */

import type { ThemeConfig } from "@/types";

export type PatternId = ThemeConfig["backgroundPattern"];

export interface PatternDef {
  id: PatternId;
  label: string;
  emoji: string;
  /** Generate the CSS `background` value (including background-color) */
  getCSS: (bgColor: string, accentColor: string) => string;
  /** Extra CSS properties (e.g. background-size, animation) */
  getExtra: (bgColor: string, accentColor: string) => string;
}

/**
 * Returns a subtle semi-transparent version of a hex color.
 * Used to make pattern overlays subtle against the background.
 */
function subtle(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export const backgroundPatterns: PatternDef[] = [
  {
    id: "none",
    label: "Solid",
    emoji: "🎨",
    getCSS: (bg) => bg,
    getExtra: () => "",
  },
  {
    id: "dots",
    label: "Dots",
    emoji: "⚫",
    getCSS: (bg, accent) =>
      `radial-gradient(circle, ${subtle(accent, 0.12)} 1px, transparent 1px), ${bg}`,
    getExtra: () => "background-size: 24px 24px;",
  },
  {
    id: "grid",
    label: "Grid",
    emoji: "🔲",
    getCSS: (bg, accent) => {
      const lineColor = subtle(accent, 0.08);
      return `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px), ${bg}`;
    },
    getExtra: () => "background-size: 32px 32px;",
  },
  {
    id: "gradient",
    label: "Gradient",
    emoji: "🌈",
    getCSS: (bg, accent) => {
      const c1 = subtle(accent, 0.15);
      const c2 = subtle(accent, 0.05);
      return `linear-gradient(135deg, ${c1} 0%, ${bg} 50%, ${c2} 100%)`;
    },
    getExtra: () =>
      "background-size: 400% 400%; animation: lf-gradient-shift 8s ease infinite;",
  },
  {
    id: "noise",
    label: "Noise",
    emoji: "✨",
    getCSS: (bg, accent) => {
      const c = subtle(accent, 0.06);
      // Cross-hatch pattern that mimics texture/noise
      return `repeating-linear-gradient(45deg, transparent, transparent 2px, ${c} 2px, ${c} 3px), repeating-linear-gradient(-45deg, transparent, transparent 2px, ${c} 2px, ${c} 3px), ${bg}`;
    },
    getExtra: () => "background-size: 8px 8px;",
  },
];

/** Get a pattern definition by ID */
export function getPattern(id: PatternId): PatternDef {
  return backgroundPatterns.find((p) => p.id === id) || backgroundPatterns[0];
}

/**
 * CSS keyframes for the animated gradient pattern.
 * This needs to be injected once into the document or exported HTML.
 */
export const gradientKeyframes = `
@keyframes lf-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
