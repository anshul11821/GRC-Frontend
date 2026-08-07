"use client";

import { Icon } from "@/components/ui/icon";
import type { LinkedInIdentity } from "@/lib/linkedin-verify";

// Shared by the student waitlist and the reviewer application: a "Continue with LinkedIn"
// button, or — once verified — a banner showing the confirmed identity.

export function LinkedInGate({
  identity,
  onStart,
}: {
  identity: LinkedInIdentity | null;
  onStart: () => void;
}) {
  if (identity) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 px-3.5 py-3">
        <span className="mt-0.5 shrink-0 grid place-items-center w-6 h-6 rounded-full bg-emerald-600 text-white">
          <Icon name="check" size={13} strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-emerald-900">Verified with LinkedIn</div>
          <div className="text-[12px] text-emerald-700/90 truncate">
            {identity.name} · {identity.email}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-[13.5px] font-semibold tracking-tight transition-colors"
    >
      <Icon name="linkedin" size={17} /> Continue with LinkedIn
    </button>
  );
}
