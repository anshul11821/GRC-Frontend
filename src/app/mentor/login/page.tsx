"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { mentorApi, setMentorToken } from "@/lib/mentor";

export default function MentorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await mentorApi.login(email, password);
      setMentorToken(res.accessToken);
      router.replace("/mentor");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-[#FAFAF7] px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-[380px] rounded-2xl border border-[#e6eaf0] bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[17px] font-semibold tracking-tight">
            <span className="text-slate-900">grc</span>
            <span className="text-indigo-600">mentor</span>
          </span>
          <span className="inline-flex items-center h-[18px] px-1.5 rounded bg-slate-900 text-white text-[9.5px] font-semibold tracking-[0.12em]">
            MENTOR
          </span>
        </div>
        <p className="text-[12.5px] text-slate-500 mb-6">Review console for gated submissions.</p>

        <label className="block mb-3">
          <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-lg border border-[#e6eaf0] px-3 text-[13px] text-slate-800 focus:outline-none focus:border-indigo-300"
          />
        </label>
        <label className="block mb-5">
          <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-[#e6eaf0] px-3 text-[13px] text-slate-800 focus:outline-none focus:border-indigo-300"
          />
        </label>

        {error && (
          <div className="mb-4 rounded-lg border border-[#f0c2c2] bg-[#fdecec] px-3 py-2 text-[12px] text-[#a31d1d]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full h-10 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
