/* ============================================================
   VoltBio — Client-side AES-GCM Encryption for Password-Protected Links
   Uses Web Crypto API — works in all modern browsers & static exports
   ============================================================ */

/**
 * Derive a 256-bit AES-GCM key from a plain-text password using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a URL string using a password.
 * Returns a base64 string containing: salt (16 bytes) + iv (12 bytes) + ciphertext.
 */
export async function encryptUrl(url: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(url)
  );

  // Combine salt + iv + ciphertext into a single buffer
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt an encrypted URL string using a password.
 * Returns the original URL, or null if the password is wrong.
 */
export async function decryptUrl(encrypted: string, password: string): Promise<string | null> {
  try {
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // Wrong password → AES-GCM authentication fails
    return null;
  }
}
