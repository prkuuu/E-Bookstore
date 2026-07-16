import React, { useState } from "react";

const Header = () => {
  const [cartCount] = useState(1);

  return (
    <header className="flex items-center justify-between bg-[#161616] px-6 h-14 border-b border-[#3e3e3e] sticky top-0 z-100 gap-4 shrink-0">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 shrink-0 no-underline">
        <span className="text-[22px] text-white">&#9783;</span>
        <span className="text-[18px] font-bold text-white tracking-tight whitespace-nowrap sm:text-base">
          Book Worm
        </span>
      </div>

      {/* ── Nav Links ── */}
      <nav className="hidden sm:flex items-center gap-1 shrink-0">
        <a href="#orders"
          className="text-gray-300 no-underline text-[14px] font-medium px-3.5 py-1.5 rounded-md transition-colors duration-150 whitespace-nowrap hover:bg-[#1f2937] hover:text-white">
          My Orders
        </a>
        <a href="#wishlist"
          className="text-gray-300 no-underline text-[14px] font-medium px-3.5 py-1.5 rounded-md transition-colors duration-150 whitespace-nowrap hover:bg-[#1f2937] hover:text-white">
          My Wishlist
        </a>
        <a href="#writers"
          className="text-gray-300 no-underline text-[14px] font-medium px-3.5 py-1.5 rounded-md transition-colors duration-150 whitespace-nowrap hover:bg-[#1f2937] hover:text-white">
          My Writers
        </a>
      </nav>

      {/* ── Right: Icons ── */}
      <div className="flex items-center gap-2 flex-1 justify-end">

        {/* Cart */}
        <button
          aria-label="Cart"
          className="relative bg-transparent border-none cursor-pointer p-1.5 rounded-md leading-none transition-colors duration-150 hover:bg-[#1f2937]"
        >
          <span className="text-[20px] text-gray-300 block">&#128722;</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none">
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          aria-label="Profile"
          className="relative bg-transparent border-none cursor-pointer p-1.5 rounded-md leading-none transition-colors duration-150 hover:bg-[#1f2937]"
        >
          <span className="text-[20px] text-gray-300 block">&#128100;</span>
        </button>

      </div>
    </header>
  );
};

export default Header;
