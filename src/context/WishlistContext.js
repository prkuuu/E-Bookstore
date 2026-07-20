import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getWishlistBooks,
  addWishlistItem,
  removeWishlistItem,
} from "../services/wishlistService";
import { deriveCover, deriveCoverUrl, deriveInitials } from "../lib/bookUtils";

function shapeBook(raw) {
  return {
    id:          raw.id,
    title:       raw.title?.trim(),
    author:      raw.author?.trim(),
    format:      raw.format?.trim(),
    price:       raw.price,
    sells:       raw.sells,
    rating:      raw.rating,
    description: raw.description,
    about:       raw.about,
    publisher:   raw.publisher?.trim(),
    language:    raw.language?.trim(),
    delivery:    raw.delivery,
    section:     raw.section,
    cover:       deriveCover(raw.id),
    coverUrl:    deriveCoverUrl(raw.title),
    initials:    deriveInitials(raw.title),
    tags:        (raw.book_tags ?? []).map((bt) => bt.tags?.name).filter(Boolean),
    reviews:     (raw.reviews ?? []).map((r) => ({
      name: r.reviewer_name, rating: r.rating, text: r.review,
    })),
    categories:  (raw.book_categories ?? []).map((bc) => bc.categories?.name).filter(Boolean),
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  // items — full shaped book objects (for WishlistPage display)
  // ids   — Set<bookId> for O(1) isWishlisted lookup
  const [items, setItems] = useState([]);
  const [ids,   setIds]   = useState(new Set());

  // Keep a ref to latest items so async rollbacks always see fresh state
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ── On login: fetch full wishlist from Supabase ──────────────────────────
  useEffect(() => {
    if (!user) {
      setItems([]);
      setIds(new Set());
      return;
    }

    getWishlistBooks(user.id)
      .then((rawBooks) => {
        const shaped = rawBooks.map(shapeBook);
        setItems(shaped);
        setIds(new Set(shaped.map((b) => b.id)));
      })
      .catch(() => {
        // non-fatal — wishlist stays empty until next successful fetch
      });
  }, [user]);

  // ── Add ─────────────────────────────────────────────────────────────────
  const addToWishlist = useCallback(async (book) => {
    // Optimistic update
    setIds((prev) => new Set([...prev, book.id]));
    setItems((prev) =>
      prev.find((b) => b.id === book.id) ? prev : [...prev, book]
    );

    if (user) {
      try {
        await addWishlistItem(user.id, book.id);
      } catch {
        // Roll back
        setIds((prev) => { const s = new Set(prev); s.delete(book.id); return s; });
        setItems((prev) => prev.filter((b) => b.id !== book.id));
      }
    }
  }, [user]);

  // ── Remove ───────────────────────────────────────────────────────────────
  const removeFromWishlist = useCallback(async (bookId) => {
    // Optimistic update
    const snapshot = itemsRef.current.find((b) => b.id === bookId);
    setIds((prev) => { const s = new Set(prev); s.delete(bookId); return s; });
    setItems((prev) => prev.filter((b) => b.id !== bookId));

    if (user) {
      try {
        await removeWishlistItem(user.id, bookId);
      } catch {
        // Roll back
        if (snapshot) {
          setIds((prev) => new Set([...prev, bookId]));
          setItems((prev) => [...prev, snapshot]);
        }
      }
    }
  }, [user]);

  // ── O(1) lookup ──────────────────────────────────────────────────────────
  const isWishlisted = useCallback((bookId) => ids.has(bookId), [ids]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
