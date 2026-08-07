"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/forms";
import type { useEmailVerify } from "@/lib/email-verify";

// Inline email-OTP widget shared by the waitlist and reviewer forms. Sits under the email field;
// the parent gates submit on `hook.verified` and sends `hook.token`.
export function EmailVerify({
  email,
  hook,
}: {
  email: string;
  hook: ReturnType<typeof useEmailVerify>;
}) {
  const [otp, setOtp] = useState("");
  const emailOk = /.+@.+\..+/.test(email);

  if (hook.verified) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 px-3.5 py-2.5">
        <span className="shrink-0 grid place-items-center w-5 h-5 rounded-full bg-emerald-600 text-white">
          <Icon name="check" size={12} strokeWidth={3} />
        </span>
        <span className="text-[12.5px] font-medium text-emerald-900">Email verified</span>
      </div>
    );
  }

  if (hook.sent) {
    return (
      <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
        <p className="text-[12px] text-slate-600">
          We sent a code to <span className="font-medium text-slate-800">{email}</span>. Enter it below.
        </p>
        <div className="flex gap-2">
          <TextInput
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
          />
          <button
            type="button"
            onClick={() => hook.verifyCode(email, otp)}
            disabled={hook.busy || otp.trim().length < 4}
            className="shrink-0 h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
          >
            {hook.busy ? "Checking…" : "Verify"}
          </button>
        </div>
        {hook.error && <p className="text-[11.5px] text-rose-600">{hook.error}</p>}
        <button
          type="button"
          onClick={() => hook.sendCode(email)}
          disabled={hook.busy}
          className="text-[11.5px] text-slate-500 hover:text-indigo-600"
        >
          Didn&apos;t get it? Resend code
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => hook.sendCode(email)}
        disabled={hook.busy || !emailOk}
        className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-white ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-800 text-[13.5px] font-semibold tracking-tight transition-colors"
      >
        <Icon name="mail" size={16} /> {hook.busy ? "Sending…" : "Verify email address"}
      </button>
      {hook.error && <p className="mt-2 text-[11.5px] text-rose-600 text-center">{hook.error}</p>}
      {!emailOk && <p className="mt-1.5 text-[11px] text-slate-400 text-center">Enter your email above first.</p>}
    </div>
  );
}
