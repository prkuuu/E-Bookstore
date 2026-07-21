import React, { useState, lazy, Suspense } from "react";
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
import { WishlistProvider } from "./context/WishlistContext";

// ── Eager imports (critical path — always needed on first render) ──
import Header       from "./components/Header";
import Sidebar      from "./components/Sidebar";
import BookCatalogue from "./components/Catalogue";
import BookDetail   from "./components/BookDetail";
import useBooks     from "./hooks/useBooks";

// ── Lazy imports (loaded only when the user navigates to that route) ──
// NOTE: these paths MUST match the ones in src/prefetch.js exactly
const AuthPage     = lazy(() => import("./components/Auth"));
const OrdersPage   = lazy(() => import("./components/Orders"));
const CheckoutPage = lazy(() => import("./components/Checkout"));
const PaymentPage  = lazy(() => import("./components/Payment"));
const WishlistPage = lazy(() => import("./components/Wishlist"));
const WritersPage  = lazy(() => import("./components/Writers"));

// ── Fallback: keeps the full chrome (Header + sidebar placeholder) visible ──
const PageLoader = () => (
  <div className="flex flex-1 flex-col items-center justify-center bg-[#161616] gap-3">
    <div className="w-8 h-8 border-2 border-[#3a3a3a] border-t-blue-500 rounded-full animate-spin" />
    <span className="text-[13px] text-gray-500">Loading…</span>
  </div>
);

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
  const [sidebarOpen, setSidebarOpen]       = useState(false);
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
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
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
          onOpenCategories={() => setSidebarOpen(true)}
        />
      )}
    </Layout>
  );
};

/* ── Simple page wrapper — Suspense is HERE so Header/Layout never unmounts ── */
const PageShell = ({ children }) => (
  <Layout>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </Layout>
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
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <AuthPage onBack={() => window.history.back()} />
                </Suspense>
              </Layout>
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
        element={<PageShell><CheckoutPage /></PageShell>}
      />
      <Route
        path="/payment"
        element={
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <PaymentPage />
            </Suspense>
          </Layout>
        }
      />
      <Route
        path="/wishlist"
        element={<PageShell><WishlistPage /></PageShell>}
      />
      <Route
        path="/writers"
        element={<PageShell><WritersPage /></PageShell>}
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
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
