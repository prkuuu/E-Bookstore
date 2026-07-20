// Central prefetch registry — same dynamic import paths as the lazy() calls in App.js.
// Import and call on hover to warm the chunk before the user clicks.
export const prefetch = {
  orders:   () => import("./components/Orders"),
  cart:     () => import("./components/Checkout"),
  payment:  () => import("./components/Payment"),
  wishlist: () => import("./components/Wishlist"),
  writers:  () => import("./components/Writers"),
  login:    () => import("./components/Auth"),
};
