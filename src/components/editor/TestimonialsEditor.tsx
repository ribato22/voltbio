"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Star, Plus, Trash2 } from "lucide-react";
import type { Testimonial } from "@/types";

export function TestimonialsEditor() {
  const testimonials = useStore((s) => s.config.testimonials || []);
  const addTestimonial = useStore((s) => s.addTestimonial);
  const updateTestimonial = useStore((s) => s.updateTestimonial);
  const removeTestimonial = useStore((s) => s.removeTestimonial);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">
          Testimonials
        </h3>
        <button
          type="button"
          onClick={addTestimonial}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--lf-accent)] text-white hover:opacity-90 cursor-pointer transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Review
        </button>
      </div>

      {testimonials.length === 0 && (
        <p className="text-xs text-[var(--lf-muted)] text-center py-6">
          No testimonials yet. Add reviews from your clients or patients.
        </p>
      )}

      {testimonials.map((t: Testimonial) => (
        <div
          key={t.id}
          className="p-3 space-y-2 rounded-xl border border-[var(--lf-border)] bg-[var(--lf-card-bg)]"
        >
          {/* Rating row */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  updateTestimonial(t.id, {
                    rating: n as 1 | 2 | 3 | 4 | 5,
                  })
                }
                className="cursor-pointer"
              >
                <Star
                  className="w-4 h-4"
                  fill={n <= t.rating ? "#facc15" : "none"}
                  stroke={n <= t.rating ? "#facc15" : "currentColor"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            <span className="ml-auto">
              <button
                type="button"
                onClick={() => removeTestimonial(t.id)}
                className="p-1 text-[var(--lf-muted)] hover:text-red-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>

          {/* Name */}
          <input
            type="text"
            value={t.name}
            onChange={(e) =>
              updateTestimonial(t.id, { name: e.target.value })
            }
            placeholder="Reviewer name"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
          />

          {/* Review text */}
          <textarea
            value={t.text}
            onChange={(e) =>
              updateTestimonial(t.id, { text: e.target.value })
            }
            placeholder="Write the review text..."
            rows={2}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--lf-bg)] border border-[var(--lf-border)] text-[var(--lf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)] resize-none"
          />
        </div>
      ))}
    </div>
  );
}
