"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { setPaid, usePaid } from "@/lib/entitlement";
import { CURRENT_PLAN, FOUNDATION_PRICE, FOUNDATION_PRICE_CAPTION } from "@/lib/billing";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";

/** Formats raw digits as groups of 4 for the card field. */
const groupCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/**
 * Foundations course checkout. Reached after profile completion (before the dashboard).
 * This is a PREVIEW — no real charge is made; "Pay" records the entitlement locally.
 */
export default function CheckoutPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const paid = usePaid(user?.email);

  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (!user.isProfileComplete) router.replace("/complete-profile");
    else if (paid) router.replace("/app");
  }, [loading, user, paid, router]);

  if (loading || !user || !user.isProfileComplete || paid) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  const cardOk = card.replace(/\s/g, "").length >= 12 && expiry.length === 5 && cvc.length >= 3 && name.trim().length > 1;

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardOk || busy) return;
    setBusy(true);
    // Simulate a payment round-trip — no real charge.
    await new Promise((r) => setTimeout(r, 1100));
    setPaid(user.email);
    router.replace("/app");
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Enrol in {CURRENT_PLAN.programCode}</h1>
      <p className="text-[13px] text-slate-500 mt-1">One step left — complete your enrolment to unlock the platform.</p>

      {/* order summary */}
      <div className="mt-5 rounded-xl ring-1 ring-indigo-200/60 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-indigo-200">{CURRENT_PLAN.programCode} · Foundations</div>
            <div className="text-[16px] font-semibold tracking-tight mt-0.5">{CURRENT_PLAN.name}</div>
            <div className="text-[11.5px] text-indigo-100 mt-0.5">{FOUNDATION_PRICE_CAPTION}</div>
          </div>
          <div className="text-[24px] font-semibold tracking-tight shrink-0">{FOUNDATION_PRICE}</div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap gap-x-4 gap-y-1">
          {CURRENT_PLAN.features.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 text-[11.5px] text-indigo-50">
              <Icon name="check" size={12} strokeWidth={2.5} className="text-emerald-300" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* payment form */}
      <form onSubmit={pay} className="mt-5 space-y-4">
        <Field label="Cardholder name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on card" /></Field>
        <Field label="Card number">
          <TextInput icon="creditCard" value={card} onChange={(e) => setCard(groupCard(e.target.value))} placeholder="4242 4242 4242 4242" inputMode="numeric" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Expiry"><TextInput value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" /></Field>
          <Field label="CVC"><TextInput icon="lock" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" /></Field>
        </div>

        <PrimaryBtn type="submit" disabled={busy || !cardOk} className="w-full">
          {busy ? "Processing…" : `Pay ${FOUNDATION_PRICE} & start`}
        </PrimaryBtn>
      </form>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
        <Icon name="lock" size={12} />
        Preview checkout — no real card is charged.
      </div>

      <button
        onClick={async () => {
          await signOut();
          router.replace("/signin");
        }}
        className="mt-4 w-full text-center text-[12.5px] text-slate-400 hover:text-slate-600"
      >
        Sign out
      </button>
    </div>
  );
}
