/* ============================================================
   VoltBio — Static Site Export (Client-Side ZIP Generator)
   ============================================================ */

import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ProfileConfig } from "@/types";
import { sanitizeUrl, detectSocialIcon, getAvatarFallback, detectPdfUrl } from "@/lib/utils";
import { buildGoogleFontsUrl, getFontFallback } from "@/lib/fonts";
import { getPattern, gradientKeyframes } from "@/lib/patterns";
import { generateVCard } from "@/lib/vcard";
import { detectEmbed, getSpotifyHeight } from "@/lib/embed";
import { getEffectCSSForExport } from "@/lib/theme-effects";

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
      // Section Header
      if (link.type === "header") {
        return `
      <div style="width:100%;padding-top:1rem;padding-bottom:0.25rem">
        <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;color:${theme.colors.text}">${escapeHtml(link.title)}</p>
        <div style="margin-top:0.375rem;height:1px;width:2rem;border-radius:9999px;opacity:0.3;background:${theme.colors.accent}"></div>
      </div>`;
      }

      // Donation Block
      if (link.type === "donation") {
        const platformLabels: Record<string, string> = {
          qris: "📱 QRIS", saweria: "🪙 Saweria", trakteer: "☕ Trakteer",
          kofi: "☕ Ko-fi", buymeacoffee: "☕ Buy Me a Coffee", patreon: "🎨 Patreon",
        };
        const platform = link.donationPlatform || "qris";
        const platformLabel = platformLabels[platform] || platform;
        const isQris = platform === "qris";

        let qrisHtml = "";
        if (isQris && link.qrisImage) {
          qrisHtml = `
        <div style="display:inline-block;padding:0.75rem;background:#fff;border-radius:0.75rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <img src="${link.qrisImage}" alt="Scan QRIS" style="width:10rem;height:10rem;object-fit:contain" />
        </div>
        <p style="font-size:0.625rem;opacity:0.5;color:${theme.colors.text}">Scan dengan aplikasi e-wallet kamu</p>`;
        }

        let linkBtnHtml = "";
        if (!isQris && link.url) {
          linkBtnHtml = `
        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1.25rem;border-radius:9999px;font-size:0.875rem;font-weight:600;color:#fff;background:${theme.colors.accent};text-decoration:none;transition:transform 0.2s">
          ${escapeHtml(link.donationCta || `Donate via ${platformLabel}`)}
        </a>`;
        }

        return `
      <div style="width:100%">
        <div style="position:relative;overflow:hidden;border-radius:1rem;padding:1.25rem;text-align:center;background:linear-gradient(135deg,${theme.colors.accent}22,${theme.colors.accent}08);border:1.5px solid ${theme.colors.accent}40">
          <div style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0.625rem;border-radius:9999px;font-size:0.625rem;font-weight:700;margin-bottom:0.75rem;background:${theme.colors.accent}20;color:${theme.colors.accent}">${platformLabel}</div>
          <p style="font-size:1rem;font-weight:700;margin-bottom:0.25rem;color:${theme.colors.text}">${escapeHtml(link.title || "Support Me")}</p>
          <p style="font-size:0.875rem;opacity:0.7;margin-bottom:1rem;color:${theme.colors.text}">${escapeHtml(link.donationCta || "")}</p>
          ${qrisHtml}
          ${linkBtnHtml}
        </div>
      </div>`;
      }

      // Portfolio / Image Grid Block
      if (link.type === "portfolio") {
        const images = link.portfolioImages || [];
        if (images.length === 0) return "";
        const cols = link.portfolioColumns || 3;
        const gapMap = { sm: "4px", md: "8px", lg: "12px" };
        const gap = gapMap[link.portfolioGap || "md"];

        const gridHtml = images.map((img, idx) => {
          const captionOverlay = img.caption ? `
            <div style="position:absolute;bottom:0;left:0;right:0;padding:0.5rem;background:linear-gradient(to top,rgba(0,0,0,0.6),transparent);color:#fff;font-size:0.625rem;font-weight:500">${escapeHtml(img.caption)}</div>` : "";
          return `
          <a href="#lb-${link.id}-${idx}" style="break-inside:avoid;display:block;margin-bottom:${gap};position:relative;overflow:hidden;border-radius:0.5rem;text-decoration:none">
            <img src="${img.dataUrl}" alt="${escapeHtml(img.caption || `Image ${idx + 1}`)}" style="width:100%;height:auto;display:block;border-radius:0.5rem" loading="lazy" />
            ${captionOverlay}
          </a>`;
        }).join("");

        const lightboxHtml = images.map((img, idx) => `
        <div id="lb-${link.id}-${idx}" style="position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.9);display:none;align-items:center;justify-content:center;padding:1rem">
          <style>#lb-${link.id}-${idx}:target{display:flex!important}</style>
          <a href="#" style="position:absolute;top:1rem;right:1rem;width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.25rem;text-decoration:none">&times;</a>
          ${idx > 0 ? `<a href="#lb-${link.id}-${idx - 1}" style="position:absolute;left:1rem;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.25rem;text-decoration:none">&#8249;</a>` : ""}
          ${idx < images.length - 1 ? `<a href="#lb-${link.id}-${idx + 1}" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.25rem;text-decoration:none">&#8250;</a>` : ""}
          <div style="max-width:90vw;max-height:85vh;display:flex;flex-direction:column;align-items:center;gap:0.75rem">
            <img src="${img.dataUrl}" alt="${escapeHtml(img.caption || `Image ${idx + 1}`)}" style="max-width:100%;max-height:80vh;object-fit:contain;border-radius:0.5rem" />
            ${img.caption ? `<p style="color:rgba(255,255,255,0.9);font-size:0.875rem">${escapeHtml(img.caption)}</p>` : ""}
            <p style="color:rgba(255,255,255,0.4);font-size:0.75rem">${idx + 1} / ${images.length}</p>
          </div>
        </div>`).join("");

        return `
      <div style="width:100%">
        ${link.title ? `<p style="font-size:0.875rem;font-weight:600;margin-bottom:0.5rem;opacity:0.8;color:${theme.colors.text}">${escapeHtml(link.title)}</p>` : ""}
        <div style="column-count:${cols};column-gap:${gap}">
          ${gridHtml}
        </div>
      </div>
      ${lightboxHtml}`;
      }

      // Countdown Timer Block
      if (link.type === "countdown") {
        const targetISO = link.targetDate || new Date().toISOString();
        const style = link.timerStyle || "card";
        const label = escapeHtml(link.timerLabel || "Countdown");
        const title = escapeHtml(link.title || "");
        const timerId = `timer-${link.id}`;

        const digitBoxCss = style === "card"
          ? `background:${theme.colors.accent}15;border-radius:0.75rem;padding:0.75rem 0.5rem;min-width:3.5rem;border:1.5px solid ${theme.colors.accent}25;text-align:center`
          : style === "flip"
          ? `background:${theme.colors.accent};border-radius:0.5rem;padding:0.75rem 0.5rem;min-width:3.5rem;text-align:center`
          : `padding:0.5rem;text-align:center`;

        const digitColor = style === "flip" ? "#fff" : theme.colors.accent;
        const labelColor = style === "flip" ? "#fff" : theme.colors.text;

        const bgGrad = style === "flip"
          ? `linear-gradient(135deg,${theme.colors.accent}20,${theme.colors.accent}08)`
          : `linear-gradient(135deg,${theme.colors.accent}10,transparent)`;

        return `
      <div style="width:100%">
        <div style="position:relative;overflow:hidden;border-radius:1rem;padding:1.25rem;text-align:center;background:${bgGrad};border:1.5px solid ${theme.colors.accent}25">
          <p style="font-size:0.75rem;font-weight:600;margin-bottom:0.75rem;opacity:0.7;color:${theme.colors.text}">${label}</p>
          ${title ? `<p style="font-size:1rem;font-weight:700;margin-bottom:1rem;color:${theme.colors.text}">${title}</p>` : ""}
          <div id="${timerId}" style="display:flex;justify-content:center;gap:0.5rem">
            ${["Days", "Hours", "Min", "Sec"].map((u) => `
            <div style="${digitBoxCss}">
              <p class="cd-val" style="font-size:1.5rem;font-weight:700;font-variant-numeric:tabular-nums;color:${digitColor};margin:0">00</p>
              <p style="font-size:0.5625rem;font-weight:500;text-transform:uppercase;margin-top:0.125rem;opacity:0.6;color:${labelColor};margin:0">${u}</p>
            </div>`).join("")}
          </div>
        </div>
      </div>
      <script>
      (function(){
        var target = new Date("${targetISO}").getTime();
        var el = document.getElementById("${timerId}");
        if(!el) return;
        var vals = el.querySelectorAll(".cd-val");
        function tick(){
          var diff = target - Date.now();
          if(diff<=0){ vals[0].textContent="🎉"; vals[1].textContent=""; vals[2].textContent=""; vals[3].textContent="Time's Up!"; return; }
          var d=Math.floor(diff/864e5), h=Math.floor(diff/36e5%24), m=Math.floor(diff/6e4%60), s=Math.floor(diff/1e3%60);
          vals[0].textContent=String(d).padStart(2,"0");
          vals[1].textContent=String(h).padStart(2,"0");
          vals[2].textContent=String(m).padStart(2,"0");
          vals[3].textContent=String(s).padStart(2,"0");
        }
        tick();
        setInterval(tick,1000);
      })();
      </script>`;
      }

      // Lead Form / Contact Form Block
      if (link.type === "lead-form") {
        const fields = link.formFields || ["name", "email", "message"];
        const provider = link.formProvider || "formsubmit";
        const actionUrl =
          provider === "formsubmit"
            ? `https://formsubmit.co/${escapeHtml(link.formEmail || "")}`
            : "https://api.web3forms.com/submit";

        const inputCss = `width:100%;padding:0.625rem 0.75rem;border-radius:0.5rem;border:1px solid ${theme.colors.accent}30;background:${theme.colors.accent}08;color:${theme.colors.text};font-size:0.875rem;font-family:inherit;outline:none;box-sizing:border-box`;

        const fieldHtml = fields.map((f) => {
          if (f === "name") return `<input type="text" name="name" placeholder="Your Name" required style="${inputCss}" />`;
          if (f === "email") return `<input type="email" name="email" placeholder="Your Email" required style="${inputCss}" />`;
          if (f === "phone") return `<input type="tel" name="phone" placeholder="Phone Number" style="${inputCss}" />`;
          if (f === "message") return `<textarea name="message" placeholder="Your Message..." rows="3" required style="${inputCss};resize:vertical"></textarea>`;
          return "";
        }).join("\n          ");

        const hiddenFields = provider === "formsubmit"
          ? `<input type="hidden" name="_captcha" value="false" />\n          <input type="hidden" name="_subject" value="New message from ${escapeHtml(link.title || "VoltBio")}" />\n          <input type="hidden" name="_next" value="" />\n          <script>document.querySelector('input[name=&quot;_next&quot;]').value=window.location.href;</script>`
          : `<input type="hidden" name="access_key" value="${escapeHtml(link.formAccessKey || "")}" />`;

        return `
      <div style="width:100%">
        <div style="position:relative;overflow:hidden;border-radius:1rem;padding:1.25rem;background:linear-gradient(135deg,${theme.colors.accent}15,${theme.colors.accent}05);border:1.5px solid ${theme.colors.accent}30">
          <div style="text-align:center;margin-bottom:1rem">
            <div style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0.625rem;border-radius:9999px;font-size:0.625rem;font-weight:700;margin-bottom:0.5rem;background:${theme.colors.accent}20;color:${theme.colors.accent}">✉️ Contact Form</div>
            <p style="font-size:1rem;font-weight:700;color:${theme.colors.text}">${escapeHtml(link.title || "Contact Me")}</p>
          </div>
          <form action="${actionUrl}" method="POST" style="display:flex;flex-direction:column;gap:0.75rem">
            ${hiddenFields}
            ${fieldHtml}
            <button type="submit" style="width:100%;padding:0.625rem;border-radius:9999px;font-size:0.875rem;font-weight:600;color:#fff;background:${theme.colors.accent};border:none;cursor:pointer">${escapeHtml(link.formCta || "Send Message ✉️")}</button>
          </form>
          <p style="font-size:0.5625rem;text-align:center;margin-top:0.75rem;opacity:0.4;color:${theme.colors.text}">Powered by ${provider === "formsubmit" ? "FormSubmit.co" : "Web3Forms"} · No backend needed</p>
        </div>
      </div>`;
      }

      const safeUrl = sanitizeUrl(link.url);
      const iconKey = detectSocialIcon(link.url);
      const rel = link.target === "_blank" ? ' rel="noopener noreferrer"' : "";
      const embedInfo = link.isEmbed ? detectEmbed(link.url) : null;
      const schedAttrs = [
        link.validFrom ? ` data-valid-from="${escapeHtml(link.validFrom)}"` : "",
        link.validUntil ? ` data-valid-until="${escapeHtml(link.validUntil)}"` : "",
      ].join("");

      // PDF document embed
      if (link.isPdfEmbed) {
        const pdfSrc = detectPdfUrl(link.url);
        if (pdfSrc) {
          const titleHtml = link.title
            ? `<p style="font-size:0.75rem;font-weight:500;padding:0.625rem 1rem;opacity:0.7;color:${theme.colors.text};display:flex;align-items:center;gap:0.375rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>${escapeHtml(link.title)}</p>`
            : "";
          return `
      <div class="embed-card pdf-card scheduled-link" style="border:1px solid ${theme.colors.cardBackground};border-radius:0.75rem;overflow:hidden;width:100%"${schedAttrs}>
        ${titleHtml}
        <iframe src="${pdfSrc}" title="${escapeHtml(link.title || 'PDF Document')}" style="height:500px;width:100%;border:none" loading="lazy" allow="autoplay"></iframe>
      </div>`;
        }
      }

      // Embed iframe
      if (link.isEmbed && embedInfo) {
        const titleHtml = link.title
          ? `<p style="font-size:0.75rem;font-weight:500;padding:0.5rem 0.75rem;opacity:0.7;color:${theme.colors.text}">${escapeHtml(link.title)}</p>`
          : "";
        const iframeHeight = embedInfo.platform === "youtube"
          ? 'style="aspect-ratio:16/9;width:100%;border:none"'
          : `style="height:${getSpotifyHeight(embedInfo.type)}px;width:100%;border:none"`;
        return `
      <div class="embed-card scheduled-link" style="border:1px solid ${theme.colors.cardBackground};border-radius:0.75rem;overflow:hidden;width:100%"${schedAttrs}>
        ${titleHtml}
        <iframe src="${embedInfo.embedUrl}" title="${escapeHtml(link.title || 'Embedded media')}" ${iframeHeight} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>
      </div>`;
      }

      // Action button (WhatsApp template form)
      if (link.type === "action" && link.actionConfig) {
        const cfg = link.actionConfig;
        const num = cfg.whatsappNumber.replace(/\D/g, "");
        const fieldsHtml = cfg.fields.map((f) => {
          const inputId = `action-${link.id}-${f.id}`;
          if (f.type === "date") {
            return `<div><label style="font-size:0.7rem;opacity:0.7;display:block;margin-bottom:2px">${escapeHtml(f.label)}</label><input type="date" id="${inputId}" data-label="${escapeHtml(f.label)}" style="width:100%;font-size:0.85rem;padding:0.5rem 0.75rem;border-radius:0.5rem;background:rgba(0,0,0,0.1);border:1px solid ${theme.colors.accent}40;color:${theme.colors.text}" /></div>`;
          }
          if (f.type === "select" && f.options?.length) {
            const opts = f.options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");
            return `<div><label style="font-size:0.7rem;opacity:0.7;display:block;margin-bottom:2px">${escapeHtml(f.label)}</label><select id="${inputId}" data-label="${escapeHtml(f.label)}" style="width:100%;font-size:0.85rem;padding:0.5rem 0.75rem;border-radius:0.5rem;background:rgba(0,0,0,0.1);border:1px solid ${theme.colors.accent}40;color:${theme.colors.text}"><option value="">${escapeHtml(f.placeholder || "Select...")}</option>${opts}</select></div>`;
          }
          return `<div><label style="font-size:0.7rem;opacity:0.7;display:block;margin-bottom:2px">${escapeHtml(f.label)}</label><input type="text" id="${inputId}" data-label="${escapeHtml(f.label)}" placeholder="${escapeHtml(f.placeholder)}" style="width:100%;font-size:0.85rem;padding:0.5rem 0.75rem;border-radius:0.5rem;background:rgba(0,0,0,0.1);border:1px solid ${theme.colors.accent}40;color:${theme.colors.text}" /></div>`;
        }).join("");

        const fieldIds = cfg.fields.map((f) => `action-${link.id}-${f.id}`);
        return `
      <div class="action-card link-card scheduled-link"${schedAttrs} style="
        background: ${isOutline ? "transparent" : theme.colors.cardBackground};
        color: ${theme.colors.text};
        border-radius: ${buttonRadius};
        border: ${isOutline ? `1.5px solid ${theme.colors.accent}` : `1px solid ${theme.colors.cardBackground}`};
        overflow: hidden;
      ">
        <button type="button" onclick="var f=this.parentElement.querySelector('.action-form');f.style.display=f.style.display==='none'?'flex':'none';this.querySelector('.chevron').style.transform=f.style.display==='none'?'':'rotate(180deg)';this.parentElement.style.borderRadius=f.style.display==='none'?'${buttonRadius}':'1.25rem'" style="display:flex;align-items:center;gap:0.75rem;width:100%;padding:0.875rem 1.25rem;font-size:0.875rem;font-weight:500;cursor:pointer;background:none;border:none;color:inherit;text-align:left">
          <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.colors.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
          <span class="link-title" style="flex:1">${escapeHtml(link.title)}</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.colors.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="action-form" style="display:none;padding:0.75rem 1.25rem 1.25rem;flex-direction:column;gap:0.75rem;border-top:1px solid ${theme.colors.accent}20">
          ${fieldsHtml}
          <button type="button" onclick="(function(btn){var t='${escapeHtml(cfg.messageTemplate).replace(/'/g, "\\'")}';var ids=${JSON.stringify(fieldIds)};ids.forEach(function(id){var el=document.getElementById(id);if(el){var lbl=el.dataset.label;t=t.split('{'+lbl+'}').join(el.value).split('{'+lbl.toLowerCase()+'}').join(el.value)}});window.open('https://wa.me/${num}?text='+encodeURIComponent(t),'_blank')})(this)" style="width:100%;padding:0.75rem;border-radius:0.75rem;font-size:0.875rem;font-weight:700;color:white;background:#25D366;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-top:0.25rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send via WhatsApp
          </button>
        </div>
      </div>`;
      }

      // Locked link button
      if (link.isLocked && link.encryptedUrl) {
        return `
      <button type="button" class="link-card link-locked scheduled-link"${schedAttrs}
         data-encrypted="${escapeHtml(link.encryptedUrl)}"
         data-target="${link.target}"
         onclick="(async function(btn){
           var pw=prompt('🔒 &quot;${escapeHtml(link.title)}&quot; is password-protected.\\nEnter password:');
           if(!pw)return;
           try{
             var combined=Uint8Array.from(atob(btn.dataset.encrypted),function(c){return c.charCodeAt(0)});
             var salt=combined.slice(0,16),iv=combined.slice(16,28),ct=combined.slice(28);
             var km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
             var key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
             var dec=await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},key,ct);
             var url=new TextDecoder().decode(dec);
             window.open(url,btn.dataset.target);
           }catch(e){alert('❌ Wrong password.');}
         })(this)"
         style="
           background: ${isOutline ? "transparent" : theme.colors.cardBackground};
           color: ${theme.colors.text};
           border-radius: ${buttonRadius};
           border: ${isOutline ? `1.5px solid ${theme.colors.accent}` : `1px solid ${theme.colors.cardBackground}`};
           cursor: pointer;
         ">
        <span class="link-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.colors.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
        <span class="link-title">${escapeHtml(link.title)}</span>
        <span class="link-spacer"></span>
      </button>`;
      }

      // Standard link button
      return `
      <a href="${safeUrl || "#"}" target="${link.target}"${rel}
         class="link-card scheduled-link"${schedAttrs}
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

  // ── VCard Button HTML ──
  const hasContact = profile.phone || profile.email;
  const vcardButtonHtml = hasContact
    ? `<button class="save-contact" onclick="downloadVCard()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        Save Contact
      </button>`
    : "";

  // ── VCard inline JS ──
  const vcardData = hasContact ? generateVCard(profile, `https://${profile.username}.github.io/voltbio`) : "";
  const vcardScript = hasContact
    ? `<script>
      function downloadVCard(){
        var vcf=${JSON.stringify(vcardData)};
        var b=new Blob([vcf],{type:'text/vcard;charset=utf-8'});
        var u=URL.createObjectURL(b);
        var a=document.createElement('a');
        a.href=u;a.download='${escapeHtml(profile.username || profile.name || "contact")}.vcf';
        a.click();URL.revokeObjectURL(u);
      }
      </script>`
    : "";

  // ── Footer HTML ──
  const footerHtml = settings.showFooter
    ? `<footer class="footer">${escapeHtml(settings.footerText)}</footer>`
    : "";

  // ── Floating Action Button HTML ──
  const fb = config.floatingButton;
  const fabHtml = fb?.enabled && fb.url ? (() => {
    const href =
      fb.icon === "whatsapp" ? `https://wa.me/${fb.url.replace(/\\D/g, "")}` :
      fb.icon === "email" ? `mailto:${fb.url}` :
      fb.icon === "phone" ? `tel:${fb.url}` :
      fb.url;
    const svgMap: Record<string, string> = {
      whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
      phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
      link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    };
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(fb.label || "Contact")}" style="position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${theme.colors.accent};color:#fff;box-shadow:0 4px 20px ${theme.colors.accent}60;transition:transform .2s;text-decoration:none" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">${svgMap[fb.icon] || svgMap.link}</a>`;
  })() : "";

  // ── Testimonials Carousel HTML ──
  const validTestimonials = (config.testimonials || []).filter((t) => t.name && t.text);
  const testimonialsHtml = validTestimonials.length > 0
    ? `<div class="testimonials-section">
        <p class="testimonials-title">★ Reviews</p>
        <div class="testimonials-track">
          ${validTestimonials.map((t) => `
            <div class="testimonial-card" style="background:${theme.colors.cardBackground};border:1px solid ${theme.colors.cardBackground}">
              <div class="testimonial-stars">${[1,2,3,4,5].map((n) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="${n <= t.rating ? '#facc15' : 'none'}" stroke="${n <= t.rating ? '#facc15' : 'currentColor'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join("")}</div>
              <p class="testimonial-text">&ldquo;${escapeHtml(t.text)}&rdquo;</p>
              <p class="testimonial-name">&mdash; ${escapeHtml(t.name)}</p>
            </div>
          `).join("")}
        </div>
      </div>`
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
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cloud.umami.is; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self'; object-src 'none'; frame-src 'self' https: data: blob:;" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${buildGoogleFontsUrl(theme.font || "Inter")}" rel="stylesheet" />

  ${analyticsHtml}

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${getFontFallback(theme.font || "Inter")};
      background: ${getPattern(theme.backgroundPattern || "none").getCSS(theme.colors.background, theme.colors.accent)};
      ${getPattern(theme.backgroundPattern || "none").getExtra(theme.colors.background, theme.colors.accent)}
      color: ${theme.colors.text};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      -webkit-font-smoothing: antialiased;
    }

    ${theme.backgroundPattern === "gradient" ? gradientKeyframes : ""}

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

    .save-contact {
      margin-top: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
      background: ${theme.colors.accent}18;
      color: ${theme.colors.accent};
      border: 1.5px solid ${theme.colors.accent}40;
    }
    .save-contact:hover { transform: scale(1.05); }
    .save-contact:active { transform: scale(0.95); }

    .footer {
      margin-top: 3rem;
      font-size: 0.75rem;
      opacity: 0.4;
    }

    .testimonials-section { width: 100%; margin-top: 1.5rem; }
    .testimonials-title { font-size: 0.75rem; font-weight: 600; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; color: ${theme.colors.text}; }
    .testimonials-track { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; scroll-snap-type: x mandatory; -ms-overflow-style: none; scrollbar-width: none; }
    .testimonials-track::-webkit-scrollbar { display: none; }
    .testimonial-card { flex-shrink: 0; width: 240px; padding: 1rem; border-radius: 0.75rem; scroll-snap-align: start; }
    .testimonial-stars { display: flex; gap: 2px; margin-bottom: 0.5rem; }
    .testimonial-text { font-size: 0.75rem; line-height: 1.7; opacity: 0.8; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; color: ${theme.colors.text}; }
    .testimonial-name { font-size: 0.6875rem; font-weight: 600; margin-top: 0.5rem; opacity: 0.6; color: ${theme.colors.text}; }

    /* Theme Effect */
    ${getEffectCSSForExport(theme.themeEffect, theme.colors.accent)}
  </style>
  ${settings.customCSS ? `<style>/* Custom CSS */\n${settings.customCSS}</style>` : ""}
</head>
<body>
  <main id="voltbio-page" class="container">
    ${avatarHtml}
    <h1 class="name">${escapeHtml(profile.name || "Your Name")}</h1>
    ${locationHtml}
    <p class="bio">${escapeHtml(profile.bio || "Welcome to my link page")}</p>
    ${vcardButtonHtml}
    <div class="links">
      ${linksHtml}
    </div>
    ${testimonialsHtml}
    ${footerHtml}
  </main>
  ${fabHtml}
  ${vcardScript}
  <script>
  (function(){
    var now=new Date();
    document.querySelectorAll('.scheduled-link').forEach(function(el){
      var from=el.getAttribute('data-valid-from');
      var until=el.getAttribute('data-valid-until');
      if(from&&new Date(from)>now){el.style.display='none';}
      if(until&&new Date(until)<now){el.style.display='none';}
    });
  })();
  </script>
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
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="white" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    reddit: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>',
    threads: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.723 2.098-1.122 3.537-1.162 1.035-.028 1.99.1 2.86.38-.075-.45-.203-.862-.382-1.227-.39-.794-1.074-1.214-2.038-1.252a3.063 3.063 0 0 0-.543.019l-.006-.024c.024-.002.28-.038.543-.019.028-.001.054 0 .082 0a4.14 4.14 0 0 1 .676.06c1.413.21 2.476.967 3.072 2.188.357.73.543 1.584.55 2.55.004.067.003.135 0 .203a9.395 9.395 0 0 1 2.115 1.383c.967.795 1.666 1.837 2.072 3.094.655 2.022.453 4.455-1.423 6.326-1.889 1.884-4.199 2.705-7.484 2.728zm-.07-5.882c1.164-.064 2.06-.488 2.664-1.24.57-.713.925-1.7 1.055-2.932a8.568 8.568 0 0 0-2.953-.496c-1.062.03-1.916.306-2.47.8-.522.465-.758 1.074-.725 1.863.039.71.371 1.303.938 1.67.62.402 1.452.528 2.251.464.08-.005.16-.012.24-.02v-.109z"/></svg>',
    bluesky: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.476 6.153 3.228-4.187.644-7.937 2.27-3.592 7.938 5.146 5.854 7.14-1.545 8.815-5.606 1.675 4.061 3.17 10.939 8.815 5.606 4.345-5.668.594-7.294-3.592-7.938 2.553.248 5.368-.601 6.153-3.228.246-.828.624-5.789.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  };

  return icons[iconKey] || icons.link;
}
