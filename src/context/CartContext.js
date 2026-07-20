import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const CartContext  = createContext(null);
const STORAGE_KEY  = "ebookstore_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded or private mode — silently ignore
  }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart); // initialise from localStorage

  // Sync to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((book) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.book.id === book.id);
      if (existing) {
        return prev.map((i) => i.book.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { book, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((bookId) => {
    setItems((prev) => prev.filter((i) => i.book.id !== bookId));
  }, []);

  const updateQty = useCallback((bookId, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i.book.id === bookId ? { ...i, qty } : i));
  }, []);

  // clearCart is called after a successful order — wipes both state and storage
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.book.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
