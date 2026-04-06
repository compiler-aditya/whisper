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

  const handleGuest = () => {
    signUp("Guest", `guest-${Date.now()}@whisper.app`);
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
    } catch {
      setError("Google sign-in unavailable. Try email instead.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--bg)" }}>
      {/* Centered container — narrow on desktop, full on mobile */}
      <div className="w-full max-w-[420px] h-full sm:h-auto flex flex-col sm:rounded-2xl overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Branding */}
        <div className="flex-1 sm:flex-none flex flex-col items-center justify-center px-6 py-16 sm:py-14 relative">
          {/* Ambient glow */}
          <div
            className="absolute animate-breathe"
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,196,124,0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Sound wave mark */}
          <div className="relative flex items-end gap-[3px] mb-10">
            {[0.3, 0.5, 0.8, 1, 0.8, 0.5, 0.3].map((h, i) => (
              <div
                key={i}
                className="rounded-full animate-breathe"
                style={{
                  width: 3,
                  height: h * 32,
                  background: "var(--accent)",
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6 + h * 0.4,
                }}
              />
            ))}
          </div>

          <h1
            className="text-[42px] font-extralight tracking-[-0.02em] mb-3"
            style={{ color: "var(--text)" }}
          >
            Whisper
          </h1>
          <p className="text-sm font-light" style={{ color: "var(--text-secondary)" }}>
            Everything has a voice
          </p>
        </div>

        {/* Auth form */}
        <div
          className="px-6 pb-10 pt-8 sm:px-8 sm:pb-8"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3.5 flex items-center justify-center gap-3 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              color: "var(--text)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Mode toggle */}
          <div className="flex gap-6 mb-5 justify-center">
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className="text-sm pb-1 transition-all"
              style={{
                color: mode === "signup" ? "var(--text)" : "var(--text-muted)",
                borderBottom: mode === "signup" ? "1px solid var(--accent)" : "1px solid transparent",
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className="text-sm pb-1 transition-all"
              style={{
                color: mode === "signin" ? "var(--text)" : "var(--text-muted)",
                borderBottom: mode === "signin" ? "1px solid var(--accent)" : "1px solid transparent",
              }}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-transparent text-sm py-3 outline-none transition-colors placeholder:opacity-30"
                  style={{
                    color: "var(--text)",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderBottomColor = "var(--border)"}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent text-sm py-3 outline-none transition-colors placeholder:opacity-30"
                style={{
                  color: "var(--text)",
                  borderBottom: "1px solid var(--border)",
                }}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderBottomColor = "var(--border)"}
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: "var(--danger)" }}>{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                borderRadius: 12,
              }}
            >
              {mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <button
            onClick={handleGuest}
            className="w-full mt-4 py-2.5 text-xs transition-all active:scale-[0.98]"
            style={{ color: "var(--text-muted)" }}
          >
            Continue as Guest
          </button>

          <p className="text-center text-[10px] mt-3" style={{ color: "var(--text-muted)" }}>
            Point your camera at anything. It speaks.
          </p>
        </div>
      </div>
    </div>
  );
}
