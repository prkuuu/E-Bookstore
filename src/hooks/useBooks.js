import { useEffect, useState } from "react";
import { getBooks } from "../services/bookService";
import { categories } from "../data/books";

const COVER_PALETTE = [
  "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
  "#d35400", "#16a085", "#2c3e50", "#e67e22",
];

function deriveCover(id) {
  return COVER_PALETTE[id % COVER_PALETTE.length];
}

// Supabase Storage public URL for a book cover image.
// Files should be named {id}.webp (or .jpg) inside the "eBookStore" bucket.
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "";

function deriveCoverUrl(id) {
  if (!SUPABASE_BUCKET) return null;
  return `${SUPABASE_BUCKET}/${id}.webp`;
}

function deriveInitials(title) {
  if (!title) return "?";
  const skip = new Set(["a", "an", "the", "of", "in", "on", "at", "to", "and"]);
  const words = title.trim().split(/\s+/).filter((w) => !skip.has(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("") || title[0].toUpperCase();
}

/**
 * Transforms raw Supabase sections data into the shape used by the UI.
 *
 * Input:  [ { title, section_books: [ { books: { ...bookRow } } ] } ]
 * Output: [ { title, books: [ { id, title, author, tags, reviews, ... } ] } ]
 */
function transformBooks(sections) {
  return sections.map((section) => ({
    id: section.id,
    title: section.title,
    books: (section.section_books ?? []).map(({ books: book }) => ({
      id: book.id,
      title: book.title?.trim(),
      author: book.author?.trim(),
      format: book.format?.trim(),
      price: book.price,
      sells: book.sells,
      rating: book.rating,
      description: book.description,
      about: book.about,
      publisher: book.publisher?.trim(),
      language: book.language?.trim(),
      delivery: book.delivery,
      cover: deriveCover(book.id),       // fallback colour when no image
      coverUrl: deriveCoverUrl(book.id), // real image from Supabase Storage
      initials: deriveInitials(book.title),
      tags: (book.book_tags ?? []).map((bt) => bt.tags?.name).filter(Boolean),
      reviews: (book.reviews ?? []).map((r) => ({
        name: r.reviewer_name,
        rating: r.rating,
        text: r.review,
      })),
      categories: (book.book_categories ?? []).map((bc) => bc.categories?.name).filter(Boolean)
    })),
  }));
}

const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      setError(null);
      try {
        const raw = await getBooks();
        setBooks(transformBooks(raw));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return { books, loading, error };
};

export default useBooks;
