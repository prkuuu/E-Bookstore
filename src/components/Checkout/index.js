import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import BookCover from "../BookCover";

const TAX_RATE = 0.12;

const inputClass =
  "w-full bg-[#1c1c1c] border border-[#3a3a3a] rounded-md px-3 py-2 text-[13px] text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#555] transition-colors";

const selectClass =
  "w-full bg-[#1c1c1c] border border-[#3a3a3a] rounded-md px-3 py-2 text-[13px] text-gray-200 outline-none focus:border-[#555] transition-colors cursor-pointer";

/* ── Cart Item Card ── */
const CartItem = ({ item, onRemove, onQty }) => {
  const { book, qty } = item;
  return (
    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex gap-4 items-start">
      {/* Cover */}
      <BookCover
        coverUrl={book.coverUrl}
        cover={book.cover}
        initials={book.initials}
        className="w-[120px] h-[168px] rounded-lg shrink-0"
      />

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-gray-100">{book.title}</h3>
        <p className="text-[13px] text-gray-400">
          by <span className="text-blue-400 cursor-pointer hover:underline">{book.author}</span>
        </p>
        {book.description && (
          <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{book.description}</p>
        )}
        <p className="text-[12px] text-gray-400 mt-1">{book.format}</p>
        {book.tags?.length > 0 && (
          <p className="text-[12px] mt-0.5">
            {book.tags.map((t, i) => (
              <span key={`${t}_${i}`}>
                <span className="text-blue-400 cursor-pointer hover:underline">{t}</span>
                {i < book.tags.length - 1 && <span className="text-gray-600">, </span>}
              </span>
            ))}
          </p>
        )}
        <p className="text-[15px] font-bold text-gray-100 mt-2">&#8377;{book.price}</p>
        <p className="text-[12px] text-gray-500">
          Delivery by <strong className="text-gray-400">{book.delivery}</strong>
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[13px] text-gray-300 min-w-[16px] text-center">{qty}</span>
          <div className="flex items-center border border-[#3a3a3a] rounded-md overflow-hidden">
            <button
              onClick={() => { if (qty <= 1) onRemove(book.id); else onQty(book.id, qty - 1); }}
              className="w-7 h-7 flex items-center justify-center bg-[#262626] hover:bg-[#333] text-gray-300 border-none cursor-pointer text-[16px] leading-none"
            >−</button>
            <button
              onClick={() => onQty(book.id, qty + 1)}
              className="w-7 h-7 flex items-center justify-center bg-[#262626] hover:bg-[#333] text-gray-300 border-none cursor-pointer text-[16px] leading-none border-l border-[#3a3a3a]"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Checkout Page ── */
const CheckoutPage = () => {
  const { items, removeFromCart, updateQty, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address
  const [useSaved, setUseSaved]       = useState(false);
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [email, setEmail]             = useState(user?.email ?? "");
  const [city, setCity]               = useState("");
  const [pin, setPin]                 = useState("");
  const [phone, setPhone]             = useState("");
  const [state, setState]             = useState("");
  const [country, setCountry]         = useState("India");

  // Coupon
  const [coupon, setCoupon]               = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg]         = useState("");

  const [placing] = useState(false);
  const [error, setError] = useState("");

  const tax        = Math.round(subtotal * TAX_RATE);
  const grandTotal = subtotal + tax - couponDiscount;
  const totalQty   = items.reduce((s, i) => s + i.qty, 0);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "BOOKWORM10") { setCouponDiscount(Math.round(subtotal * 0.1)); setCouponMsg("10% off applied!"); }
    else if (code === "FLAT50")  { setCouponDiscount(50); setCouponMsg("₹50 off applied!"); }
    else                         { setCouponDiscount(0);  setCouponMsg("Invalid coupon code."); }
  };

  const handlePlaceOrder = () => {
    if (!firstName || !addressLine || !city || !pin || !phone) {
      setError("Please fill in all required address fields.");
      return;
    }
    setError("");
    // Navigate to payment page passing the amount
    navigate("/payment", { state: { grandTotal } });
  };

  if (items.length === 0) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center bg-[#161616] gap-4">
        <span className="text-[52px]">🛒</span>
        <p className="text-gray-400 text-[15px]">Your basket is empty.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-4 py-2 rounded-md border-none cursor-pointer transition-colors"
        >
          Continue Shopping
        </button>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 max-md:p-4 w-full mx-auto flex flex-col gap-4" style={{ maxWidth: 960 }}>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[12px] text-gray-500 flex-wrap">
          <button onClick={() => navigate("/")} className="bg-transparent border-none text-blue-400 cursor-pointer p-0 hover:underline text-[12px]">Home</button>
          {items[0]?.book?.tags?.[0] && (<><span>/</span><span className="text-blue-400">{items[0].book.tags[0]}</span></>)}
          {items[0]?.book?.tags?.[1] && (<><span>/</span><span className="text-blue-400">{items[0].book.tags[1]}</span></>)}
          {items[0] && (<><span>/</span><span className="text-blue-400">{items[0].book.title}</span></>)}
          <span>/</span><span className="text-gray-400">Checkout</span>
          <span>/</span>
        </nav>

        {/* Title */}
        <h1 className="text-[20px] font-bold text-gray-100">Shopping Cart</h1>

        {/* ── Cart items: horizontal scroll row ── */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
            {items.map((item) => (
              <div key={item.book.id} className="shrink-0 w-[340px]">
                <CartItem item={item} onRemove={removeFromCart} onQty={updateQty} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Address + Summary row ── */}
        <div className="flex gap-4 items-start max-lg:flex-col">

          {/* Address — left */}
          <div className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-gray-100">Address</h2>
              <label className="flex items-center gap-1.5 text-[12px] text-gray-400 cursor-pointer">
                <input type="checkbox" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} className="accent-blue-500" />
                Use Saved Address
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              {/* Row 1 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">First Name</label>
                <input className={inputClass} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Last Name</label>
                <input className={inputClass} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Address</label>
                <input className={inputClass} placeholder="Address Line 2" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1 col-span-3 max-sm:col-span-1">
                <label className="text-[11px] text-gray-400">e-mail</label>
                <input className={inputClass} type="email" placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">City</label>
                <input className={inputClass} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Pin</label>
                <input className={inputClass} placeholder="000000" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Phone Number</label>
                <div className="flex gap-1">
                  <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-md px-2 flex items-center text-[13px] text-gray-400 shrink-0 cursor-pointer select-none">
                    +91 ▾
                  </div>
                  <input className={inputClass} placeholder="12345 67890" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">State</label>
                <input className={inputClass} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Country</label>
                <select className={selectClass} value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option>India</option><option>USA</option><option>UK</option>
                  <option>Australia</option><option>Canada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grand Total — right */}
          <div className="w-72 max-lg:w-full shrink-0 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden flex flex-col">

            {/* Illustration */}
            <div className="h-[130px] bg-[#1e3a5f] flex items-center justify-center overflow-hidden relative">
              <svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Background glow */}
                <circle cx="140" cy="65" r="55" fill="#2563eb" fillOpacity="0.15"/>
                {/* Book stack */}
                <rect x="70" y="75" width="55" height="38" rx="4" fill="#f59e0b"/>
                <rect x="73" y="72" width="55" height="38" rx="4" fill="#fbbf24"/>
                <rect x="76" y="50" width="50" height="40" rx="4" fill="#1d4ed8"/>
                <rect x="79" y="47" width="50" height="40" rx="4" fill="#3b82f6"/>
                {/* Open book */}
                <path d="M130 60 Q155 50 175 60 L175 95 Q155 85 130 95 Z" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <path d="M175 60 Q195 50 215 60 L215 95 Q195 85 175 95 Z" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <line x1="175" y1="60" x2="175" y2="95" stroke="#475569" strokeWidth="1.5"/>
                {/* Lines on book pages */}
                <line x1="138" y1="70" x2="168" y2="64" stroke="#475569" strokeWidth="1" opacity="0.6"/>
                <line x1="138" y1="76" x2="168" y2="71" stroke="#475569" strokeWidth="1" opacity="0.6"/>
                <line x1="138" y1="82" x2="168" y2="78" stroke="#475569" strokeWidth="1" opacity="0.6"/>
                <line x1="182" y1="64" x2="208" y2="70" stroke="#475569" strokeWidth="1" opacity="0.6"/>
                <line x1="182" y1="71" x2="208" y2="76" stroke="#475569" strokeWidth="1" opacity="0.6"/>
                <line x1="182" y1="78" x2="208" y2="82" stroke="#475569" strokeWidth="1" opacity="0.6"/>
                {/* Stars / dots */}
                <circle cx="105" cy="40" r="2.5" fill="#fbbf24" opacity="0.8"/>
                <circle cx="225" cy="42" r="2" fill="#60a5fa" opacity="0.8"/>
                <circle cx="90" cy="68" r="1.5" fill="#a78bfa" opacity="0.7"/>
                <circle cx="230" cy="75" r="3" fill="#fbbf24" opacity="0.5"/>
              </svg>
            </div>

            {/* Summary rows */}
            <div className="p-4 flex flex-col gap-2.5 text-[13px]">
              <h2 className="text-[15px] font-bold text-gray-100 mb-1">Grand Total</h2>

              <div className="flex justify-between text-gray-300">
                <span>Price ({totalQty} item{totalQty !== 1 ? "s" : ""})</span>
                <span>&#8377;{subtotal.toLocaleString("en-IN")}.00</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>&#8377;{tax.toLocaleString("en-IN")}.00</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery Charges</span>
                <span className="text-gray-300">Free</span>
              </div>

              {/* Coupon row */}
              <div className="flex gap-2 mt-1">
                <input
                  className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-md px-2.5 py-1.5 text-[12px] text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#555]"
                  placeholder="Apply Coupon"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponMsg(""); }}
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold px-3 rounded-md border-none cursor-pointer transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[11px] -mt-1 ${couponMsg.includes("Invalid") ? "text-red-400" : "text-green-400"}`}>{couponMsg}</p>
              )}

              <div className="flex justify-between text-gray-300">
                <span>Discount</span>
                <span>&#8377;{couponDiscount.toLocaleString("en-IN")}.00</span>
              </div>

              <div className="flex justify-between font-bold text-gray-100 text-[14px] border-t border-[#3a3a3a] pt-2 mt-1">
                <span>Total Amount</span>
                <span>&#8377;{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              {error && (
                <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="mt-1 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-semibold py-2.5 rounded-lg border-none cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {placing ? "Placing Order…" : <><span>Pay Now</span><span>🛒</span></>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
