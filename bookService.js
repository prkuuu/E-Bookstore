import { supabase } from "../lib/supabase";

export async function getBooks() {
  const { data, error } = await supabase
    .from("sections")
    .select(`
      id,
      title,
      section_books (
        books (
          *,
          reviews (*),
          book_tags (
            tags (
              name
            )
          ),
          book_categories(
                categories(id,name)
            )
        )
      )
    `);
  if (error) {
    throw new Error(error.message ?? "Failed to fetch books");
  }

  return data ?? [];
}