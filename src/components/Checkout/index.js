import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { placeOrder } from "../../services/orderService";

const TAX_RATE      = 0.12; // 12%
const GIFT_POINTS_VALUE = 1; // 1 point = ₹1

const inputClass =
  "w-full bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-3 py-2 text-[13px] text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#555] transition-colors";

const selectClass =
  "w-full bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-3 py-2 text-[13px] text-gray-200 outline-none focus:border-[#555] transition-colors appearance-none cursor-pointer";

/* ── Cart Item Row ── */
const CartItem = ({ item, onRemove, onQty }) => {
  const { book, qty } = item;
  return (
    <div className="flex gap-4 bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg p-4 items-start">
      {/* Cover */}
      <div
        className="w-16 h-22 rounded shrink-0 flex items-center justify-center text-[13px] font-bold tracking-wider text-white/85"
        style={{ backgroundColor: book.cover }}
      >
        {book.initials}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-gray-100 truncate">{book.title}</h3>
        <p className="text-[12px] text-gray-400">by <span className="text-blue-400">{book.author}</span></p>
        <p className="text-[11px] text-gray-500">{book.format}</p>
        <p className="text-[11px] text-gray-500">Delivery by <strong className="text-gray-400">{book.delivery}</strong></p>
        <p className="text-[14px] font-bold text-gray-100 mt-1">&#8377;{(book.price * qty).toLocaleString("en-IN")}</p>
      </div>

      {/* Qty + Remove */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        <button
          onClick={() => onRemove(book.id)}
          className="text-[11px] text-red-400 bg-transparent border-none cursor-pointer hover:text-red-300 p-0"
        >
          Remove
        </button>
        <div className="flex items-center gap-2 bg-[#262626] border border-[#3a3a3a] rounded-md px-2 py-1">
          <button
            onClick={() => onQty(book.id, qty - 1)}
            disabled={qty <= 1}
            className="text-gray-300 bg-transparent border-none cursor-pointer text-[16px] leading-none disabled:opacity-30 hover:text-white px-1"
          >−</button>
          <span className="text-[13px] text-gray-200 min-w-[18px] text-center">{qty}</span>
          <button
            onClick={() => onQty(book.id, qty + 1)}
            className="text-gray-300 bg-transparent border-none cursor-pointer text-[16px] leading-none hover:text-white px-1"
          >+</button>
        </div>
      </div>
    </div>
  );
};

/* ── Payment Option Card ── */
const PaymentOption = ({ id, label, icon, selected, onSelect, children }) => (
  <label
    htmlFor={id}
    className={`flex flex-col gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${selected ? "border-blue-500 bg-blue-500/10" : "border-[#3a3a3a] bg-[#1e1e1e] hover:border-[#555]"}`}
  >
    <div className="flex items-center gap-2">
      <input
        type="radio" id={id} name="payment" value={id}
        checked={selected} onChange={() => onSelect(id)}
        className="accent-blue-500"
      />
      <span className="text-[14px]">{icon}</span>
      <span className="text-[13px] font-medium text-gray-200">{label}</span>
    </div>
    {selected && children}
  </label>
);

/* ── Checkout Page ── */
const CheckoutPage = ({ onBack, onOrderPlaced }) => {
  const { items, removeFromCart, updateQty, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Address
  const [useSaved, setUseSaved]     = useState(false);
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [email, setEmail]           = useState(user?.email ?? "");
  const [city, setCity]             = useState("");
  const [pin, setPin]               = useState("");
  const [phone, setPhone]           = useState("");
  const [state, setState]           = useState("");
  const [country, setCountry]       = useState("India");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId]                 = useState("");
  const [cardNumber, setCardNumber]       = useState("");
  const [cardExpiry, setCardExpiry]       = useState("");
  const [cardCvv, setCardCvv]             = useState("");

  // Gift points (mock: user has 200 points)
  const AVAILABLE_POINTS = 200;
  const [redeemPoints, setRedeemPoints] = useState(false);
  const pointsDiscount = redeemPoints ? Math.min(AVAILABLE_POINTS * GIFT_POINTS_VALUE, subtotal) : 0;

  // Coupon
  const [coupon, setCoupon]         = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg]   = useState("");

  // Placing
  const [placing, setPlacing]       = useState(false);
  const [error, setError]           = useState("");

  const tax           = Math.round(subtotal * TAX_RATE);
  const totalDiscount = pointsDiscount + couponDiscount;
  const grandTotal    = subtotal + tax - totalDiscount;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "BOOKWORM10") { setCouponDiscount(Math.round(subtotal * 0.1)); setCouponMsg("10% off applied!"); }
    else if (code === "FLAT50") { setCouponDiscount(50); setCouponMsg("₹50 off applied!"); }
    else { setCouponDiscount(0); setCouponMsg("Invalid coupon code."); }
  };

  const handlePlaceOrder = async () => {
    if (!firstName || !addressLine || !city || !pin || !phone) {
      setError("Please fill in all required address fields.");
      return;
    }
    setError("");
    setPlacing(true);
    try {
      if (user) {
        await Promise.all(
          items.map((i) => placeOrder(user.id, i.book.id, i.book.price * i.qty))
        );
      }
      clearCart();
      onOrderPlaced();
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center bg-[#161616] gap-4">
        <span className="text-[48px]">🛒</span>
        <p className="text-gray-400 text-[15px]">Your basket is empty.</p>
        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-4 py-2 rounded-md border-none cursor-pointer transition-colors"
        >
          Continue Shopping
        </button>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 max-md:p-4 max-w-6xl w-full mx-auto flex flex-col gap-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <button onClick={onBack} className="bg-transparent border-none text-blue-400 cursor-pointer p-0 hover:underline text-[12px]">Home</button>
          <span>/</span><span className="text-gray-300">Checkout</span>
        </nav>

        <h1 className="text-[18px] font-bold text-gray-100 border-l-[3px] border-blue-500 pl-3">Shopping Cart</h1>

        <div className="flex gap-6 max-lg:flex-col">

          {/* ── LEFT: Items + Address + Payment ── */}
          <div className="flex flex-col gap-5 flex-1 min-w-0">

            {/* Cart Items */}
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CartItem
                  key={item.book.id}
                  item={item}
                  onRemove={removeFromCart}
                  onQty={updateQty}
                />
              ))}
            </div>

            {/* Address */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-gray-100">Address</h2>
                <label className="flex items-center gap-2 text-[12px] text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSaved}
                    onChange={(e) => setUseSaved(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Use Saved Address
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-400">First Name <span className="text-red-400">*</span></label>
                  <input className={inputClass} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-400">Last Name</label>
                  <input className={inputClass} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1 col-span-2 max-sm:col-span-1">
                  <label className="text-[11px] text-gray-400">Address <span className="text-red-400">*</span></label>
                  <input className={inputClass} placeholder="Address Line" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1 col-span-2 max-sm:col-span-1">
                  <label className="text-[11px] text-gray-400">Email</label>
                  <input className={inputClass} type="email" placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-400">City <span className="text-red-400">*</span></label>
                  <input className={inputClass} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-400">Pin <span className="text-red-400">*</span></label>
                  <input className={inputClass} placeholder="000000" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-400">Phone Number <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <span className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-2 py-2 text-[13px] text-gray-400 shrink-0">+91</span>
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
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-5 flex flex-col gap-4">
              <h2 className="text-[15px] font-semibold text-gray-100">Payment Method</h2>
              <div className="flex flex-col gap-2">

                <PaymentOption id="upi" label="UPI" icon="📱" selected={paymentMethod === "upi"} onSelect={setPaymentMethod}>
                  <input
                    className={inputClass}
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </PaymentOption>

                <PaymentOption id="card" label="Credit / Debit Card" icon="💳" selected={paymentMethod === "card"} onSelect={setPaymentMethod}>
                  <div className="flex flex-col gap-2">
                    <input className={inputClass} placeholder="Card Number" maxLength={19} value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())} />
                    <div className="flex gap-2">
                      <input className={inputClass} placeholder="MM/YY" maxLength={5} value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)} />
                      <input className={inputClass} placeholder="CVV" maxLength={3} type="password" value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))} />
                    </div>
                  </div>
                </PaymentOption>

                <PaymentOption id="netbanking" label="Net Banking" icon="🏦" selected={paymentMethod === "netbanking"} onSelect={setPaymentMethod}>
                  <select className={selectClass}>
                    <option>Select your bank</option>
                    <option>SBI</option><option>HDFC</option><option>ICICI</option>
                    <option>Axis Bank</option><option>Kotak</option>
                  </select>
                </PaymentOption>

                <PaymentOption id="cod" label="Cash on Delivery" icon="💵" selected={paymentMethod === "cod"} onSelect={setPaymentMethod}>
                  <p className="text-[12px] text-gray-400">Pay ₹{grandTotal.toLocaleString("en-IN")} when your order arrives.</p>
                </PaymentOption>

              </div>
            </div>

          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="w-80 max-lg:w-full shrink-0 flex flex-col gap-4">

            {/* Gift Points */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-[14px] font-semibold text-gray-100">🎁 Redeem Gift Points</h2>
              <p className="text-[12px] text-gray-400">You have <span className="text-yellow-400 font-semibold">{AVAILABLE_POINTS} points</span> = ₹{AVAILABLE_POINTS}</p>
              <label className="flex items-center gap-2 text-[13px] text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="accent-blue-500"
                />
                Use {AVAILABLE_POINTS} points (save ₹{AVAILABLE_POINTS})
              </label>
            </div>

            {/* Grand Total */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-[15px] font-bold text-gray-100">Grand Total</h2>

              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between text-gray-300">
                  <span>Price ({items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""})</span>
                  <span>&#8377;{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (12%)</span>
                  <span>&#8377;{tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Charges</span>
                  <span className="text-green-400">Free</span>
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mt-1">
                  <input
                    className="flex-1 bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-2 py-1.5 text-[12px] text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#555]"
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
                  <p className={`text-[11px] ${couponMsg.includes("Invalid") ? "text-red-400" : "text-green-400"}`}>{couponMsg}</p>
                )}

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>− &#8377;{totalDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="border-t border-[#3a3a3a] pt-2 flex justify-between font-bold text-gray-100 text-[14px]">
                  <span>Total Amount</span>
                  <span>&#8377;{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {error && (
                <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[14px] font-semibold py-2.5 rounded-lg border-none cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {placing ? "Placing Order…" : <><span>Pay Now</span><span>🛒</span></>}
              </button>

              <p className="text-[11px] text-gray-500 text-center">Hint: try coupon <span className="text-gray-300 font-medium">BOOKWORM10</span> or <span className="text-gray-300 font-medium">FLAT50</span></p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
