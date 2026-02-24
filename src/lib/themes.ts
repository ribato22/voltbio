/* ============================================================
   VoltBio — Theme Presets
   ============================================================ */

import type { ThemePreset } from "@/types";

export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "Clean Slate",
    preview: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)",
    colors: {
      background: "#ffffff",
      cardBackground: "#f8fafc",
      text: "#0f172a",
      accent: "#6d28d9",
      linkHover: "#7c3aed",
    },
    font: "Inter",
    buttonStyle: "rounded",
  },
  {
    id: "midnight",
    name: "Midnight Violet",
    preview: "linear-gradient(135deg, #0c0a1a 0%, #1e1b4b 100%)",
    colors: {
      background: "#0c0a1a",
      cardBackground: "#15132b",
      text: "#e2e8f0",
      accent: "#a78bfa",
      linkHover: "#c4b5fd",
    },
    font: "Poppins",
    buttonStyle: "rounded",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    preview: "linear-gradient(135deg, #0c1222 0%, #0a2540 100%)",
    colors: {
      background: "#0c1222",
      cardBackground: "#132035",
      text: "#e0f2fe",
      accent: "#38bdf8",
      linkHover: "#7dd3fc",
    },
    font: "Space Grotesk",
    buttonStyle: "pill",
  },
  {
    id: "forest",
    name: "Emerald Forest",
    preview: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
    colors: {
      background: "#052e16",
      cardBackground: "#0d3b21",
      text: "#dcfce7",
      accent: "#34d399",
      linkHover: "#6ee7b7",
    },
    font: "DM Sans",
    buttonStyle: "rounded",
  },
  {
    id: "sunset",
    name: "Golden Sunset",
    preview: "linear-gradient(135deg, #1a0a0a 0%, #3b0e0e 100%)",
    colors: {
      background: "#1a0a0a",
      cardBackground: "#2a1515",
      text: "#fef2f2",
      accent: "#f97316",
      linkHover: "#fb923c",
    },
    font: "Outfit",
    buttonStyle: "pill",
  },
  {
    id: "neon",
    name: "Neon Nights",
    preview: "linear-gradient(135deg, #0a0a0f 0%, #150a20 100%)",
    colors: {
      background: "#0a0a0f",
      cardBackground: "#121220",
      text: "#f0f0ff",
      accent: "#e879f9",
      linkHover: "#f0abfc",
    },
    font: "Space Grotesk",
    buttonStyle: "outline",
  },
  {
    id: "minimal",
    name: "Minimal Light",
    preview: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
    colors: {
      background: "#fafafa",
      cardBackground: "#ffffff",
      text: "#171717",
      accent: "#171717",
      linkHover: "#404040",
    },
    font: "Lora",
    buttonStyle: "square",
  },
  // ── Advanced Visual Themes ──
  {
    id: "glass",
    name: "Glassmorphism",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    colors: {
      background: "#1a1a2e",
      cardBackground: "rgba(255,255,255,0.08)",
      text: "#f0f0ff",
      accent: "#818cf8",
      linkHover: "#a5b4fc",
    },
    font: "Inter",
    buttonStyle: "pill",
    themeEffect: "glassmorphism",
  },
  {
    id: "brutal",
    name: "Brutalism",
    preview: "linear-gradient(135deg, #fffbe6 0%, #fff5cc 100%)",
    colors: {
      background: "#fffbe6",
      cardBackground: "#ffffff",
      text: "#000000",
      accent: "#ff3366",
      linkHover: "#e60045",
    },
    font: "Space Mono",
    buttonStyle: "square",
    themeEffect: "brutalism",
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    preview: "linear-gradient(135deg, #0d0d0d 0%, #1a0030 100%)",
    colors: {
      background: "#0d0d0d",
      cardBackground: "#141414",
      text: "#e0ffe0",
      accent: "#00ff88",
      linkHover: "#33ffaa",
    },
    font: "Orbitron",
    buttonStyle: "outline",
    themeEffect: "neon-glow",
  },
  {
    id: "paper",
    name: "Minimal Paper",
    preview: "linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%)",
    colors: {
      background: "#faf8f5",
      cardBackground: "#ffffff",
      text: "#2c2c2c",
      accent: "#8b7355",
      linkHover: "#6b5940",
    },
    font: "Lora",
    buttonStyle: "rounded",
    themeEffect: "paper",
  },
  {
    id: "retrowave",
    name: "Retrowave",
    preview: "linear-gradient(135deg, #2b1055 0%, #d53a9d 50%, #ff6e7a 100%)",
    colors: {
      background: "#1a0a2e",
      cardBackground: "#250e42",
      text: "#fce4ec",
      accent: "#ff4081",
      linkHover: "#ff80ab",
    },
    font: "Rajdhani",
    buttonStyle: "pill",
    themeEffect: "retrowave",
  },
];

export function getThemePreset(id: string): ThemePreset | undefined {
  return themePresets.find((t) => t.id === id);
}
