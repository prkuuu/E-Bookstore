import { supabase } from "../lib/supabase";

/**
 * Fetch all orders for the currently logged-in user,
 * joined with the book details.
 */
export async function getOrders(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      quantity,
      total_price,
      books (
        id,
        title,
        author,
        format,
        price,
        delivery
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message ?? "Failed to fetch orders");
  return data ?? [];
}

/**
 * Place a new order for the given book.
 */
export async function placeOrder(userId, bookId, price) {
  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: userId, book_id: bookId, quantity: 1, total_price: price })
    .select()
    .single();

  if (error) throw new Error(error.message ?? "Failed to place order");
  return data;
}
