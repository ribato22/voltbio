"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** QR Code visual styles */
const qrStyles = [
  { id: "classic", label: "Classic" },
  { id: "rounded", label: "Rounded" },
] as const;

/**
 * Smart QR Code Generator
 *
 * Generates a theme-aware QR code from the user's bio page URL.
 * The internal canvas is 1024×1024 for print quality, but the
 * displayed preview is scaled down via an <img> element.
 */
export function QRCodeGenerator() {
  const profile = useStore((s) => s.config.profile);
  const theme = useStore((s) => s.config.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [customUrl, setCustomUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStyle, setActiveStyle] = useState<"classic" | "rounded">("rounded");

  // Build the default URL from username
  const defaultUrl = profile.username
    ? `https://${profile.username}.github.io/voltbio`
    : "https://voltbio.app";

  const qrUrl = customUrl.trim() || defaultUrl;

  // Generate QR code on a hidden canvas, then render preview via <img>
  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 1024; // High-res for print
    canvas.width = size;
    canvas.height = size;

    try {
      await QRCode.toCanvas(canvas, qrUrl, {
        width: size,
        margin: 4,
        color: {
          dark: theme.colors.accent,
          light: "#00000000", // Transparent background
        },
        errorCorrectionLevel: "H",
      });

      // If rounded style, redraw modules as rounded rects
      if (activeStyle === "rounded") {
        drawRoundedQR(canvas, theme.colors.accent);
      }

      // Convert canvas to data URL for the preview <img>
      setPreviewSrc(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }, [qrUrl, theme.colors.accent, activeStyle]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // Download QR as PNG (full 1024px with white background + URL text)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 80;
    const dlCanvas = document.createElement("canvas");
    dlCanvas.width = canvas.width + padding * 2;
    dlCanvas.height = canvas.height + padding * 2 + 60;

    const ctx = dlCanvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dlCanvas.width, dlCanvas.height);

    // Draw QR centered
    ctx.drawImage(canvas, padding, padding);

    // URL text below
    ctx.fillStyle = "#666666";
    ctx.font = "500 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      qrUrl.replace(/^https?:\/\//, ""),
      dlCanvas.width / 2,
      canvas.height + padding + 45
    );

    // Trigger download
    const link = document.createElement("a");
    link.download = `${profile.username || "voltbio"}-qrcode.png`;
    link.href = dlCanvas.toDataURL("image/png");
    link.click();
  };

  // Copy URL to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = qrUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <QrCode className="w-4 h-4 text-[var(--lf-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">QR Code</h3>
      </div>

      {/* Hidden canvas for full-res generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scaled-down preview */}
      <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-[var(--lf-border)]">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="QR Code"
            className="w-full max-w-[200px] mx-auto aspect-square object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-full max-w-[200px] mx-auto aspect-square bg-neutral-100 rounded-xl animate-pulse" />
        )}
        <p className="text-xs text-neutral-500 font-medium text-center truncate max-w-full">
          {qrUrl.replace(/^https?:\/\//, "")}
        </p>
      </div>

      {/* Custom URL Override */}
      <Input
        label="Custom URL (optional)"
        value={customUrl}
        onChange={(e) => setCustomUrl(e.target.value)}
        placeholder={defaultUrl}
      />

      {/* Style Toggle */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Style
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {qrStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setActiveStyle(style.id as "classic" | "rounded")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                activeStyle === style.id
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={activeStyle === style.id}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={handleDownload} className="flex-1">
          <Download className="w-3.5 h-3.5" />
          Download PNG
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-1">
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy URL</>
          )}
        </Button>
      </div>

      <p className="text-[10px] text-[var(--lf-muted)] text-center leading-relaxed">
        QR code uses your theme&apos;s accent color · Print-ready 1024×1024px
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Rounded QR — redraws modules as rounded rects
   ───────────────────────────────────────────── */

function drawRoundedQR(canvas: HTMLCanvasElement, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Detect module size by scanning for first non-transparent pixel
  let moduleSize = 0;
  let startX = 0;
  let startY = 0;

  outer: for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      if (pixels[idx + 3] > 128) {
        startX = x;
        startY = y;
        let w = 0;
        while (x + w < canvas.width) {
          const ci = (y * canvas.width + (x + w)) * 4;
          if (pixels[ci + 3] > 128) w++;
          else break;
        }
        moduleSize = w;
        break outer;
      }
    }
  }

  if (moduleSize === 0) return;

  // Clear and redraw as rounded rectangles
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  const radius = moduleSize * 0.35;

  for (let y = startY; y < canvas.height; y += moduleSize) {
    for (let x = startX; x < canvas.width; x += moduleSize) {
      const centerIdx =
        ((y + Math.floor(moduleSize / 2)) * canvas.width +
          (x + Math.floor(moduleSize / 2))) *
        4;
      if (centerIdx < pixels.length && pixels[centerIdx + 3] > 128) {
        roundRect(ctx, x, y, moduleSize, moduleSize, radius);
      }
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
