import React, { useState, useMemo, useCallback, memo } from "react";
import BookCard from "../Card";

// module-level constant — evaluated once at import time
const selectClass =
  "bg-transparent border-none text-gray-300 text-[13px] p-0 pr-5 outline-none cursor-pointer appearance-none w-full"
  + " bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%239ca3af' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_2px_center]";

const SORTERS = {
  PriceLow:  (a, b) => a.price - b.price,
  PriceHigh: (a, b) => b.price - a.price,
  Newest:    (a, b) => b.id - a.id,
};

function parsePriceRange(priceRange) {
  if (priceRange === "All")  return [0, Infinity];
  if (priceRange === "400+") return [400, Infinity];
  return priceRange.split("-").map(Number);
}

function createBookFilter(activeCategory, q, language, format, lo, hi) {
  const activeCategoryLower = activeCategory.toLowerCase();
  return (book) => {
    const matchCategory =
      activeCategory === "All" ||
      (book.categories ?? []).some((c) => c.toLowerCase() === activeCategoryLower);
    const matchSearch =
      q === "" ||
      (book.title ?? "").toLowerCase().includes(q) ||
      (book.author ?? "").toLowerCase().includes(q);
    const matchLanguage = language === "All" || book.language === language;
    const matchFormat   = format   === "All" || book.format   === format;
    const matchPrice    = Number(book.price) >= lo && Number(book.price) <= hi;
    return matchCategory && matchSearch && matchLanguage && matchFormat && matchPrice;
  };
}

function filterAndSort(sections, { activeCategory, search, language, format, priceRange, sortBy }) {
  const [lo, hi] = parsePriceRange(priceRange);
  const q = search.trim().toLowerCase();

  const hasFilter =
    activeCategory !== "All" || q !== "" || language !== "All" ||
    format !== "All" || priceRange !== "All" || sortBy !== "Relevance";

  if (!hasFilter) return sections.filter((s) => s.books.length > 0);

  const allBooks = sections.flatMap((s) => s.books);
  const filteredBooks = allBooks.filter(createBookFilter(activeCategory, q, language, format, lo, hi));

  const sorter = SORTERS[sortBy];
  const sorted = sorter ? [...filteredBooks].sort(sorter) : filteredBooks;

  return sorted.length > 0
    ? [{ title: "Catalog", books: sorted }]
    : [];
}

// memo: re-renders only when label/grow/children reference changes
const FilterGroup = memo(({ label, children, grow }) => (
  <div
    className={`flex flex-col bg-[#262626] border-b border-[#3a3a3a] px-3 py-3 min-w-0 focus-within:border-[#555]${grow ? " flex-1 min-w-20" : ""}`}
  >
    <span className="text-[11px] text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis leading-none mb-1">
      {label}
    </span>
    {children}
  </div>
));
FilterGroup.displayName = "FilterGroup";

