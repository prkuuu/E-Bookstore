import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { prefetch } from "../../prefetch";

const navLinkClass = ({ isActive }) =>
  `text-[14px] font-medium px-3.5 py-1.5 rounded-md transition-colors duration-150 whitespace-nowrap cursor-pointer no-underline
  ${isActive
    ? "bg-[#1f2937] text-white"
    : "text-gray-300 hover:bg-[#1f2937] hover:text-white"}`;

const Header = ({ onMenuOpen }) => {
  const { totalItems: cartCount } = useCart();
  const { user, signOut }         = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const mobileNavRef              = useRef(null);

  // Close mobile nav on route change
  useEffect(() => { setMobileNav(false); }, [location.pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-profile-menu]")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "?";

  const handleOrdersClick = () => {
    setMenuOpen(false);
    setMobileNav(false);
    if (!user) { navigate("/login"); return; }
    navigate("/orders");
  };

  return (
    <>
      <header className="flex items-center bg-[#161616] px-4 sm:px-6 h-14 border-b border-[#3e3e3e] sticky top-0 z-50 gap-4 shrink-0">

        {/* ── Hamburger (mobile + tablet, below md) ── */}
        <button
          aria-label="Toggle navigation"
          onClick={() => setMobileNav((v) => !v)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 bg-transparent border-none cursor-pointer p-1 shrink-0"
        >
          <span className={`block h-[2px] w-5 bg-gray-300 transition-all duration-200 origin-center ${mobileNav ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-[2px] w-5 bg-gray-300 transition-all duration-200 ${mobileNav ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block h-[2px] w-5 bg-gray-300 transition-all duration-200 origin-center ${mobileNav ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>

        {/* ── Logo ── */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0 no-underline">
          <span className="text-[22px] text-white">&#9783;</span>
          <span className="text-[18px] font-bold text-white tracking-tight whitespace-nowrap">
            Book Worm
          </span>
        </NavLink>

        {/* ── Nav Links — left-aligned, right next to logo ── */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={handleOrdersClick}
            onMouseEnter={prefetch.orders}
            className={navLinkClass({ isActive: location.pathname === "/orders" })}
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

        {/* ── Spacer: pushes icons to the far right ── */}
        <div className="flex-1" />

        {/* ── Right: Icons ── */}
        <div className="flex items-center gap-2 relative">

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
            <div className="relative" data-profile-menu>
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

      {/* ── Mobile/tablet Nav Drawer (below md) ── */}
      {mobileNav && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-[#1a1a1a] border-b border-[#3e3e3e] shadow-lg">
          <nav ref={mobileNavRef} className="flex flex-col px-4 py-3 gap-1 max-h-[calc(100vh-56px)] overflow-y-auto">
            <button
              onClick={handleOrdersClick}
              className={`text-left text-[14px] font-medium px-3.5 py-2.5 rounded-md transition-colors cursor-pointer border-none
                ${location.pathname === "/orders" ? "bg-[#1f2937] text-white" : "bg-transparent text-gray-300 hover:bg-[#1f2937] hover:text-white"}`}
            >
              My Orders
            </button>
            <NavLink
              to="/wishlist"
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `text-[14px] font-medium px-3.5 py-2.5 rounded-md transition-colors no-underline block
                ${isActive ? "bg-[#1f2937] text-white" : "text-gray-300 hover:bg-[#1f2937] hover:text-white"}`}
            >
              My Wishlist
            </NavLink>
            <NavLink
              to="/writers"
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `text-[14px] font-medium px-3.5 py-2.5 rounded-md transition-colors no-underline block
                ${isActive ? "bg-[#1f2937] text-white" : "text-gray-300 hover:bg-[#1f2937] hover:text-white"}`}
            >
              My Writers
            </NavLink>
            {user && (
              <button
                onClick={() => { setMobileNav(false); signOut(); navigate("/"); }}
                className="text-left text-[14px] font-medium px-3.5 py-2.5 rounded-md transition-colors cursor-pointer border-none bg-transparent text-red-400 hover:bg-[#1f2937] mt-1"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
