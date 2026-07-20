// ── Shared book derivation helpers ───────────────────────────────────────────
// Used by useBooks.js and WishlistContext.js — single source of truth.

const COVER_PALETTE = [
  "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
  "#d35400", "#16a085", "#2c3e50", "#e67e22",
];

const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "";

/** Fallback colour tile for books with no uploaded image. */
export function deriveCover(id) {
  return COVER_PALETTE[id % COVER_PALETTE.length];
}

/**
 * Public Supabase Storage URL for a book cover.
 * Files are named exactly as the book title, e.g. "The Art of Focus.webp".
 * encodeURIComponent handles spaces and apostrophes in the filename.
 */
export function deriveCoverUrl(title) {
  if (!SUPABASE_BUCKET || !title) return null;
  return `${SUPABASE_BUCKET}/${encodeURIComponent(title.trim())}.webp`;
}

/** Two-letter initials derived from the title (skips common stop words). */
export function deriveInitials(title) {
  if (!title) return "?";
  const skip = new Set(["a", "an", "the", "of", "in", "on", "at", "to", "and"]);
  const words = title.trim().split(/\s+/).filter((w) => !skip.has(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("") || title[0].toUpperCase();
}
