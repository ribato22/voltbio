"use client";

import { useStore } from "@/lib/store";
import { ProfileConfigSchema } from "@/lib/schema";
import type { ProfileConfig } from "@/types";

/**
 * Export the current Zustand config as a downloadable `profile.json` file.
 */
export function exportConfig() {
  const config = useStore.getState().config;

  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "profile.json";
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Result of a JSON import attempt.
 */
export interface ImportResult {
  success: boolean;
  error?: string;
  config?: ProfileConfig;
}

/**
 * Read a `.json` file from the user's filesystem and validate it with Zod.
 * If valid, import it into the Zustand store.
 *
 * @returns A promise resolving to the import result.
 */
export function importConfig(): Promise<ImportResult> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false, error: "No file selected." });
        return;
      }

      try {
        const text = await file.text();
        const raw = JSON.parse(text);

        // Validate with Zod
        const result = ProfileConfigSchema.safeParse(raw);

        if (!result.success) {
          const firstError = result.error.issues[0];
          resolve({
            success: false,
            error: `Invalid config: ${firstError.path.join(".")} — ${firstError.message}`,
          });
          return;
        }

        // Apply validated config to the store
        useStore.getState().importConfig(result.data);
        resolve({ success: true, config: result.data });
      } catch {
        resolve({
          success: false,
          error: "Failed to parse JSON file. Please check the file format.",
        });
      }
    };

    // Handle cancel (no file selected)
    input.oncancel = () => {
      resolve({ success: false, error: "Import cancelled." });
    };

    input.click();
  });
}

/**
 * Copy the current config to clipboard as JSON string.
 */
export async function copyConfigToClipboard(): Promise<boolean> {
  try {
    const config = useStore.getState().config;
    const json = JSON.stringify(config, null, 2);
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}
