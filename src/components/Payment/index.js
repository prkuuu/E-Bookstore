import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { placeOrder } from "../../services/orderService";

/* ── Input style ── */
const inp =
  "w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-[13px] text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#555] transition-colors";

/* ── Tab definitions ── */
const TABS = [
  { id: "credit",  label: "Credit Card" },
  { id: "debit",   label: "Debit card"  },
  { id: "upi",     label: "UPI"         },
  { id: "wallet",  label: "Wallet"      },
];

/* ── Card form (Credit / Debit) ── */
const CardForm = ({ placing, onPay }) => {
  const [number, setNumber] = useState("");
  const [name, setName]     = useState("");
  const [cvv, setCvv]       = useState("");
  const [expiry, setExpiry] = useState("");

  const formatCard = (v) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1-").replace(/-$/, "");

  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 6);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">Card Number</label>
        <input className={inp} placeholder="XXXX-XXXX-XXXX-XXXX" value={number}
          onChange={(e) => setNumber(formatCard(e.target.value))} maxLength={19} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">Name on Card</label>
        <input className={inp} placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">CVV</label>
        <input className={inp} placeholder="XXX" type="password" maxLength={3}
          value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">Date of Expiry</label>
        <input className={inp} placeholder="MM/YYYY" value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={7} />
      </div>
      <div className="col-span-2 flex justify-end mt-1">
        <PayButton placing={placing} onPay={onPay} />
      </div>
    </div>
  );
};

