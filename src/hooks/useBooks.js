import { useEffect, useState } from "react";
import { getBooks } from "../services/bookService";
import { deriveCover, deriveCoverUrl, deriveInitials } from "../lib/bookUtils";

// Section display order — sections not in this list fall back to "All Books" at the end
const SECTION_ORDER = [
  "Recommended for You",
  "Bestsellers this Month",
  "New Launches",
];

/**
 * Transforms a flat array of book rows (each with a `section` column)
 * into the grouped shape used by the UI.
 *
 * Input:  [ { id, title, section, reviews, book_tags, book_categories, ... } ]
 * Output: [ { title: sectionName, books: [ { id, title, ... } ] } ]
 */
function transformBooks(rawBooks) {
  // Build a map: sectionName → [book, ...]
  const map = new Map();

  for (const book of rawBooks) {
    const sectionName = book.section?.trim() || "All Books";
    if (!map.has(sectionName)) map.set(sectionName, []);
    map.get(sectionName).push({
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
      cover: deriveCover(book.id),
      coverUrl: deriveCoverUrl(book.title),
      initials: deriveInitials(book.title),
      tags: (book.book_tags ?? []).map((bt) => bt.tags?.name).filter(Boolean),
      reviews: (book.reviews ?? []).map((r) => ({
        name: r.reviewer_name,
        rating: r.rating,
        text: r.review,
      })),
      categories: (book.book_categories ?? []).map((bc) => bc.categories?.name).filter(Boolean),
    });
  }

  // Sort sections: known order first, then anything else alphabetically
  const knownSections = SECTION_ORDER.filter((s) => map.has(s)).map((s) => ({
    title: s,
    books: map.get(s),
  }));

  const otherSections = [...map.keys()]
    .filter((s) => !SECTION_ORDER.includes(s))
    .sort()
    .map((s) => ({ title: s, books: map.get(s) }));

  return [...knownSections, ...otherSections];
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
