"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { SocialIcon } from "@/components/preview/SocialIcon";
import { detectSocialIcon, cn } from "@/lib/utils";
import { isEmbeddable, detectEmbed } from "@/lib/embed";
import { detectPdfUrl } from "@/lib/utils";
import {
  Link2,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  FolderOpen,
  Lock,
  Unlock,

  Zap,
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
  FileText,
  Coffee,
  Upload,
} from "lucide-react";
import type { LinkItem, ActionField } from "@/types";
import { encryptUrl } from "@/lib/crypto";
import { nanoid } from "nanoid";
import { compressAvatar, validateImageFile } from "@/lib/image-utils";

const DONATION_PLATFORMS = [
  { value: "qris", label: "QRIS", icon: "📱" },
  { value: "saweria", label: "Saweria", icon: "🪙" },
  { value: "trakteer", label: "Trakteer", icon: "☕" },
  { value: "kofi", label: "Ko-fi", icon: "☕" },
  { value: "patreon", label: "Patreon", icon: "🎨" },
] as const;

/* ─────────────────────────────────────────────
   Select Options Input (local state + onBlur)
   ───────────────────────────────────────────── */

function SelectOptionsInput({ value, onChange }: { value: string[]; onChange: (opts: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <div className="px-2 pb-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const opts = text.split(",").map((s) => s.trim()).filter(Boolean);
          onChange(opts);
        }}
        placeholder="Options (comma-separated): Konsultasi, Pemeriksaan"
        className="w-full text-[10px] px-2 py-1.5 rounded bg-[var(--lf-border)]/30 border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
      />
      <p className="text-[9px] text-[var(--lf-muted)] mt-0.5">
        Separate options with commas
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Password Input for Link Locking
   ───────────────────────────────────────────── */

function PasswordInput({
  linkId,
  linkUrl,
  hasEncrypted,
  onUpdate,
}: {
  linkId: string;
  linkUrl: string;
  hasEncrypted: boolean;
  onUpdate: (id: string, u: Partial<LinkItem>) => void;
}) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const handleEncrypt = useCallback(async () => {
    if (!pw || !linkUrl) return;
    setBusy(true);
    try {
      const encrypted = await encryptUrl(linkUrl, pw);
      onUpdate(linkId, { encryptedUrl: encrypted });
      setPw("");
    } finally {
      setBusy(false);
    }
  }, [pw, linkUrl, linkId, onUpdate]);

  if (hasEncrypted) {
    return (
      <p className="text-[10px] text-emerald-500 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Encrypted ✓ — visitors must enter password
      </p>
    );
  }

  return (
    <div className="flex gap-1.5">
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEncrypt()}
        placeholder="Set password..."
        className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
      />
      <button
        type="button"
        disabled={!pw || busy}
        onClick={handleEncrypt}
        className="px-2.5 py-1.5 rounded-lg bg-[var(--lf-accent)] text-white text-xs font-medium disabled:opacity-40 cursor-pointer"
      >
        {busy ? "..." : "Lock"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sortable Link Item
   ───────────────────────────────────────────── */

function SortableLinkItem({
  link,
  onUpdate,
  onRemove,
  onToggle,
}: {
  link: LinkItem;
  onUpdate: (id: string, updates: Partial<LinkItem>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const iconKey = detectSocialIcon(link.url);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border bg-[var(--lf-card-bg)] border-[var(--lf-border)]",
        "transition-shadow duration-200",
        isDragging && "shadow-xl shadow-[var(--lf-accent)]/10 z-50 opacity-90",
        !link.enabled && "opacity-50"
      )}
    >
      {/* ── Header Row ── */}
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-[var(--lf-muted)] hover:text-[var(--lf-text)] hover:bg-[var(--lf-border)] transition-colors touch-none"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Icon */}
        {link.type === "header" ? (
          <FolderOpen className="w-4 h-4 text-[var(--lf-accent)]" />
        ) : link.type === "action" ? (
          <Zap className="w-4 h-4 text-[var(--lf-accent)]" />
        ) : (
          <SocialIcon iconKey={iconKey} size={16} className="text-[var(--lf-accent)]" />
        )}

        {/* Title & URL */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--lf-text)] truncate">
            {link.type === "header" ? `📂 ${link.title || "Section"}` : link.type === "action" ? `⚡ ${link.title || "Action"}` : link.title || "Untitled"}
          </p>
          {link.type === "action" && link.actionConfig?.whatsappNumber && (
            <p className="text-xs text-[var(--lf-muted)] truncate">
              WA: {link.actionConfig.whatsappNumber}
            </p>
          )}
          {link.type !== "header" && link.type !== "action" && (
            <p className="text-xs text-[var(--lf-muted)] truncate">
              {link.url || "https://"}
            </p>
          )}
        </div>

        {/* Enable/Disable */}
        <Toggle
          checked={link.enabled}
          onCheckedChange={() => onToggle(link.id)}
          id={`toggle-${link.id}`}
        />

        {/* Expand */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="p-1.5 rounded-lg text-[var(--lf-muted)] hover:text-[var(--lf-text)] hover:bg-[var(--lf-border)] transition-colors cursor-pointer"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse link details" : "Expand link details"}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Expanded Edit Form ── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-[var(--lf-border)] pt-3">
          <Input
            label={link.type === "header" ? "Section Title" : "Title"}
            value={link.title}
            onChange={(e) => onUpdate(link.id, { title: e.target.value })}
            placeholder={link.type === "header" ? "Section Name" : "Link Title"}
            maxLength={100}
          />

          {/* ── Link-only fields (hide for section headers and actions) ── */}
          {link.type !== "header" && link.type !== "action" && (
            <>
              <Input
                label="URL"
                value={link.url}
                onChange={(e) => {
                  const url = e.target.value;
                  onUpdate(link.id, {
                    url,
                    icon: detectSocialIcon(url),
                  });
                }}
                placeholder="https://example.com"
                type="url"
              />

              {/* ── Embed Toggle ── */}
              {isEmbeddable(link.url) && (() => {
                const info = detectEmbed(link.url);
                const label = info?.platform === "youtube"
                  ? "▶ Show YouTube Player"
                  : info?.platform === "spotify"
                    ? "🎵 Show Spotify Player"
                    : "Show Embed";
                return (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--lf-accent)]/5 border border-[var(--lf-accent)]/20">
                    <span className="text-xs font-medium text-[var(--lf-text)]">
                      {label}
                    </span>
                    <Toggle
                      checked={!!link.isEmbed}
                      onCheckedChange={() =>
                        onUpdate(link.id, { isEmbed: !link.isEmbed })
                      }
                      id={`embed-${link.id}`}
                    />
                  </div>
                );
              })()}

              {/* ── PDF Embed Toggle ── */}
              {!link.isEmbed && detectPdfUrl(link.url) && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                  <span className="text-xs font-medium text-[var(--lf-text)] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    Display as PDF Document
                  </span>
                  <Toggle
                    checked={!!link.isPdfEmbed}
                    onCheckedChange={() =>
                      onUpdate(link.id, { isPdfEmbed: !link.isPdfEmbed })
                    }
                    id={`pdf-${link.id}`}
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-[var(--lf-muted)] mb-2">
                  Open in
                </p>
                <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-bg)] border border-[var(--lf-border)]">
                  {(["_blank", "_self"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onUpdate(link.id, { target: t })}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                        link.target === t
                          ? "bg-[var(--lf-accent)] text-white"
                          : "text-[var(--lf-muted)]"
                      )}
                      aria-pressed={link.target === t}
                    >
                      {t === "_blank" ? (
                        <>
                          <ExternalLink className="w-3 h-3" />
                          New Tab
                        </>
                      ) : (
                        "Same Tab"
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Schedule Settings ── */}
              <div>
                <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Schedule (optional)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--lf-muted)] mb-0.5 block">Start Date</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={link.validFrom || ""}
                        onChange={(e) => onUpdate(link.id, { validFrom: e.target.value || undefined })}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
                      />
                      {link.validFrom && (
                        <button
                          type="button"
                          onClick={() => onUpdate(link.id, { validFrom: undefined })}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--lf-muted)] hover:text-[var(--lf-text)] text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--lf-muted)] mb-0.5 block">End Date</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={link.validUntil || ""}
                        onChange={(e) => onUpdate(link.id, { validUntil: e.target.value || undefined })}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
                      />
                      {link.validUntil && (
                        <button
                          type="button"
                          onClick={() => onUpdate(link.id, { validUntil: undefined })}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--lf-muted)] hover:text-[var(--lf-text)] text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Password Lock ── */}
              <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-[var(--lf-accent)]/5 border border-[var(--lf-accent)]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--lf-text)] flex items-center gap-1.5">
                    {link.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    Password Lock
                  </span>
                  <Toggle
                    checked={!!link.isLocked}
                    onCheckedChange={async () => {
                      if (link.isLocked) {
                        // Unlock: clear encrypted data
                        onUpdate(link.id, { isLocked: false, encryptedUrl: undefined });
                      } else {
                        // Lock: will need password input
                        onUpdate(link.id, { isLocked: true });
                      }
                    }}
                    id={`lock-${link.id}`}
                  />
                </div>
                {link.isLocked && (
                  <PasswordInput linkId={link.id} linkUrl={link.url} hasEncrypted={!!link.encryptedUrl} onUpdate={onUpdate} />
                )}
              </div>
            </>
          )}

          {/* ── Action Config Form ── */}
          {link.type === "action" && link.actionConfig && (
            <div className="space-y-3">
              {/* WhatsApp Number */}
              <Input
                label="WhatsApp Number"
                value={link.actionConfig.whatsappNumber}
                onChange={(e) =>
                  onUpdate(link.id, {
                    actionConfig: { ...link.actionConfig!, whatsappNumber: e.target.value },
                  })
                }
                placeholder="628123456789"
              />

              {/* Message Template */}
              <div>
                <label className="text-xs font-medium text-[var(--lf-text)] mb-1 block">
                  Message Template
                </label>
                <textarea
                  value={link.actionConfig.messageTemplate}
                  onChange={(e) =>
                    onUpdate(link.id, {
                      actionConfig: { ...link.actionConfig!, messageTemplate: e.target.value },
                    })
                  }
                  placeholder={"Halo, saya {nama}.\nBooking: {layanan}\nTanggal: {tanggal}"}
                  rows={3}
                  maxLength={2000}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)] font-mono resize-none"
                />
                <p className="text-[10px] text-[var(--lf-muted)] mt-1">
                  Use {"{field_label}"} to insert visitor input. e.g. {"{nama}"}, {"{layanan}"}
                </p>
              </div>

              {/* Form Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[var(--lf-text)]">
                    Form Fields ({link.actionConfig.fields.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newField: ActionField = {
                        id: nanoid(6),
                        label: "",
                        placeholder: "",
                        type: "text",
                      };
                      onUpdate(link.id, {
                        actionConfig: {
                          ...link.actionConfig!,
                          fields: [...link.actionConfig!.fields, newField],
                        },
                      });
                    }}
                    className="text-[10px] text-[var(--lf-accent)] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <PlusIcon className="w-3 h-3" /> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {link.actionConfig.fields.map((field, fi) => (
                    <div key={field.id} className="rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] overflow-hidden">
                      <div className="flex items-center gap-1.5 p-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => {
                            const fields = [...link.actionConfig!.fields];
                            fields[fi] = { ...fields[fi], label: e.target.value };
                            onUpdate(link.id, { actionConfig: { ...link.actionConfig!, fields } });
                          }}
                          placeholder="Label"
                          className="flex-1 text-xs px-2 py-1 rounded bg-transparent text-[var(--lf-text)] focus:outline-none"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const fields = [...link.actionConfig!.fields];
                            fields[fi] = { ...fields[fi], type: e.target.value as ActionField["type"] };
                            onUpdate(link.id, { actionConfig: { ...link.actionConfig!, fields } });
                          }}
                          className="text-[10px] px-1.5 py-1 rounded bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] cursor-pointer"
                        >
                          <option value="text">Text</option>
                          <option value="date">Date</option>
                          <option value="select">Select</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const fields = link.actionConfig!.fields.filter((_, i) => i !== fi);
                            onUpdate(link.id, { actionConfig: { ...link.actionConfig!, fields } });
                          }}
                          className="p-1 text-[var(--lf-muted)] hover:text-red-400 cursor-pointer"
                        >
                          <Trash2Icon className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Select Options Input */}
                      {field.type === "select" && (
                        <SelectOptionsInput
                          value={field.options || []}
                          onChange={(opts) => {
                            const fields = [...link.actionConfig!.fields];
                            fields[fi] = { ...fields[fi], options: opts };
                            onUpdate(link.id, { actionConfig: { ...link.actionConfig!, fields } });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Donation Config ── */}
          {link.type === "donation" && (
            <div className="space-y-3 p-3 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)]">
              <p className="text-xs font-semibold text-[var(--lf-text)] flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                Donation Settings
              </p>

              {/* Platform selector */}
              <div>
                <label className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider font-medium mb-1 block">
                  Platform
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DONATION_PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => onUpdate(link.id, { donationPlatform: p.value })}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
                        link.donationPlatform === p.value
                          ? "bg-[var(--lf-accent)] text-white border-transparent"
                          : "bg-[var(--lf-card-bg)] text-[var(--lf-text)] border-[var(--lf-border)] hover:border-[var(--lf-accent)]"
                      )}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA text */}
              <Input
                label="Call-to-Action"
                value={link.donationCta || ""}
                onChange={(e) => onUpdate(link.id, { donationCta: e.target.value })}
                placeholder="Traktir saya kopi ☕"
              />

              {/* URL for non-QRIS platforms */}
              {link.donationPlatform !== "qris" && (
                <Input
                  label="Donation URL"
                  value={link.url}
                  onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                  placeholder={
                    link.donationPlatform === "saweria" ? "https://saweria.co/username" :
                    link.donationPlatform === "trakteer" ? "https://trakteer.id/username" :
                    link.donationPlatform === "kofi" ? "https://ko-fi.com/username" :
                    "https://patreon.com/username"
                  }
                />
              )}

              {/* QRIS image upload */}
              {link.donationPlatform === "qris" && (
                <div>
                  <label className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider font-medium mb-1.5 block">
                    QRIS Barcode Image
                  </label>
                  {link.qrisImage && (
                    <div className="mb-2 p-2 bg-white rounded-lg border border-[var(--lf-border)] inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={link.qrisImage} alt="QRIS" className="w-32 h-32 object-contain" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--lf-border)] hover:border-[var(--lf-accent)] cursor-pointer transition-colors bg-[var(--lf-card-bg)]">
                    <Upload className="w-4 h-4 text-[var(--lf-muted)]" />
                    <span className="text-xs text-[var(--lf-muted)]">
                      {link.qrisImage ? "Ganti gambar" : "Upload QRIS barcode"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const err = validateImageFile(file);
                        if (err) { alert(err); return; }
                        try {
                          const compressed = await compressAvatar(file);
                          onUpdate(link.id, { qrisImage: compressed });
                        } catch {
                          alert("Failed to process image");
                        }
                      }}
                    />
                  </label>
                  <p className="text-[9px] text-[var(--lf-muted)] mt-1">
                    Auto-compressed to {'<'}150KB for safe localStorage storage.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(link.id)}
            className="w-full"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {link.type === "header" ? "Delete Section" : link.type === "donation" ? "Delete Donation" : "Delete Link"}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Link Editor (main export)
   ───────────────────────────────────────────── */

export function LinkEditor() {
  const links = useStore((s) => s.config.links);
  const addLink = useStore((s) => s.addLink);
  const addSection = useStore((s) => s.addSection);
  const addAction = useStore((s) => s.addAction);
  const addDonation = useStore((s) => s.addDonation);
  const updateLink = useStore((s) => s.updateLink);
  const removeLink = useStore((s) => s.removeLink);
  const toggleLink = useStore((s) => s.toggleLink);
  const reorderLinks = useStore((s) => s.reorderLinks);

  // ── Sensors: Pointer + Touch + Keyboard ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedLinks.findIndex((l) => l.id === active.id);
    const newIndex = sortedLinks.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(sortedLinks, oldIndex, newIndex);
    reorderLinks(reordered);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[var(--lf-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--lf-text)]">Links</h3>
          <span className="text-xs text-[var(--lf-muted)]">
            ({links.length})
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => addSection()}>
            <FolderOpen className="w-3.5 h-3.5" />
            Section
          </Button>
          <Button size="sm" variant="secondary" onClick={() => addAction()}>
            <Zap className="w-3.5 h-3.5" />
            Action
          </Button>
          <Button size="sm" variant="secondary" onClick={() => addDonation()}>
            <Coffee className="w-3.5 h-3.5" />
            Donation
          </Button>
          <Button size="sm" onClick={() => addLink()}>
            <Plus className="w-3.5 h-3.5" />
            Add Link
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedLinks.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2" role="list" aria-label="Link list">
            {sortedLinks.map((link) => (
              <div key={link.id} role="listitem">
                <SortableLinkItem
                  link={link}
                  onUpdate={updateLink}
                  onRemove={removeLink}
                  onToggle={toggleLink}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {links.length === 0 && (
        <div className="text-center py-8">
          <Link2 className="w-8 h-8 text-[var(--lf-muted)] mx-auto mb-2 opacity-40" />
          <p className="text-sm text-[var(--lf-muted)]">
            No links yet. Click &quot;Add Link&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
