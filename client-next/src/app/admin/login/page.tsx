"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid email or password.");
        setSubmitting(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.role === "admin" || data.role === "super_admin") {
        router.push("/admin/recruitment");
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm border-2 border-black rounded-[12px] p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
        <h1
          className="text-3xl text-black mb-1 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          CodeChef Admin
        </h1>
        <p className="text-sm text-gray-500 mb-6 font-sans">Sign in to manage recruitment &amp; the leaderboard.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-bold text-black uppercase tracking-wider font-sans">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-black rounded-[8px] px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-black uppercase tracking-wider font-sans">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-black rounded-[8px] px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] font-sans"
            />
          </div>

          {error && (
            <div className="border-2 border-red-500 rounded-[8px] px-3 py-2 bg-red-50">
              <p className="text-sm text-red-600 font-sans">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-[#5878AF] text-white border-2 border-black rounded-[8px] py-2.5 font-bold text-sm uppercase tracking-widest transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-[#486390] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.1em" }}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
