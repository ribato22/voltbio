"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { User, Upload, X, Loader2 } from "lucide-react";
import { compressAvatar, validateImageFile } from "@/lib/image-utils";

export function ProfileEditor() {
  const profile = useStore((s) => s.config.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const compressed = await compressAvatar(file);
      updateProfile({ avatar: compressed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    updateProfile({ avatar: "" });
    setError(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <User className="w-4 h-4 text-[var(--lf-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">Profile</h3>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--lf-border)] hover:border-[var(--lf-accent)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--lf-accent)] focus:ring-offset-2 focus:ring-offset-[var(--lf-bg)]"
            aria-label="Upload avatar image"
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.name || "User"} avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--lf-card-bg)] flex items-center justify-center text-[var(--lf-muted)]">
                <User className="w-6 h-6" />
              </div>
            )}

            {/* Upload overlay */}
            {uploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Upload className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </button>

          {/* Remove button */}
          {profile.avatar && !uploading && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Remove avatar"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarUpload}
            className="hidden"
            aria-label="Upload avatar image"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </>
            )}
          </Button>
          <p className="text-xs text-[var(--lf-muted)] mt-1">
            JPG, PNG, WebP, or GIF · Auto-compressed
          </p>
          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </div>
      </div>

      <Input
        label="Display Name"
        value={profile.name}
        onChange={(e) => updateProfile({ name: e.target.value })}
        placeholder="Your Name"
        maxLength={50}
      />

      <Input
        label="Username"
        value={profile.username}
        onChange={(e) => updateProfile({ username: e.target.value })}
        placeholder="username"
        maxLength={30}
      />

      <Textarea
        label="Bio"
        value={profile.bio}
        onChange={(e) => updateProfile({ bio: e.target.value })}
        placeholder="Tell the world about yourself..."
        maxLength={300}
        hint={`${profile.bio.length}/300`}
      />

      <Input
        label="Location"
        value={profile.location || ""}
        onChange={(e) => updateProfile({ location: e.target.value })}
        placeholder="City, Country"
        maxLength={100}
      />
    </div>
  );
}
