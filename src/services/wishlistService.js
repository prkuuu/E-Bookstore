import { supabase } from "../lib/supabase";

/**
 * Fetch all wishlisted books for the logged-in user with full book details.
 * Returns an array of book objects shaped for the UI.
 */
export async function getWishlistBooks(userId) {
  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      book_id,
      books (
        id, title, author, format, price, delivery,
        language, description, about, publisher,
        rating, sells, section,
        reviews (*),
        book_tags ( tags (name) ),
        book_categories ( categories (id, name) )
      )
    `)
    .eq("user_id", userId);

  if (error) throw new Error(error.message ?? "Failed to fetch wishlist");
  return (data ?? []).map((row) => row.books).filter(Boolean);
}

/**
 * Add a book to the user's wishlist.
 * Silently ignores if already present (unique constraint).
 */
export async function addWishlistItem(userId, bookId) {
  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId, book_id: bookId });

  // 23505 = unique_violation — book already in wishlist, not an error
  if (error && error.code !== "23505") {
    throw new Error(error.message ?? "Failed to add to wishlist");
  }
}

/**
 * Remove a book from the user's wishlist.
 */
export async function removeWishlistItem(userId, bookId) {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw new Error(error.message ?? "Failed to remove from wishlist");
}
