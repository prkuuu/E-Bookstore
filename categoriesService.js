import { supabase } from "../lib/supabase";

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message ?? "Failed to fetch categories");
  }

  return data;
}

/**
 * Fetches books filtered by a category name server-side.
 * Use this instead of client-side filtering when the books list is large.
 *
 * @param {string} categoryName - e.g. "Self Help". Pass "All" to skip the filter.
 */
export async function getBooksByCategory(categoryName) {
  let query = supabase
    .from("books")
    .select(`
      *,
      reviews (*),
      book_tags (
        tags (name)
      ),
      book_categories (categories (name))
    `);

  if (categoryName && categoryName !== "All") {
    query = query.eq("book_tags.tags.name", categoryName);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message ?? "Failed to fetch books by category");
  }

  return data ?? [];
}