/* ── UPI form ── */
const UpiForm = ({ placing, onPay }) => {
  const [id, setId] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">UPI ID</label>
        <input className={inp} placeholder="yourname@upi" value={id}
          onChange={(e) => setId(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <PayButton placing={placing} onPay={onPay} />
      </div>
    </div>
  );
};

/* ── Wallet form ── */
const WalletForm = ({ placing, onPay }) => {
  const [wallet, setWallet] = useState("PhonePe");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">Select Wallet</label>
        <div className="flex flex-wrap gap-2">
          {["PhonePe", "Paytm", "Amazon Pay", "Mobikwik"].map((w) => (
            <button
              key={w}
              onClick={() => setWallet(w)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium border cursor-pointer transition-colors
                ${wallet === w
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 hover:border-[#555]"}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <PayButton placing={placing} onPay={onPay} />
      </div>
    </div>
  );
};

/* ── Pay Now button ── */
const PayButton = ({ placing, onPay }) => (
  <button
    onClick={onPay}
    disabled={placing}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2 rounded-md border-none cursor-pointer transition-colors"
  >
    {placing ? "Processing…" : "Pay Now"} <span>🖥</span>
  </button>
);

/* ══════════════════════════════════════════
   Payment Page
══════════════════════════════════════════ */
const PaymentPage = () => {
  const navigate             = useNavigate();
  const location             = useLocation();
  const { user }             = useAuth();
  const { items, clearCart } = useCart();

  // grandTotal passed via router state from CheckoutPage
  const payableAmount = location.state?.grandTotal ?? 0;

  const [activeTab, setActiveTab]       = useState("credit");
  const [placing, setPlacing]           = useState(false);
  const [error, setError]               = useState("");
  // purchased books snapshot shown in confirmation modal
  const [purchasedBooks, setPurchasedBooks] = useState(null);

  const handlePay = async () => {
    setPlacing(true);
    setError("");
    try {
      // Snapshot books before clearing cart
      const bought = items.map((i) => i.book);
      if (user && items.length > 0) {
        await Promise.all(items.map((i) => placeOrder(user.id, i.book.id, i.book.price * i.qty)));
      }
      clearCart();
      setPurchasedBooks(bought); // show confirmation modal
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  return (
    /* ── Full-page background ── */
    <div className="flex-1 relative overflow-hidden bg-[#0d2a4a] flex flex-col">

      {/* Decorative background SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 960 600"
        xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        {/* Background shapes */}
        <circle cx="80"  cy="80"  r="90"  fill="#1a3a5c" opacity="0.6"/>
        <circle cx="880" cy="80"  r="70"  fill="#c0392b" opacity="0.7"/>
        <circle cx="900" cy="300" r="50"  fill="#e67e22" opacity="0.6"/>
        <circle cx="60"  cy="480" r="40"  fill="#2980b9" opacity="0.4"/>

        {/* Squiggly lines */}
        <path d="M30 350 Q80 330 130 360 Q180 390 230 360" stroke="#e67e22" strokeWidth="2.5" fill="none" opacity="0.5"/>
        <path d="M700 480 Q750 460 800 490 Q850 520 900 490" stroke="#d4a017" strokeWidth="2" fill="none" opacity="0.5"/>

        {/* Small diamonds */}
        <rect x="460" y="60"  width="10" height="10" rx="2" fill="#d4a017" opacity="0.8" transform="rotate(45 465 65)"/>
        <rect x="250" y="100" width="10" height="10" rx="2" fill="#d4a017" opacity="0.7" transform="rotate(45 255 105)"/>
        <rect x="820" y="160" width="8"  height="8"  rx="1" fill="#e74c3c" opacity="0.8" transform="rotate(45 824 164)"/>
        <rect x="130" y="290" width="8"  height="8"  rx="1" fill="#e74c3c" opacity="0.7" transform="rotate(45 134 294)"/>
        <rect x="700" y="360" width="10" height="10" rx="2" fill="#d4a017" opacity="0.6" transform="rotate(45 705 365)"/>

        {/* Book top-left */}
        <g transform="translate(110,70) rotate(-20)">
          <rect width="120" height="160" rx="6" fill="#c0392b" opacity="0.9"/>
          <rect x="5" y="5" width="110" height="150" rx="5" fill="#e74c3c" opacity="0.9"/>
          <rect x="15" y="60" width="40" height="30" rx="3" fill="#922b21" opacity="0.9"/>
        </g>

        {/* Book top-right (teal/standing) */}
        <g transform="translate(700,30) rotate(10)">
          <rect width="70" height="130" rx="5" fill="#1a7a8a" opacity="0.85"/>
          <rect x="4" y="4" width="62" height="122" rx="4" fill="#1abc9c" opacity="0.8"/>
        </g>

        {/* Book stack bottom-left */}
        <g transform="translate(50,420)">
          <rect x="0"  y="30" width="150" height="28" rx="5" fill="#1a5276" opacity="0.9"/>
          <rect x="5"  y="15" width="145" height="28" rx="5" fill="#2471a3" opacity="0.9"/>
          <rect x="10" y="0"  width="140" height="28" rx="5" fill="#d4ac0d" opacity="0.9"/>
        </g>

        {/* Open book bottom-right */}
        <g transform="translate(580,460)">
          <path d="M0 80 Q60 50 120 80 L120 130 Q60 100 0 130 Z" fill="#f5cba7" opacity="0.9"/>
          <path d="M120 80 Q180 50 240 80 L240 130 Q180 100 120 130 Z" fill="#fdebd0" opacity="0.9"/>
          <line x1="120" y1="80" x2="120" y2="130" stroke="#aab7b8" strokeWidth="2"/>
          {[0,1,2,3].map((i) => (
            <g key={i}>
              <line x1={15} y1={95 + i*9} x2={105} y2={90 + i*9} stroke="#aab7b8" strokeWidth="1" opacity="0.5"/>
              <line x1={135} y1={90 + i*9} x2={225} y2={95 + i*9} stroke="#aab7b8" strokeWidth="1" opacity="0.5"/>
            </g>
          ))}
        </g>
      </svg>

      {/* ── Confirmation Modal (shown after successful payment) ── */}
      {purchasedBooks && (
        <div className="relative z-20 flex flex-1 items-center justify-center p-6">
          <div className="bg-[#1e1e1e]/95 backdrop-blur-sm border border-[#3a3a3a] rounded-xl shadow-2xl w-full max-w-[560px] p-8 flex flex-col items-center gap-5">

            {/* Green checkmark */}
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            {/* Message */}
            <div className="text-center">
              <p className="text-[16px] text-gray-200 leading-snug">
                Your purchase of the<br/>
                <span className="font-semibold text-white">following reads is successful</span>
              </p>
            </div>

            {/* Purchased book cards */}
            <div className="flex gap-4 flex-wrap justify-center w-full">
              {purchasedBooks.map((book) => (
                <div key={book.id} className="flex gap-3 w-[220px] shrink-0">
                  {/* Cover */}
                  <div
                    className="w-[88px] h-[124px] rounded-md shrink-0 flex items-center justify-center text-[11px] font-black tracking-wider text-white/90 text-center px-1 leading-tight"
                    style={{ backgroundColor: book.cover }}
                  >
                    {book.initials}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                    <h4 className="text-[13px] font-semibold text-gray-100 leading-snug">{book.title}</h4>
                    <p className="text-[12px] text-gray-400">
                      by <span className="text-blue-400">{book.author}</span>
                    </p>
                    {book.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{book.description}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">{book.format}</p>
                    {book.tags?.length > 0 && (
                      <p className="text-[11px] mt-0.5">
                        {book.tags.slice(0, 2).map((t, i) => (
                          <span key={t}>
                            <span className="text-blue-400">{t}</span>
                            {i < Math.min(book.tags.length, 2) - 1 && <span className="text-gray-600">, </span>}
                          </span>
                        ))}
                      </p>
                    )}
                    <p className="text-[13px] font-bold text-gray-100 mt-1">&#8377;{book.price}</p>
                    <p className="text-[11px] text-gray-500">
                      Delivery by <strong className="text-gray-300">{book.delivery}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("/")}
              className="mt-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-5 py-2.5 rounded-md border-none cursor-pointer transition-colors"
            >
              Continue your Shopping
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>

          </div>
        </div>
      )}

      {/* ── Payment Modal (hidden once confirmed) ── */}
      {!purchasedBooks && (
      <div className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="bg-[#1e1e1e]/95 backdrop-blur-sm border border-[#3a3a3a] rounded-xl overflow-hidden shadow-2xl w-full max-w-[580px]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e2e]">
            <h2 className="text-[16px] font-semibold text-gray-100">Complete Payment</h2>
            <span className="text-[15px] font-bold text-gray-100">
              Payable Amount: &#8377;{payableAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Body: tab sidebar + form */}
          <div className="flex min-h-[220px]">

            {/* Tab sidebar */}
            <div className="w-[140px] shrink-0 border-r border-[#2e2e2e] flex flex-col">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-4 py-3.5 text-[13px] border-none cursor-pointer transition-colors border-l-[3px]
                    ${activeTab === tab.id
                      ? "bg-[#262626] text-white border-l-blue-500 font-semibold"
                      : "bg-transparent text-gray-400 border-l-transparent hover:bg-[#262626] hover:text-gray-200"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form area */}
            <div className="flex-1 p-5">
              {error && (
                <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 mb-3">{error}</p>
              )}
              {(activeTab === "credit" || activeTab === "debit") && (
                <CardForm placing={placing} onPay={handlePay} />
              )}
              {activeTab === "upi" && (
                <UpiForm placing={placing} onPay={handlePay} />
              )}
              {activeTab === "wallet" && (
                <WalletForm placing={placing} onPay={handlePay} />
              )}
            </div>

          </div>
        </div>
      </div>
      )}

    </div>
  );
};

export default PaymentPage;
