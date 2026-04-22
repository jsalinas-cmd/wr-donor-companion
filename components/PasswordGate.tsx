"use client";

import { useState } from "react";

export default function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        try {
          sessionStorage.setItem("wr-donor-unlocked", "1");
        } catch {}
        onUnlock();
      } else {
        setError("That access code didn't work. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-md fade-up">
        {/* Wordmark-only lockup, per brand: word mark lowercase Gotham/Montserrat + blue mark */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            className="text-[var(--color-wr-gray-70)] text-3xl font-light tracking-tight lowercase"
            style={{ letterSpacing: "-0.01em" }}
          >
            world relief
          </span>
          <WRMark className="w-7 h-7" />
        </div>

        <div className="bg-white border border-[var(--color-wr-gray-10)] rounded-sm p-10">
          <h1 className="text-2xl font-semibold text-[var(--color-wr-gray-80)] mb-3 tracking-tight">
            Welcome.
          </h1>
          <p className="text-[15px] text-[var(--color-wr-gray-70)] mb-8 leading-relaxed">
            This is a private preview of the AI Decision Companion, a donor-initiated guide to our work around the world. Please enter your access code to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-wr-gray-70)] mb-2">
                Access code
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter code"
                autoFocus
                className="w-full px-4 py-3 rounded-sm border border-[var(--color-wr-gray-10)] bg-white text-[var(--color-wr-gray-80)] focus:outline-none focus:border-[var(--color-wr-blue)] focus:ring-2 focus:ring-[var(--color-wr-blue)]/20 transition"
              />
            </div>

            {error && (
              <div className="text-sm text-[var(--color-wr-purple)] fade-up">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-sm bg-[var(--color-wr-blue)] text-white font-semibold tracking-wide uppercase text-sm hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-wr-gray-50)] mt-6 tracking-wide">
          Private preview. Not for external distribution.
        </p>
      </div>
    </div>
  );
}

function WRMark({ className = "" }: { className?: string }) {
  // Stylized stitched-cross mark approximating the World Relief logo mark.
  // Official PNG logo files live on WR Sharepoint; this is a placeholder vector.
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g fill="#009DDC">
        {/* top arm */}
        <rect x="17" y="2"  width="2" height="5" />
        <rect x="20" y="2"  width="2" height="5" />
        <rect x="18" y="8"  width="4" height="1.5" />
        {/* right arm */}
        <rect x="33" y="17" width="5" height="2" />
        <rect x="33" y="20" width="5" height="2" />
        <rect x="30" y="18" width="1.5" height="4" />
        {/* bottom arm */}
        <rect x="17" y="33" width="2" height="5" />
        <rect x="20" y="33" width="2" height="5" />
        <rect x="18" y="30" width="4" height="1.5" />
        {/* left arm */}
        <rect x="2" y="17"  width="5" height="2" />
        <rect x="2" y="20"  width="5" height="2" />
        <rect x="8" y="18"  width="1.5" height="4" />
        {/* center knot */}
        <rect x="15" y="15" width="10" height="2" />
        <rect x="15" y="18" width="10" height="2" />
        <rect x="15" y="21" width="10" height="2" />
        <rect x="17" y="13" width="2" height="14" />
        <rect x="20" y="13" width="2" height="14" />
      </g>
    </svg>
  );
}
