/* ============================================================
   VoltBio — Static Site Export (Client-Side ZIP Generator)
   ============================================================ */

import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ProfileConfig } from "@/types";
import { sanitizeUrl, detectSocialIcon, getAvatarFallback } from "@/lib/utils";

/**
 * Generates a self-contained static HTML page from the user's config
 * and packages it as a downloadable `.zip` file.
 *
 * The exported ZIP contains:
 * - `index.html`  — full bio page with embedded JSON config + inline CSS
 *
 * Everything runs client-side — no backend required.
 */
export async function exportStaticSite(config: ProfileConfig): Promise<void> {
  const zip = new JSZip();

  const html = generateHtml(config);
  zip.file("index.html", html);

  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `${config.profile.username || "voltbio"}-bio.zip`;
  saveAs(blob, filename);
}

/* ─────────────────────────────────────────────
   HTML Template Generator
   ───────────────────────────────────────────── */

function generateHtml(config: ProfileConfig): string {
  const { profile, links, theme, seo, settings } = config;

  const enabledLinks = links
    .filter((l) => l.enabled)
    .sort((a, b) => a.order - b.order);

  const buttonRadius =
    theme.buttonStyle === "pill"
      ? "9999px"
      : theme.buttonStyle === "square"
        ? "8px"
        : "12px";

  const isOutline = theme.buttonStyle === "outline";

  const ogTitle = seo.title || `${profile.name} — Links`;
  const ogDescription = seo.description || profile.bio || "All my links in one place.";

  // ── Build link cards HTML ──
  const linksHtml = enabledLinks
    .map((link) => {
      const safeUrl = sanitizeUrl(link.url);
      const iconKey = detectSocialIcon(link.url);
      const rel = link.target === "_blank" ? ' rel="noopener noreferrer"' : "";

      return `
      <a href="${safeUrl || "#"}" target="${link.target}"${rel}
         class="link-card"
         style="
           background: ${isOutline ? "transparent" : theme.colors.cardBackground};
           color: ${theme.colors.text};
           border-radius: ${buttonRadius};
           border: ${isOutline ? `1.5px solid ${theme.colors.accent}` : `1px solid ${theme.colors.cardBackground}`};
         ">
        <span class="link-icon">${getSvgIcon(iconKey)}</span>
        <span class="link-title">${escapeHtml(link.title)}</span>
        <span class="link-spacer"></span>
      </a>`;
    })
    .join("\n");

  // ── Avatar HTML ──
  const avatarHtml = profile.avatar
    ? `<img src="${profile.avatar}" alt="${escapeHtml(profile.name)}" class="avatar" style="border-color: ${theme.colors.accent};" />`
    : `<div class="avatar avatar--fallback" style="background: ${theme.colors.accent}22; color: ${theme.colors.accent}; border: 2px solid ${theme.colors.accent};">${getAvatarFallback(profile.name)}</div>`;

  // ── Location HTML ──
  const locationHtml = profile.location
    ? `<p class="location"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(profile.location)}</p>`
    : "";

  // ── Footer HTML ──
  const footerHtml = settings.showFooter
    ? `<footer class="footer">${escapeHtml(settings.footerText)}</footer>`
    : "";

  // ── Analytics snippet ──
  const analyticsHtml = settings.analyticsId
    ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${escapeHtml(settings.analyticsId)}"></script>`
    : "";

  return `<!DOCTYPE html>
<html lang="${settings.locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDescription)}" />

  <!-- Open Graph / Social -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  ${seo.ogImage ? `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />` : ""}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  ${seo.ogImage ? `<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />` : ""}

  <!-- CSP -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cloud.umami.is; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self'; object-src 'none'; frame-src 'none';" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${theme.font || "Inter"}:wght@400;500;600;700&display=swap" rel="stylesheet" />

  ${analyticsHtml}

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: '${theme.font || "Inter"}', system-ui, -apple-system, sans-serif;
      background: ${theme.colors.background};
      color: ${theme.colors.text};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      width: 100%;
      max-width: 28rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .avatar {
      width: 6rem;
      height: 6rem;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid;
      margin-bottom: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .avatar--fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .name {
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      opacity: 0.6;
      margin-top: 0.25rem;
    }

    .bio {
      font-size: 0.875rem;
      text-align: center;
      opacity: 0.75;
      margin-top: 0.5rem;
      max-width: 20rem;
      line-height: 1.6;
    }

    .links {
      width: 100%;
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .link-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .link-card:hover {
      transform: scale(1.02);
      border-color: ${theme.colors.accent} !important;
      box-shadow: 0 4px 12px ${theme.colors.accent}20;
    }

    .link-card:active { transform: scale(0.98); }

    .link-icon { display: flex; width: 18px; height: 18px; flex-shrink: 0; }
    .link-icon svg { width: 100%; height: 100%; }
    .link-title { flex: 1; text-align: center; }
    .link-spacer { width: 18px; flex-shrink: 0; }

    .footer {
      margin-top: 3rem;
      font-size: 0.75rem;
      opacity: 0.4;
    }
  </style>
</head>
<body>
  <main class="container">
    ${avatarHtml}
    <h1 class="name">${escapeHtml(profile.name || "Your Name")}</h1>
    ${locationHtml}
    <p class="bio">${escapeHtml(profile.bio || "Welcome to my link page")}</p>
    <div class="links">
      ${linksHtml}
    </div>
    ${footerHtml}
  </main>
</body>
</html>`;
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Returns a generic link SVG icon inline for the exported page. */
function getSvgIcon(iconKey: string): string {
  // Map of commonly used icons as inline SVGs
  const icons: Record<string, string> = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="white" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  };

  return icons[iconKey] || icons.link;
}
