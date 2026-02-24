/* ============================================================
   VoltBio — Embed Detection & URL Generation

   Detects YouTube and Spotify URLs and generates embed iframe URLs.
   Pure client-side, no external dependencies.
   ============================================================ */

export type EmbedPlatform = "youtube" | "spotify" | null;

export interface EmbedInfo {
  platform: EmbedPlatform;
  embedUrl: string;
  /** "video" for YouTube, "track" or "episode" for Spotify */
  type: string;
}

/* ─────────────────────────────────────────────
   YouTube Patterns
   ───────────────────────────────────────────── */

const YOUTUBE_PATTERNS = [
  // youtube.com/watch?v=VIDEO_ID
  /(?:youtube\.com\/watch\?.*v=)([\w-]{11})/,
  // youtu.be/VIDEO_ID
  /(?:youtu\.be\/)([\w-]{11})/,
  // youtube.com/embed/VIDEO_ID
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  // youtube.com/shorts/VIDEO_ID
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
];

/* ─────────────────────────────────────────────
   Spotify Patterns
   ───────────────────────────────────────────── */

const SPOTIFY_PATTERNS = [
  // open.spotify.com/track/TRACK_ID
  /(?:open\.spotify\.com\/(track)\/)([\w]+)/,
  // open.spotify.com/episode/EPISODE_ID
  /(?:open\.spotify\.com\/(episode)\/)([\w]+)/,
  // open.spotify.com/album/ALBUM_ID
  /(?:open\.spotify\.com\/(album)\/)([\w]+)/,
  // open.spotify.com/playlist/PLAYLIST_ID
  /(?:open\.spotify\.com\/(playlist)\/)([\w]+)/,
];

/**
 * Detect if a URL is embeddable and return embed info.
 *
 * @param url - The URL to check
 * @returns EmbedInfo if embeddable, or null
 */
export function detectEmbed(url: string): EmbedInfo | null {
  if (!url) return null;

  // YouTube
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        platform: "youtube",
        embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0`,
        type: "video",
      };
    }
  }

  // Spotify
  for (const pattern of SPOTIFY_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1] && match?.[2]) {
      return {
        platform: "spotify",
        embedUrl: `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`,
        type: match[1],
      };
    }
  }

  return null;
}

/**
 * Check if a URL is embeddable (quick boolean check).
 */
export function isEmbeddable(url: string): boolean {
  return detectEmbed(url) !== null;
}

/**
 * Get the Spotify iframe height based on content type.
 * Tracks/episodes = compact player, albums/playlists = full player.
 */
export function getSpotifyHeight(type: string): number {
  return type === "track" || type === "episode" ? 152 : 352;
}