// memo: each FilterSelect only re-renders when its own value changes
const FilterSelect = memo(({ label, value, onChange, options, ariaLabel }) => (
  <FilterGroup label={label}>
    <select className={selectClass} value={value} onChange={onChange} aria-label={ariaLabel}>
      {options.map(({ value: v, label: l }) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  </FilterGroup>
));
FilterSelect.displayName = "FilterSelect";

/* count how many non-default filters are active */
function countActiveFilters({ language, format, priceRange, sortBy }) {
  return [
    language  !== "All",
    format    !== "All",
    priceRange !== "All",
    sortBy    !== "Relevance",
  ].filter(Boolean).length;
}

const BookCatalogue = ({ books, loading, error, activeCategory, onBookSelect, onOpenCategories }) => {

  const [filters, setFilters] = useState({
    language: "All", format: "All",
    priceRange: "All", sortBy: "Relevance", search: ""
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleFilterChange = useCallback(
    (key, value) => setFilters(prev => ({ ...prev, [key]: value })),
    []
  );

  const filteredSections = useMemo(
    () => filterAndSort(books, { activeCategory, ...filters }),
    [activeCategory, books, filters]
  );
  const handleBookSelect = useCallback(
    (book) => onBookSelect?.(book),
    [onBookSelect]
  );

  const activeFilterCount = countActiveFilters(filters);

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">

      {/* ── Mobile/tablet toolbar: Categories + Filters toggles (below md) ── */}
      <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-10">
        {/* Categories button */}
        <button
          onClick={onOpenCategories}
          className="flex items-center gap-1.5 bg-[#262626] border border-[#3a3a3a] rounded-md px-3 py-1.5 text-[12px] text-gray-300 cursor-pointer hover:border-[#555] transition-colors"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
          {activeCategory === "All" ? "Categories" : activeCategory}
        </button>

        {/* Filters toggle button */}
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex items-center gap-1.5 border rounded-md px-3 py-1.5 text-[12px] cursor-pointer transition-colors
            ${filtersOpen || activeFilterCount > 0
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-[#262626] border-[#3a3a3a] text-gray-300 hover:border-[#555]"}`}
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 4h12M4 8h8M6 12h4"/>
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white text-blue-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search (compact) */}
        <div className="flex-1 flex items-center bg-[#262626] border border-[#3a3a3a] rounded-md px-2.5 py-1.5 gap-1.5 focus-within:border-[#555] transition-colors min-w-0">
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-[#e5e7eb] text-[12px] p-0 outline-none min-w-0 placeholder:text-gray-500"
            placeholder="Search…"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <span className="text-gray-500 text-[13px] shrink-0">&#128269;</span>
        </div>
      </div>

      {/* ── Mobile/tablet collapsible filter panel (below md) ── */}
      {filtersOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 py-3 grid grid-cols-2 gap-2 sticky top-[44px] z-10">
          {/* Language */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Language</label>
            <select
              className="bg-[#262626] border border-[#3a3a3a] rounded px-2 py-1.5 text-[12px] text-gray-300 outline-none cursor-pointer"
              value={filters.language}
              onChange={(e) => handleFilterChange("language", e.target.value)}
              aria-label="Language"
            >
              {[{v:"All",l:"All"},{v:"English",l:"English"},{v:"Hindi",l:"Hindi"},{v:"Tamil",l:"Tamil"}].map(o=>(
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          {/* Format */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Format</label>
            <select
              className="bg-[#262626] border border-[#3a3a3a] rounded px-2 py-1.5 text-[12px] text-gray-300 outline-none cursor-pointer"
              value={filters.format}
              onChange={(e) => handleFilterChange("format", e.target.value)}
              aria-label="Format"
            >
              {[{v:"All",l:"All"},{v:"Paperback",l:"Paperback"},{v:"Hardcover",l:"Hardcover"},{v:"eBook",l:"eBook"}].map(o=>(
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Price</label>
            <select
              className="bg-[#262626] border border-[#3a3a3a] rounded px-2 py-1.5 text-[12px] text-gray-300 outline-none cursor-pointer"
              value={filters.priceRange}
              onChange={(e) => handleFilterChange("priceRange", e.target.value)}
              aria-label="Price Range"
            >
              {[{v:"All",l:"All"},{v:"0-200",l:"Under ₹200"},{v:"200-400",l:"₹200–₹400"},{v:"400+",l:"Above ₹400"}].map(o=>(
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Sort by</label>
            <select
              className="bg-[#262626] border border-[#3a3a3a] rounded px-2 py-1.5 text-[12px] text-gray-300 outline-none cursor-pointer"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              aria-label="Sort By"
            >
              {[{v:"Relevance",l:"Relevance"},{v:"PriceLow",l:"Price: Low→High"},{v:"PriceHigh",l:"Price: High→Low"},{v:"Newest",l:"Newest"}].map(o=>(
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          {/* Reset */}
          {activeFilterCount > 0 && (
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => setFilters(f => ({ ...f, language:"All", format:"All", priceRange:"All", sortBy:"Relevance" }))}
                className="text-[11px] text-blue-400 bg-transparent border-none cursor-pointer hover:underline p-0"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Desktop Filter / Search Bar (md / 768 px and up) ── */}
      <div className="hidden md:flex items-stretch gap-3 px-5 py-3 bg-[#161616] sticky top-0 z-10 flex-nowrap">

        {/* Search */}
        <FilterGroup label="Search you want to read here" grow>
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 bg-transparent border-none text-[#e5e7eb] text-[13px] p-0 outline-none min-w-0 placeholder:text-gray-500"
              placeholder="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            <button
              aria-label="Search"
              className="bg-transparent border-none text-gray-400 text-[13px] pl-1.5 cursor-pointer leading-none shrink-0 hover:text-gray-200"
            >
              &#128269;
            </button>
          </div>
        </FilterGroup>

        {/* Language */}
        <FilterSelect
          label="Language"
          ariaLabel="Language"
          value={filters.language}
          onChange={(e) => handleFilterChange("language", e.target.value)}
          options={[
            { value: "All",     label: "All" },
            { value: "English", label: "English" },
            { value: "Hindi",   label: "Hindi" },
            { value: "Tamil",   label: "Tamil" },
          ]}
        />

        {/* Format */}
        <FilterSelect
          label="Format (Paperback, ebook etc)"
          ariaLabel="Format"
          value={filters.format}
          onChange={(e) => handleFilterChange("format", e.target.value)}
          options={[
            { value: "All",       label: "All" },
            { value: "Paperback", label: "Paperback" },
            { value: "Hardcover", label: "Hardcover" },
            { value: "eBook",     label: "eBook" },
          ]}
        />

        {/* Price Range */}
        <FilterSelect
          label="Price Range"
          ariaLabel="Price Range"
          value={filters.priceRange}
          onChange={(e) => handleFilterChange("priceRange", e.target.value)}
          options={[
            { value: "All",     label: "All" },
            { value: "0-200",   label: "Under ₹200" },
            { value: "200-400", label: "₹200 – ₹400" },
            { value: "400+",    label: "Above ₹400" },
          ]}
        />

        {/* Sort By */}
        <FilterSelect
          label="Sort by"
          ariaLabel="Sort By"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          options={[
            { value: "Relevance",  label: "Relevance" },
            { value: "PriceLow",   label: "Price: Low to High" },
            { value: "PriceHigh",  label: "Price: High to Low" },
            { value: "Newest",     label: "Newest First" },
          ]}
        />
      </div>

      {/* ── Book Sections ── */}
      <div className="p-4 sm:p-6 flex flex-col gap-8">
        {loading ? (
          <p className="text-gray-500 text-sm mt-5">Loading books...</p>
        ) : error ? (
          <p className="text-red-400 text-sm mt-5">Failed to load books: {error}</p>
        ) : filteredSections.length === 0 ? (
          <p className="text-gray-500 text-sm mt-5">No books found for your search.</p>
        ) : (
          filteredSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-[15px] font-bold text-gray-100 mb-3.5 border-l-[3px] border-blue-500 pl-2.5">
                {section.title}
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {section.books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => handleBookSelect(book)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </section>
  );
};

export default BookCatalogue;
