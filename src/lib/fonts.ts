/* ============================================================
   VoltBio — Font Catalog & Dynamic Loader
   
   Manages available Google Fonts and dynamically injects 
   <link> tags into <head> for instant live preview.
   ============================================================ */

/** A font option available in the font selector */
export interface FontOption {
  /** Font family name (must match Google Fonts exactly) */
  family: string;
  /** Display label in the UI */
  label: string;
  /** Category for visual grouping */
  category: "sans-serif" | "serif" | "monospace" | "display";
  /** Font weights to load */
  weights: number[];
}

/**
 * Curated list of 8 Google Fonts that are:
 * - Popular & widely used
 * - Visually distinct from each other (for meaningful choice)
 * - Well-suited for bio/link pages
 */
export const fontCatalog: FontOption[] = [
  {
    family: "Inter",
    label: "Inter",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Poppins",
    label: "Poppins",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Space Grotesk",
    label: "Space Grotesk",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Playfair Display",
    label: "Playfair Display",
    category: "serif",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Lora",
    label: "Lora",
    category: "serif",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Roboto Mono",
    label: "Roboto Mono",
    category: "monospace",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Outfit",
    label: "Outfit",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    family: "DM Sans",
    label: "DM Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  // ── Advanced Theme Fonts ──
  {
    family: "Orbitron",
    label: "Orbitron",
    category: "display",
    weights: [400, 500, 600, 700],
  },
  {
    family: "Space Mono",
    label: "Space Mono",
    category: "monospace",
    weights: [400, 700],
  },
  {
    family: "Rajdhani",
    label: "Rajdhani",
    category: "display",
    weights: [400, 500, 600, 700],
  },
];

/* ─────────────────────────────────────────────
   Dynamic Font Loader
   ───────────────────────────────────────────── */

/** Cache of already-loaded fonts to avoid duplicate <link> tags */
const loadedFonts = new Set<string>();

/**
 * Dynamically loads a Google Font by injecting a <link> tag into <head>.
 * 
 * This is used instead of next/font because:
 * - We need runtime font switching (not build-time)
 * - The user picks fonts in the editor, which must update live
 * - The exported static HTML also uses Google Fonts via <link>
 * 
 * @param family - The Google Font family name (e.g. "Playfair Display")
 */
export function loadGoogleFont(family: string): void {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(family)) return;

  const linkId = `voltbio-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  
  // Skip if already in DOM (e.g. from a previous session)
  if (document.getElementById(linkId)) {
    loadedFonts.add(family);
    return;
  }

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = buildGoogleFontsUrl(family);
  document.head.appendChild(link);

  loadedFonts.add(family);
}

/**
 * Builds a Google Fonts CSS URL for a given font family.
 * Used by both the dynamic loader and the static export.
 */
export function buildGoogleFontsUrl(family: string): string {
  const font = fontCatalog.find((f) => f.family === family);
  const weights = font?.weights ?? [400, 500, 600, 700];
  const encodedFamily = family.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weights.join(";")}&display=swap`;
}

/**
 * Get the CSS fallback stack for a given font category.
 */
export function getFontFallback(family: string): string {
  const font = fontCatalog.find((f) => f.family === family);
  switch (font?.category) {
    case "serif":
      return `'${family}', Georgia, 'Times New Roman', serif`;
    case "monospace":
      return `'${family}', 'Fira Code', 'Courier New', monospace`;
    case "display":
      return `'${family}', 'Impact', system-ui, sans-serif`;
    default:
      return `'${family}', system-ui, -apple-system, sans-serif`;
  }
}
