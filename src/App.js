import React, { useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BookCatalogue from "./components/Catalogue";
import BookDetail from "./components/BookDetail";
import AuthPage from "./components/Auth";
import OrdersPage from "./components/Orders";
import CheckoutPage from "./components/Checkout";
import PaymentPage from "./components/Payment";
import WishlistPage from "./components/Wishlist";
import WritersPage from "./components/Writers";
import useBooks from "./hooks/useBooks";

/* ── Guard: redirects unauthenticated users to /login ── */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/* ── Layout: Header + Sidebar + main content ── */
const Layout = ({ children, sidebar }) => (
  <div className="flex flex-col h-screen overflow-hidden bg-[#161616] text-gray-200">
    <Header />
    <div className="flex flex-1 overflow-hidden">
      {sidebar}
      {children}
    </div>
  </div>
);

/* ── Catalogue shell: manages selected book state ── */
const CatalogueShell = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedBook, setSelectedBook]     = useState(null);
  const { books, loading, error }           = useBooks();
  const navigate                            = useNavigate();

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setSelectedBook(null);
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      }
    >
      {selectedBook ? (
        <BookDetail
          book={selectedBook}
          allBooks={books.flatMap((s) => s.books)}
          onBack={() => setSelectedBook(null)}
          onBookSelect={setSelectedBook}
          onGoToCart={() => navigate("/cart")}
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
    </Layout>
  );
};

/* ── Simple page wrapper (no sidebar) ── */
const PageShell = ({ children }) => (
  <Layout>{children}</Layout>
);

/* ── App ── */
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#161616] text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<CatalogueShell />} />
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={(location.state?.from?.pathname) || "/"} replace />
            : (
              <div className="flex flex-col h-screen overflow-hidden bg-[#161616] text-gray-200">
                <Header />
                <AuthPage onBack={() => window.history.back()} />
              </div>
            )
        }
      />

      {/* Protected */}
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <PageShell><OrdersPage /></PageShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <PageShell>
            <CheckoutPage
              onBack={() => window.history.back()}
              onOrderPlaced={() => window.location.replace("/orders")}
            />
          </PageShell>
        }
      />
      <Route
        path="/payment"
        element={
          <div className="flex flex-col h-screen overflow-hidden bg-[#161616] text-gray-200">
            <Header />
            <PaymentPage />
          </div>
        }
      />
      <Route
        path="/wishlist"
        element={
          <PageShell><WishlistPage /></PageShell>
        }
      />
      <Route
        path="/writers"
        element={
          <PageShell><WritersPage /></PageShell>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
