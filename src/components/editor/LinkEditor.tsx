"use client";

import { useState } from "react";
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
import {
  Link2,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import type { LinkItem } from "@/types";

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
        <SocialIcon iconKey={iconKey} size={16} className="text-[var(--lf-accent)]" />

        {/* Title & URL */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--lf-text)] truncate">
            {link.title || "Untitled"}
          </p>
          <p className="text-xs text-[var(--lf-muted)] truncate">
            {link.url || "https://"}
          </p>
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
            label="Title"
            value={link.title}
            onChange={(e) => onUpdate(link.id, { title: e.target.value })}
            placeholder="Link Title"
            maxLength={100}
          />

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

          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(link.id)}
            className="w-full"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Link
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
        <Button size="sm" onClick={() => addLink()}>
          <Plus className="w-3.5 h-3.5" />
          Add Link
        </Button>
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
