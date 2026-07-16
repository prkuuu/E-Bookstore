import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BookCatalogue from "./components/Catalogue";
import BookDetail from "./components/BookDetail";
import useBooks from "./hooks/useBooks";

const App = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);
  const { books, loading, error } = useBooks();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#161616] text-gray-200">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeCategory={activeCategory}
          onSelect={(cat) => { setActiveCategory(cat); setSelectedBook(null); }}
        />
        {selectedBook ? (
          <BookDetail
            book={selectedBook}
            allBooks={books.flatMap((s) => s.books)}
            onBack={() => setSelectedBook(null)}
            onBookSelect={setSelectedBook}
          />
        ) : (
          <BookCatalogue
            books={books}
            loading={loading}
            error={error}
            activeCategory={activeCategory}
            onBookSelect={setSelectedBook}
          />
        )}
      </div>
    </div>
  );
};

export default App;
