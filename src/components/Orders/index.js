import React, { useState, useCallback, memo } from "react";
import { useAuth } from "../../context/AuthContext";
import useOrders from "../../hooks/useOrders";
import { placeOrder } from "../../services/orderService";
import BookCover from "../BookCover";
import { deriveCover, deriveCoverUrl, deriveInitials } from "../../lib/bookUtils";

// memo: only re-renders when this specific order's data or the buy-again handler changes
const OrderCard = memo(({ order, onBuyAgain }) => {
  const book     = order.books;
  const cover    = deriveCover(book?.id ?? 0);
  const coverUrl = deriveCoverUrl(book?.title);
  const initials = deriveInitials(book?.title ?? "");
  const [buying, setBuying] = useState(false);
  const [done, setDone]     = useState(false);

  const handleBuyAgain = async () => {
    setBuying(true);
    await onBuyAgain(order);
    setBuying(false);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="flex gap-4 bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg p-4 items-start hover:border-[#555] transition-colors">
      {/* Cover */}
      <BookCover
        coverUrl={coverUrl}
        cover={cover}
        initials={initials}
        className="w-14 h-20 rounded shrink-0"
      />

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-gray-100 truncate">{book?.title ?? "—"}</h3>
        <p className="text-[12px] text-gray-400">by <span className="text-blue-400">{book?.author ?? "—"}</span></p>
        <p className="text-[11px] text-gray-500">{book?.format ?? ""}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[13px] font-bold text-gray-100">&#8377;{order.total_price}</span>
          <span className="text-[11px] text-gray-500">Ordered on {date}</span>
        </div>
      </div>

      {/* Buy Again */}
      <button
        onClick={handleBuyAgain}
        disabled={buying}
        className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer border-none
          ${done
            ? "bg-green-600 text-white"
            : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"}`}
      >
        {done ? "✓ Ordered!" : buying ? "Placing…" : "Buy Again"}
      </button>
    </div>
  );
});
OrderCard.displayName = "OrderCard";

const OrdersPage = ({ onBookSelect }) => {
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useOrders(user?.id);

  // useCallback: stable reference prevents every OrderCard from re-rendering when OrdersPage re-renders
  const handleBuyAgain = useCallback(async (order) => {
    try {
      await placeOrder(user.id, order.books.id, order.total_price);
      refetch();
    } catch (err) {
      console.error("Buy Again failed:", err.message);
    }
  }, [user?.id, refetch]);

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 max-md:p-4 flex flex-col gap-5 max-w-3xl w-full mx-auto">

        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-gray-100 border-l-[3px] border-blue-500 pl-3">
            My Orders
          </h1>
          <span className="text-[12px] text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm mt-4">Loading orders…</p>
        ) : error ? (
          <p className="text-red-400 text-sm mt-4">Failed to load orders: {error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-sm mt-4">You haven't placed any orders yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onBuyAgain={handleBuyAgain} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default OrdersPage;
