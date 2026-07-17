import React, { memo } from "react";
import useCategories from "../../hooks/useCategories";

const Sidebar = memo(({ activeCategory, onSelect }) => {
  const { categories, loading, error } = useCategories(activeCategory);
  console.log('categories', categories, activeCategory)

  return (
    <aside className="w-47.5 shrink-0 bg-[#1c1c1c] border-r border-[#2a2a2a] h-[calc(100vh-56px)] overflow-y-auto sticky top-14 py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <ul className="list-none p-0 m-0">
        {loading && (
          <li className="px-5 py-3 text-[13px] text-gray-500">Loading…</li>
        )}
        {error && (
          <li className="px-5 py-3 text-[13px] text-red-400">{error}</li>
        )}
        {!loading && !error && categories.map((cat) => (
          <li key={cat.name}>
            <button
              onClick={() => onSelect(cat.name)}
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
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
