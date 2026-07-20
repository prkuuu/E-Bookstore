import React, { useState, memo } from "react";

/**
 * Displays a book cover image from Supabase Storage.
 * Falls back to a colour tile with initials if:
 *   - coverUrl is null/undefined (no image uploaded yet)
 *   - the image fails to load (wrong filename, network error)
 */
const BookCover = memo(({ coverUrl, cover, initials, className = "", imgClassName = "" }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showImage = coverUrl && !failed;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={!showImage ? { backgroundColor: cover } : {}}
    >
      {/* Colour + initials fallback (visible when no image or image failed) */}
      {!showImage && (
        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tracking-widest text-white/85">
          {initials}
        </span>
      )}

      {/* Shimmer while image loads */}
      {showImage && !loaded && (
        <div className="absolute inset-0 bg-[#2a2a2a] animate-pulse" />
      )}

      {/* Real image */}
      {showImage && (
        <img
          src={coverUrl}
          alt={initials}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
        />
      )}
    </div>
  );
});

BookCover.displayName = "BookCover";
export default BookCover;
