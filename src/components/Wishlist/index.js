import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import BookCover from "../BookCover";

const WishlistCard = memo(({ book, onRemove, onAddToCart, onView }) => (
  <div className="flex gap-4 bg-[#262626] border border-[#3a3a3a] rounded-md p-4 hover:border-[#555] transition-colors duration-150">

    {/* Cover */}
    <BookCover
      coverUrl={book.coverUrl}
      cover={book.cover}
      initials={book.initials}
      className="w-16 h-[88px] rounded shrink-0 cursor-pointer"
      onClick={() => onView(book)}
    />

    {/* Info */}
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <h3
        className="text-[14px] font-semibold text-gray-100 leading-snug cursor-pointer hover:text-blue-400 transition-colors"
        onClick={() => onView(book)}
      >
        {book.title}
      </h3>
      <p className="text-[12px] text-gray-400">
        by <span className="text-blue-400">{book.author}</span>
      </p>
      <p className="text-[11px] text-gray-500">{book.format}</p>
      <p className="text-[14px] font-bold text-gray-100 mt-auto">&#8377;{book.price}</p>
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-2 justify-center shrink-0">
      <button
        onClick={() => onAddToCart(book)}
        className="text-[12px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap"
      >
        Add to Cart
      </button>
      <button
        onClick={() => onRemove(book.id)}
        className="text-[12px] text-gray-400 hover:text-red-400 px-3 py-1.5 rounded border border-[#3a3a3a] hover:border-red-400/40 transition-colors cursor-pointer whitespace-nowrap"
      >
        Remove
      </button>
    </div>
  </div>
));
WishlistCard.displayName = "WishlistCard";

const WishlistPage = () => {
  const { user } = useAuth();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = useCallback((book) => {
    addToCart(book);
    navigate("/cart");
  }, [addToCart, navigate]);

  const handleView = useCallback((book) => {
    // Navigate back to home with the book pre-selected is not possible from here
    // without lifting state, so just navigate to catalogue root
    navigate("/");
  }, [navigate]);

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 max-md:p-4 flex flex-col gap-5 max-w-2xl w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-gray-100 border-l-[3px] border-blue-500 pl-3">
            My Wishlist
            {items.length > 0 && (
              <span className="ml-2 text-[13px] font-normal text-gray-400">
                ({items.length} {items.length === 1 ? "book" : "books"})
              </span>
            )}
          </h1>
        </div>

        {/* Not signed in */}
        {!user ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-16">
            <span className="text-[48px]">🔖</span>
            <p className="text-gray-400 text-[15px]">Sign in to save your wishlist.</p>
            <button
              onClick={() => navigate("/login")}
              className="text-[13px] bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>

        /* Signed in, empty */
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-16">
            <span className="text-[48px]">🔖</span>
            <p className="text-gray-400 text-[15px]">Your wishlist is empty.</p>
            <p className="text-gray-500 text-[13px]">
              Browse books and click <strong className="text-gray-300">Add to Wishlist</strong> to save them here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-[13px] bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors cursor-pointer mt-2"
            >
              Browse Books
            </button>
          </div>

        /* Signed in, has items */
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((book) => (
              <WishlistCard
                key={book.id}
                book={book}
                onRemove={removeFromWishlist}
                onAddToCart={handleAddToCart}
                onView={handleView}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default WishlistPage;
