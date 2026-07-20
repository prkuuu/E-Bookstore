import { supabase } from "../lib/supabase";

export async function getBooks() {
  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      reviews (*),
      book_tags (
        tags (name)
      ),
      book_categories (
        categories (id, name)
      )
    `)
    .limit(1000);

  if (error) {
    throw new Error(error.message ?? "Failed to fetch books");
  }

  return data ?? [];
}
