import React, { memo, useEffect } from "react";
import useCategories from "../../hooks/useCategories";

const Sidebar = memo(({ activeCategory, onSelect, mobileOpen, onMobileClose }) => {
  const { categories, loading, error } = useCategories(activeCategory);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => { if (e.key === "Escape") onMobileClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, onMobileClose]);

  const list = (
    <ul className="list-none p-0 m-0">
      {loading && (
        <li className="px-5 py-3 text-[13px] text-gray-500">Loading…</li>
      )}
      {error && (
        <li className="px-5 py-3 text-[13px] text-red-400">{error}</li>
      )}
      {!loading && !error && categories.map((cat) => (
        <li key={cat.id}>
          <button
            onClick={() => { onSelect(cat.name); onMobileClose?.(); }}
            className={`block w-full text-left bg-transparent border-none cursor-pointer text-[13.5px] font-[inherit] py-2 px-5 border-l-[3px] transition-all duration-120
              ${activeCategory === cat.name
                ? "bg-[#262626] text-white font-semibold border-l-blue-500"
                : "text-gray-400 border-l-transparent hover:bg-[#262626] hover:text-gray-200"
              }`}
          >
            {cat.name}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden sm:block w-47.5 shrink-0 bg-[#1c1c1c] border-r border-[#2a2a2a] h-[calc(100vh-56px)] overflow-y-auto sticky top-14 py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
        {list}
      </aside>

      {/* ── Mobile slide-in overlay ── */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative z-10 w-64 max-w-[80vw] bg-[#1c1c1c] border-r border-[#2a2a2a] h-full overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a] mb-1">
              <span className="text-[13px] font-semibold text-gray-200">Categories</span>
              <button
                onClick={onMobileClose}
                aria-label="Close categories"
                className="bg-transparent border-none text-gray-400 cursor-pointer text-[18px] leading-none hover:text-gray-200 p-0"
              >
                ✕
              </button>
            </div>
            {list}
          </aside>
        </div>
      )}
    </>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
