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

type QRStyle = (typeof qrStyles)[number]["id"];

/**
 * Smart QR Code Generator
 *
 * - Classic: standard square modules via qrcode library
 * - Rounded: custom Canvas renderer using the raw data matrix
 *            with properly sized rounded-rect modules
 * - 1024×1024 hidden canvas for print quality
 * - Scaled <img> preview for clean UI
 */
export function QRCodeGenerator() {
  const profile = useStore((s) => s.config.profile);
  const theme = useStore((s) => s.config.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [customUrl, setCustomUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStyle, setActiveStyle] = useState<QRStyle>("rounded");

  const defaultUrl = profile.username
    ? `https://${profile.username}.github.io/voltbio`
    : "https://voltbio.app";

  const qrUrl = customUrl.trim() || defaultUrl;

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    try {
      if (activeStyle === "rounded") {
        drawRoundedQR(canvas, qrUrl, theme.colors.accent, size);
      } else {
        // Classic: use the library's built-in renderer
        await QRCode.toCanvas(canvas, qrUrl, {
          width: size,
          margin: 4,
          color: { dark: theme.colors.accent, light: "#00000000" },
          errorCorrectionLevel: "H",
        });
      }
      setPreviewSrc(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }, [qrUrl, theme.colors.accent, activeStyle]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // Download as PNG with white background + URL text
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 80;
    const dl = document.createElement("canvas");
    dl.width = canvas.width + padding * 2;
    dl.height = canvas.height + padding * 2 + 60;

    const ctx = dl.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dl.width, dl.height);
    ctx.drawImage(canvas, padding, padding);

    ctx.fillStyle = "#666666";
    ctx.font = "500 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      qrUrl.replace(/^https?:\/\//, ""),
      dl.width / 2,
      canvas.height + padding + 45
    );

    const a = document.createElement("a");
    a.download = `${profile.username || "voltbio"}-qrcode.png`;
    a.href = dl.toDataURL("image/png");
    a.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = qrUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <QrCode className="w-4 h-4 text-[var(--lf-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">QR Code</h3>
      </div>

      {/* Hidden hi-res canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scaled preview */}
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
              onClick={() => setActiveStyle(style.id)}
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

/* ─────────────────────────────────────────────────────────────
   Rounded QR Renderer
   
   Uses QRCode.create() to get the raw boolean matrix, then
   draws each module as a properly-sized rounded rectangle.
   This guarantees correct spacing between modules.
   ───────────────────────────────────────────────────────────── */

function drawRoundedQR(
  canvas: HTMLCanvasElement,
  text: string,
  color: string,
  size: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Generate raw QR data matrix
  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const moduleCount = modules.size; // e.g. 33 for version 4
  const data = modules.data; // Uint8Array: 1 = dark, 0 = light

  // Calculate dimensions
  const quietZone = 4; // modules of padding
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = size / totalModules;

  // Clear canvas (transparent)
  ctx.clearRect(0, 0, size, size);

  // Draw each dark module as a rounded rect
  ctx.fillStyle = color;

  // Gap between modules for visual separation (10% of module size)
  const gap = moduleSize * 0.1;
  const dotSize = moduleSize - gap;
  const radius = dotSize * 0.3; // 30% corner radius — subtle rounding
  const offset = gap / 2;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const idx = row * moduleCount + col;
      if (data[idx]) {
        const x = (col + quietZone) * moduleSize + offset;
        const y = (row + quietZone) * moduleSize + offset;
        roundRect(ctx, x, y, dotSize, dotSize, radius);
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
