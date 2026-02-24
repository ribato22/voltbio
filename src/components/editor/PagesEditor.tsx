"use client";

import { useStore } from "@/lib/store";
import { Plus, Trash2, LayoutGrid, GripVertical } from "lucide-react";
import type { HubTab } from "@/types";

export function PagesEditor() {
  const pages = useStore((s) => s.config.pages || []);
  const links = useStore((s) => s.config.links);
  const addPage = useStore((s) => s.addPage);
  const updatePage = useStore((s) => s.updatePage);
  const removePage = useStore((s) => s.removePage);

  const toggleLinkInPage = (pageId: string, linkId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    const has = page.linkIds.includes(linkId);
    updatePage(pageId, {
      linkIds: has
        ? page.linkIds.filter((id) => id !== linkId)
        : [...page.linkIds, linkId],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">
          Page Tabs
        </h3>
        <button
          type="button"
          onClick={() => addPage()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--lf-accent)] text-white hover:opacity-90 cursor-pointer transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Tab
        </button>
      </div>

      {pages.length === 0 && (
        <div className="text-center py-6 space-y-2">
          <LayoutGrid className="w-8 h-8 mx-auto text-[var(--lf-muted)] opacity-40" />
          <p className="text-xs text-[var(--lf-muted)]">
            No tabs yet. All links show on one page.
          </p>
          <p className="text-[10px] text-[var(--lf-muted)] opacity-60">
            Create tabs to group your links into categories like &quot;Services&quot;, &quot;Documents&quot;, &quot;Contact&quot;.
          </p>
        </div>
      )}

      {pages.map((page: HubTab) => (
        <div
          key={page.id}
          className="p-3 space-y-2.5 rounded-xl border border-[var(--lf-border)] bg-[var(--lf-card-bg)]"
        >
          {/* Tab label */}
          <div className="flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-[var(--lf-muted)] opacity-40" />
            <input
              type="text"
              value={page.label}
              onChange={(e) =>
                updatePage(page.id, { label: e.target.value })
              }
              placeholder="Tab name"
              className="flex-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
            />
            <button
              type="button"
              onClick={() => removePage(page.id)}
              className="p-1.5 text-[var(--lf-muted)] hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Link assignment checkboxes */}
          <div className="space-y-1">
            <p className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider font-medium">
              Links in this tab:
            </p>
            {links.length === 0 && (
              <p className="text-[10px] text-[var(--lf-muted)] opacity-60">No links created yet.</p>
            )}
            <div className="max-h-32 overflow-y-auto space-y-0.5 pr-1">
              {links.filter((l) => l.type !== "header").map((link) => (
                <label
                  key={link.id}
                  className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-[var(--lf-bg)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={page.linkIds.includes(link.id)}
                    onChange={() => toggleLinkInPage(page.id, link.id)}
                    className="w-3.5 h-3.5 rounded accent-[var(--lf-accent)] cursor-pointer"
                  />
                  <span className="text-[11px] text-[var(--lf-text)] truncate">
                    {link.title || link.url || "Untitled"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      {pages.length > 0 && (
        <p className="text-[10px] text-[var(--lf-muted)] text-center">
          💡 Links not assigned to any tab will show on all tabs.
        </p>
      )}
    </div>
  );
}
