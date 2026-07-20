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
          book_categories (
            categories (id, name)
          )
        )
      )
    `)
    .limit(100)                // fetch up to 100 sections
    .limit(1000, { foreignTable: "section_books" })          // up to 1000 section_book rows
    .limit(1000, { foreignTable: "section_books.books" });   // up to 1000 book rows

  if (error) {
    throw new Error(error.message ?? "Failed to fetch books");
  }

  return data ?? [];
}