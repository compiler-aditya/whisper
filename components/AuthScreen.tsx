"use client";

import { useState } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { useAuthStore } from "@/store/auth-store";

export default function AuthScreen() {
  const { signUp, signIn } = useAuthStore();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      signUp(name.trim(), trimmedEmail);
    } else {
      const user = signIn(trimmedEmail);
      if (!user) {
        if (!name.trim()) {
          setError("Account not found. Enter your name to create one.");
          setMode("signup");
          return;
        }
        signUp(name.trim(), trimmedEmail);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await nextAuthSignIn("google", {
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.error) {
        setError("Google sign-in failed. Try email instead.");
        setGoogleLoading(false);
      }
      // On success, the session callback in page.tsx will pick it up
    } catch {
      setError("Google sign-in unavailable. Try email instead.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090B] flex items-center justify-center z-50">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm px-6">
        {/* Logo / Orb */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-violet-500/15 animate-orb-pulse blur-xl" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 animate-orb-pulse" style={{ animationDelay: "0.3s" }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center">
              <div className="flex items-end gap-[2px]">
                {[0.4, 0.7, 1, 0.7, 0.4].map((scale, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-white/80 rounded-full"
                    style={{ height: `${scale * 14}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-white/30 text-[10px] font-light tracking-[0.5em] uppercase mb-2">
            W H I S P E R
          </h1>
          <p className="text-white/50 text-sm">Everything has a voice</p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white/80 text-sm font-medium hover:bg-white/[0.08] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
        >
          {googleLoading ? (
            <svg className="w-4 h-4 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-white/20 text-[10px] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Mode tabs */}
          <div className="flex bg-white/[0.03] rounded-full p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${
                mode === "signup"
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-white/40 border border-transparent hover:text-white/60"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${
                mode === "signin"
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-white/40 border border-transparent hover:text-white/60"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Name field */}
          {mode === "signup" && (
            <div>
              <label className="block text-white/30 text-[10px] uppercase tracking-wider mb-1.5 ml-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
                autoComplete="name"
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-white/30 text-[10px] uppercase tracking-wider mb-1.5 ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
              autoComplete="email"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400/80 text-xs text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl text-white font-medium text-sm hover:from-violet-500 hover:to-blue-500 transition-all active:scale-[0.98]"
          >
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-white/15 text-[10px] text-center mt-6">
          Point your camera at anything. It speaks.
        </p>
      </div>
    </div>
  );
}
