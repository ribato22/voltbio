"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { themePresets } from "@/lib/themes";
import { fontCatalog, loadGoogleFont } from "@/lib/fonts";
import { backgroundPatterns } from "@/lib/patterns";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Palette, Sun, Moon, Monitor, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeConfig } from "@/types";

const modeOptions: { value: ThemeConfig["mode"]; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
  { value: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5" /> },
  { value: "system", label: "System", icon: <Monitor className="w-3.5 h-3.5" /> },
];

const buttonStyles: { value: ThemeConfig["buttonStyle"]; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
  { value: "outline", label: "Outline" },
];

const animations: { value: ThemeConfig["animation"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade-up", label: "Fade Up" },
  { value: "slide-in", label: "Slide In" },
  { value: "scale", label: "Scale" },
];

export function ThemeEditor() {
  const theme = useStore((s) => s.config.theme);
  const settings = useStore((s) => s.config.settings);
  const setTheme = useStore((s) => s.setTheme);
  const updateSettings = useStore((s) => s.updateSettings);

  // Pre-load all fonts so their names render in their own typeface
  useEffect(() => {
    fontCatalog.forEach((f) => loadGoogleFont(f.family));
  }, []);
  const applyPreset = useStore((s) => s.applyPreset);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="w-4 h-4 text-[var(--lf-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">Theme</h3>
      </div>

      {/* ── Mode Toggle ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Mode
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ mode: opt.value })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                theme.mode === opt.value
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={theme.mode === opt.value}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Presets Grid ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Preset Themes
        </p>
        <div className="grid grid-cols-2 gap-2">
          {themePresets.map((preset) => {
            const effect = preset.themeEffect || "none";
            const effectPreviewStyle: React.CSSProperties = (() => {
              switch (effect) {
                case "glassmorphism":
                  return {
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)",
                  };
                case "brutalism":
                  return {
                    border: "2px solid #000",
                    boxShadow: "2px 2px 0px #000",
                    borderRadius: "0px",
                    background: preset.colors.cardBackground,
                  };
                case "neon-glow":
                  return {
                    border: `1px solid ${preset.colors.accent}60`,
                    boxShadow: `0 0 8px ${preset.colors.accent}40`,
                    background: preset.colors.cardBackground,
                  };
                case "paper":
                  return {
                    border: "1px solid #e8e0d4",
                    boxShadow: "1px 1px 4px rgba(139,115,85,0.15)",
                    background: preset.colors.cardBackground,
                  };
                case "retrowave":
                  return {
                    borderBottom: `2px solid ${preset.colors.accent}`,
                    background: `linear-gradient(180deg, ${preset.colors.accent}15, transparent)`,
                  };
                default:
                  return { background: preset.colors.cardBackground };
              }
            })();

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={cn(
                  "relative rounded-xl p-3 text-left transition-all duration-200 cursor-pointer",
                  "border-2",
                  theme.preset === preset.id
                    ? "border-[var(--lf-accent)] shadow-md shadow-[var(--lf-accent)]/10"
                    : "border-[var(--lf-border)] hover:border-[var(--lf-accent)]/40"
                )}
                aria-pressed={theme.preset === preset.id}
                aria-label={`Select ${preset.name} theme`}
              >
                {/* Gradient preview bar */}
                <div
                  className="w-full h-8 rounded-lg mb-2 relative overflow-hidden"
                  style={{ background: preset.preview }}
                >
                  {/* Mini effect card inside thumbnail */}
                  {effect !== "none" && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[70%] h-3 rounded-sm"
                      style={effectPreviewStyle}
                    />
                  )}
                </div>
                <p className="text-xs font-medium text-[var(--lf-text)]">
                  {preset.name}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {Object.values(preset.colors).slice(0, 4).map((c, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ background: c }}
                    />
                  ))}
                  {effect !== "none" && (
                    <span className="ml-auto text-[9px] font-medium text-[var(--lf-muted)] tracking-wide uppercase">
                      {effect === "neon-glow" ? "GLOW" : effect.toUpperCase().slice(0, 5)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Font Selector ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Type className="w-3.5 h-3.5 text-[var(--lf-muted)]" />
          <p className="text-xs font-medium text-[var(--lf-muted)] uppercase tracking-wider">
            Font
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {fontCatalog.map((font) => (
            <button
              key={font.family}
              type="button"
              onClick={() => setTheme({ font: font.family })}
              className={cn(
                "relative py-2.5 px-3 rounded-lg text-left transition-all duration-200 cursor-pointer",
                "border",
                theme.font === font.family
                  ? "border-[var(--lf-accent)] bg-[var(--lf-accent)]/10 shadow-sm"
                  : "border-[var(--lf-border)] hover:border-[var(--lf-accent)]/40 bg-[var(--lf-card-bg)]"
              )}
              aria-pressed={theme.font === font.family}
              aria-label={`Select ${font.label} font`}
            >
              <span
                className="block text-sm font-medium text-[var(--lf-text)] truncate"
                style={{ fontFamily: `'${font.family}', sans-serif` }}
              >
                {font.label}
              </span>
              <span className="block text-[10px] text-[var(--lf-muted)] mt-0.5 capitalize">
                {font.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom Colors ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-3 uppercase tracking-wider">
          Custom Colors
        </p>
        <div className="space-y-3">
          <ColorPicker
            label="Background"
            color={theme.colors.background}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, background: c } })
            }
          />
          <ColorPicker
            label="Card"
            color={theme.colors.cardBackground}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, cardBackground: c } })
            }
          />
          <ColorPicker
            label="Text"
            color={theme.colors.text}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, text: c } })
            }
          />
          <ColorPicker
            label="Accent"
            color={theme.colors.accent}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, accent: c } })
            }
          />
          <ColorPicker
            label="Link Hover"
            color={theme.colors.linkHover}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, linkHover: c } })
            }
          />
        </div>
      </div>

      {/* ── Background Pattern ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Background
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {backgroundPatterns.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => setTheme({ backgroundPattern: pattern.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg text-center transition-all duration-200 cursor-pointer",
                "border",
                (theme.backgroundPattern || "none") === pattern.id
                  ? "border-[var(--lf-accent)] bg-[var(--lf-accent)]/10 shadow-sm"
                  : "border-[var(--lf-border)] hover:border-[var(--lf-accent)]/40 bg-[var(--lf-card-bg)]"
              )}
              aria-pressed={(theme.backgroundPattern || "none") === pattern.id}
              aria-label={`Select ${pattern.label} background`}
            >
              <span className="text-base leading-none">{pattern.emoji}</span>
              <span className="text-[10px] font-medium text-[var(--lf-text)] leading-tight">
                {pattern.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Button Style ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Button Style
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {buttonStyles.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ buttonStyle: opt.value })}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                theme.buttonStyle === opt.value
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={theme.buttonStyle === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Animation ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Animation
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {animations.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ animation: opt.value })}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                theme.animation === opt.value
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={theme.animation === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom CSS (Advanced) ── */}
      <div className="pt-2 border-t border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-[10px]">⚡</span>
          Custom CSS
        </p>
        <textarea
          value={settings.customCSS || ""}
          onChange={(e) => updateSettings({ customCSS: e.target.value })}
          placeholder={`#voltbio-page .link-card {\n  border-radius: 0;\n  box-shadow: 0 2px 8px rgba(0,0,0,.15);\n}`}
          rows={6}
          maxLength={5000}
          spellCheck={false}
          className="w-full text-xs px-3 py-2.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)] placeholder:text-[var(--lf-muted)]/40"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-[var(--lf-muted)] leading-snug">
            Scope with <code className="px-1 py-0.5 rounded bg-[var(--lf-border)] text-[var(--lf-accent)] font-mono text-[9px]">#voltbio-page</code> to avoid UI conflicts
          </p>
          <span className="text-[10px] text-[var(--lf-muted)] tabular-nums">
            {(settings.customCSS || "").length}/5000
          </span>
        </div>
      </div>
    </div>
  );
}
