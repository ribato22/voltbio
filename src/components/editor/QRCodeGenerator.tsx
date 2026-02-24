"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QrCode, Download, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** QR Code visual styles */
const qrStyles = [
  { id: "classic", label: "Classic", dotScale: 1.0, rounded: false },
  { id: "rounded", label: "Rounded", dotScale: 0.85, rounded: true },
] as const;

/**
 * Smart QR Code Generator
 *
 * Generates a theme-aware QR code from the user's bio page URL.
 * Features:
 * - Auto-generates URL from username
 * - Uses active theme's accent color
 * - High-res Canvas rendering (1024px)
 * - Download as PNG
 * - Copy URL to clipboard
 */
export function QRCodeGenerator() {
  const profile = useStore((s) => s.config.profile);
  const theme = useStore((s) => s.config.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStyle, setActiveStyle] = useState<"classic" | "rounded">("rounded");

  // Build the default URL from username
  const defaultUrl = profile.username
    ? `https://${profile.username}.github.io/voltbio`
    : "https://voltbio.app";

  const qrUrl = customUrl.trim() || defaultUrl;

  // Generate QR code on canvas
  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 1024; // High-res for print quality
    const margin = 4;

    try {
      await QRCode.toCanvas(canvas, qrUrl, {
        width: size,
        margin,
        color: {
          dark: theme.colors.accent,
          light: "#00000000", // Transparent background
        },
        errorCorrectionLevel: "H", // High error correction for logo overlay
      });

      // If rounded style, we'll redraw with rounded modules
      if (activeStyle === "rounded") {
        drawRoundedQR(canvas, theme.colors.accent, margin, size);
      }
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }, [qrUrl, theme.colors.accent, activeStyle]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // Download QR as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas with white background for download
    const downloadCanvas = document.createElement("canvas");
    const padding = 80;
    downloadCanvas.width = canvas.width + padding * 2;
    downloadCanvas.height = canvas.height + padding * 2 + 60; // Extra space for text

    const ctx = downloadCanvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Draw QR code centered
    ctx.drawImage(canvas, padding, padding);

    // Add URL text below
    ctx.fillStyle = "#666666";
    ctx.font = "500 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      qrUrl.replace(/^https?:\/\//, ""),
      downloadCanvas.width / 2,
      canvas.height + padding + 45
    );

    // Trigger download
    const link = document.createElement("a");
    link.download = `${profile.username || "voltbio"}-qrcode.png`;
    link.href = downloadCanvas.toDataURL("image/png");
    link.click();
  };

  // Copy URL to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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

      {/* QR Code Preview */}
      <div className="flex flex-col items-center gap-4 p-5 rounded-2xl bg-white border border-[var(--lf-border)]">
        <canvas
          ref={canvasRef}
          className="w-48 h-48"
          style={{ imageRendering: "pixelated" }}
        />
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
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="w-3.5 h-3.5" />
          Download PNG
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="flex-1"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy URL
            </>
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
   Rounded QR Code Renderer
   
   Redraws the QR modules as rounded rectangles
   for a modern, premium look.
   ───────────────────────────────────────────── */

function drawRoundedQR(
  canvas: HTMLCanvasElement,
  color: string,
  margin: number,
  size: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Read the current pixel data to find module positions
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Detect module size by finding first dark pixel
  let moduleSize = 0;
  let startX = 0;
  let startY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      if (pixels[idx + 3] > 128) {
        // Non-transparent pixel found
        if (moduleSize === 0) {
          startX = x;
          startY = y;
          // Measure module width
          let w = 0;
          while (x + w < canvas.width) {
            const ci = (y * canvas.width + (x + w)) * 4;
            if (pixels[ci + 3] > 128) w++;
            else break;
          }
          moduleSize = w;
        }
        break;
      }
    }
    if (moduleSize > 0) break;
  }

  if (moduleSize === 0) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw modules as rounded rectangles
  ctx.fillStyle = color;
  const radius = moduleSize * 0.35; // Corner radius

  for (let y = startY; y < canvas.height; y += moduleSize) {
    for (let x = startX; x < canvas.width; x += moduleSize) {
      // Check if this module is dark
      const idx = ((y + Math.floor(moduleSize / 2)) * canvas.width + (x + Math.floor(moduleSize / 2)));
      // We already cleared the canvas, so check from original imageData
      const pixIdx = idx * 4;
      if (pixIdx < pixels.length && pixels[pixIdx + 3] > 128) {
        roundRect(ctx, x, y, moduleSize, moduleSize, radius);
      }
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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
