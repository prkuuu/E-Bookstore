import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-3 py-2 text-[13px] text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#555] transition-colors";

const AuthPage = ({ onBack }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { data, error: authError } =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password);
    setLoading(false);

    if (authError) {
      // Surface a clear message for the most common Supabase errors
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email first — check your inbox for a confirmation link from Supabase.");
      } else if (authError.message.toLowerCase().includes("invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(authError.message);
      }
      return;
    }

    // Sign-up: if Supabase requires email confirmation, the session will be null
    if (mode === "signup" && !data?.session) {
      setError("");
      // Show a friendly notice instead of silently doing nothing
      setMode("confirm");
    }
    // On successful sign-in the AuthContext listener updates `user` automatically
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-[#161616] h-full">
      <div className="w-full max-w-sm bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl p-8 flex flex-col gap-5">
        {onBack && (
          <button
            onClick={onBack}
            className="self-start text-[12px] text-gray-400 bg-transparent border-none cursor-pointer p-0 hover:text-gray-200 flex items-center gap-1"
          >
            ← Back to catalogue
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[22px] text-white">&#9783;</span>
          <span className="text-[18px] font-bold text-white tracking-tight">Book Worm</span>
        </div>

        {/* ── Email confirmation notice ── */}
        {mode === "confirm" ? (
          <div className="flex flex-col gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-4 flex flex-col gap-2">
              <p className="text-[14px] font-semibold text-green-400">Check your inbox ✉️</p>
              <p className="text-[13px] text-gray-300">
                We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
                Click the link in that email, then come back here to sign in.
              </p>
            </div>
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold rounded-md py-2 transition-colors cursor-pointer border-none"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
        <>
        <div>
          <h1 className="text-[17px] font-semibold text-gray-100">
            {mode === "login" ? "Sign in to your account" : "Create an account"}
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {mode === "login"
              ? "Welcome back — enter your credentials."
              : "Fill in the details below to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-gray-400">Email</label>
            <input
              type="email"
              required
              className={inputClass}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-gray-400">Password</label>
            <input
              type="password"
              required
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-gray-400">Confirm Password</label>
              <input
                type="password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-semibold rounded-md py-2 transition-colors cursor-pointer"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-[12px] text-gray-500 text-center">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-blue-400 hover:underline bg-transparent border-none cursor-pointer p-0 text-[12px]"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
        </>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
