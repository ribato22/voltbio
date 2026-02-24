"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { loadGoogleFont, getFontFallback } from "@/lib/fonts";
import type { ThemeColors } from "@/types";

/**
 * Maps theme color keys → CSS custom property names on `:root`.
 */
const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  background: "--lf-bg",
  cardBackground: "--lf-card-bg",
  text: "--lf-text",
  accent: "--lf-accent",
  linkHover: "--lf-link-hover",
};

/**
 * Hook: syncs Zustand theme state → CSS custom properties in real-time.
 *
 * Every time `config.theme.colors`, `config.theme.mode`, or `config.theme.font`
 * changes in the store, the corresponding CSS variables on
 * `document.documentElement` are updated.
 *
 * Also dynamically loads Google Fonts and sets `--lf-font` + body font-family.
 */
export function useThemeBridge() {
  const theme = useStore((s) => s.config.theme);
  const prevColorsRef = useRef<ThemeColors | null>(null);
  const prevModeRef = useRef<string | null>(null);
  const prevFontRef = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    // ── Apply mode (data-theme attribute) ──
    if (theme.mode !== prevModeRef.current) {
      if (theme.mode === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", theme.mode);
      }
      prevModeRef.current = theme.mode;
    }

    // ── Apply colors (CSS custom properties) ──
    const colors = theme.colors;
    if (colors !== prevColorsRef.current) {
      for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
        const value = colors[key as keyof ThemeColors];
        if (value) {
          root.style.setProperty(cssVar, value);
        }
      }
      prevColorsRef.current = colors;
    }

    // ── Apply font ──
    if (theme.font && theme.font !== prevFontRef.current) {
      // Dynamically load the Google Font
      loadGoogleFont(theme.font);

      // Set CSS custom property + body font
      const fontStack = getFontFallback(theme.font);
      root.style.setProperty("--lf-font", fontStack);
      document.body.style.fontFamily = fontStack;

      prevFontRef.current = theme.font;
    }
  }, [theme]);

  // ── Listen for system theme changes when mode is "system" ──
  useEffect(() => {
    if (theme.mode !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme.mode]);
}
