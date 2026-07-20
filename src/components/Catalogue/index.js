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

  // sections shape: [{ title, books: [...] }]
  // When no category/search/filter is active, preserve original sections.
  // Otherwise flatten into one "Catalog" section with matched books.
  const hasFilter =
    activeCategory !== "All" || q !== "" || language !== "All" ||
    format !== "All" || priceRange !== "All" || sortBy !== "Relevance";

  if (!hasFilter) return sections.filter((s) => s.books.length > 0);

  // Flatten all books across sections, then filter
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

const BookCatalogue = ({ books, loading, error, activeCategory, onBookSelect }) => {

  const [filters, setFilters] = useState({
    language: "All", format: "All",
    priceRange: "All", sortBy: "Relevance", search: ""
  });
  // useCallback: stable reference so FilterSelect/FilterGroup children don't re-render on unrelated state changes
  const handleFilterChange = useCallback(
    (key, value) => setFilters(prev => ({ ...prev, [key]: value })),
    [] // setFilters is stable — no deps needed
  );

  const filteredSections = useMemo(
    () => filterAndSort(books, { activeCategory, ...filters }),
    [activeCategory, books, filters]
  );
  const handleBookSelect = useCallback(
    (book) => onBookSelect?.(book),
    [onBookSelect]
  );

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">

      {/* ── Filter / Search Bar ── */}
      <div className="flex items-stretch gap-3 px-5 py-3 bg-[#161616] sticky top-0 z-10 flex-nowrap max-md:flex-wrap">

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
      <div className="p-6 flex flex-col gap-8 max-md:p-4">
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
              <div className="flex flex-wrap gap-4">
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
