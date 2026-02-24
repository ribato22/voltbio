"use client";

import { useRef } from "react";
import { ImagePlus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PortfolioImage } from "@/types";

const MAX_IMAGES = 12;
const MAX_SIZE_PX = 800;
const JPEG_QUALITY = 0.7;

interface Props {
  images: PortfolioImage[];
  onChange: (images: PortfolioImage[]) => void;
}

/** Compress an image file to Base64 JPEG via Canvas */
function compressImage(file: File): Promise<PortfolioImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        // Resize
        if (w > MAX_SIZE_PX || h > MAX_SIZE_PX) {
          if (w > h) { h = (h / w) * MAX_SIZE_PX; w = MAX_SIZE_PX; }
          else { w = (w / h) * MAX_SIZE_PX; h = MAX_SIZE_PX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas error")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          dataUrl,
          width: Math.round(w),
          height: Math.round(h),
        });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * PortfolioUploader — Multi-image upload with Canvas compression.
 * Images stored as Base64 in Zustand (no server).
 */
export function PortfolioUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const compressed = await Promise.all(toProcess.map(compressImage));
    onChange([...images, ...compressed]);
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(images.map((img) => img.id === id ? { ...img, caption } : img));
  };

  return (
    <div className="space-y-3">
      {/* Upload trigger */}
      <div
        className="border-2 border-dashed border-[var(--lf-border)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--lf-accent)]/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="w-6 h-6 mx-auto mb-1 text-[var(--lf-muted)]" />
        <p className="text-xs text-[var(--lf-muted)]">
          Click to upload images ({images.length}/{MAX_IMAGES})
        </p>
        <p className="text-[10px] text-[var(--lf-muted)]/60 mt-0.5">
          Auto-compressed to JPEG · Max 800px
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[var(--lf-border)]">
              <img
                src={img.dataUrl}
                alt={img.caption || "Portfolio image"}
                className="w-full h-20 object-cover"
              />
              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3 text-white drop-shadow" />
              </div>
              {/* Caption input */}
              <input
                type="text"
                value={img.caption || ""}
                onChange={(e) => updateCaption(img.id, e.target.value)}
                placeholder="Caption..."
                className="w-full px-1.5 py-1 text-[10px] bg-[var(--lf-card-bg)] border-t border-[var(--lf-border)] outline-none text-[var(--lf-text)] placeholder:text-[var(--lf-muted)]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
