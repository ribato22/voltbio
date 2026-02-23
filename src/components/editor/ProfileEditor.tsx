"use client";

import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { User, Upload, X } from "lucide-react";
import { useRef } from "react";

export function ProfileEditor() {
  const profile = useStore((s) => s.config.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
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
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={`${profile.name || "User"} avatar`}
              loading="lazy"
              className="w-16 h-16 rounded-full object-cover border-2 border-[var(--lf-border)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--lf-card-bg)] border-2 border-[var(--lf-border)] flex items-center justify-center text-[var(--lf-muted)]">
              <User className="w-6 h-6" />
            </div>
          )}
          {profile.avatar && (
            <button
              type="button"
              onClick={() => updateProfile({ avatar: "" })}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            aria-label="Upload avatar image"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </Button>
          <p className="text-xs text-[var(--lf-muted)] mt-1">Max 2MB, JPG/PNG</p>
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
