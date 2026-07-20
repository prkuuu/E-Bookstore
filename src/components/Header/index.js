import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { prefetch } from "../../prefetch";

const navLinkClass = ({ isActive }) =>
  `text-[14px] font-medium px-3.5 py-1.5 rounded-md transition-colors duration-150 whitespace-nowrap cursor-pointer no-underline
  ${isActive
    ? "bg-[#1f2937] text-white"
    : "text-gray-300 hover:bg-[#1f2937] hover:text-white"}`;

const Header = () => {
  const { totalItems: cartCount } = useCart();
  const { user, signOut }         = useAuth();
  const navigate                  = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "?";

  const handleOrdersClick = () => {
    setMenuOpen(false);
    if (!user) { navigate("/login"); return; }
    navigate("/orders");
  };

  return (
    <header className="flex items-center justify-between bg-[#161616] px-6 h-14 border-b border-[#3e3e3e] sticky top-0 z-50 gap-4 shrink-0">

      {/* ── Logo ── */}
      <NavLink to="/" className="flex items-center gap-2.5 shrink-0 no-underline">
        <span className="text-[22px] text-white">&#9783;</span>
        <span className="text-[18px] font-bold text-white tracking-tight whitespace-nowrap sm:text-base">
          Book Worm
        </span>
      </NavLink>

      {/* ── Nav Links ── */}
      <nav className="hidden sm:flex items-center gap-1 shrink-0">
        <button
          onClick={handleOrdersClick}
          onMouseEnter={prefetch.orders}
          className={navLinkClass({ isActive: window.location.pathname === "/orders" })}
        >
          My Orders
        </button>
        <NavLink to="/wishlist" className={navLinkClass} onMouseEnter={prefetch.wishlist}>
          My Wishlist
        </NavLink>
        <NavLink to="/writers" className={navLinkClass} onMouseEnter={prefetch.writers}>
          My Writers
        </NavLink>
      </nav>

      {/* ── Right: Icons ── */}
      <div className="flex items-center gap-2 flex-1 justify-end relative">

        {/* Cart */}
        <button
          aria-label="Cart"
          onClick={() => navigate("/cart")}
          onMouseEnter={prefetch.cart}
          className="relative bg-transparent border-none cursor-pointer p-1.5 rounded-md leading-none transition-colors duration-150 hover:bg-[#1f2937]"
        >
          <span className="text-[20px] text-gray-300 block">&#128722;</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none">
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile / Auth */}
        {user ? (
          <div className="relative">
            <button
              aria-label="Profile menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 rounded-full bg-blue-600 text-white text-[13px] font-bold flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-blue-500"
            >
              {avatarLetter}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3a3a3a]">
                  <p className="text-[11px] text-gray-400">Signed in as</p>
                  <p className="text-[13px] text-gray-100 truncate font-medium">{user.email}</p>
                </div>
                <button
                  onClick={handleOrdersClick}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-gray-300 bg-transparent border-none cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                >
                  My Orders
                </button>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); navigate("/"); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-red-400 bg-transparent border-none cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            aria-label="Sign In"
            className="relative bg-transparent border-none cursor-pointer p-1.5 rounded-md leading-none transition-colors duration-150 hover:bg-[#1f2937]"
            onClick={() => navigate("/login")}
            onMouseEnter={prefetch.login}
          >
            <span className="text-[20px] text-gray-300 block">&#128100;</span>
          </button>
        )}

      </div>
    </header>
  );
};

export default Header;
