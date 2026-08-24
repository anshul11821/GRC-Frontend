"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { isEntitled } from "@/lib/entitlement";
import { CURRENT_PLAN } from "@/lib/billing";
import { SkeletonForm } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";

/**
 * Where an account lands when it has no seat on the course.
 *
 * This used to be a card form that charged nothing and wrote the entitlement to localStorage. That
 * cannot stay in production once seats are capped: it handed a free seat to anyone past the cap
 * who typed sixteen digits, and it invited real people to enter a real card number against a
 * checkout with no processor behind it. There is no billing yet, so the honest answer to someone
 * arriving here is that the beta is full.
 */
export default function CheckoutPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const entitled = isEntitled(user);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (!user.isProfileComplete) router.replace("/complete-profile");
    else if (entitled) router.replace("/app");
  }, [loading, user, entitled, router]);

  if (loading || !user || !user.isProfileComplete || entitled) {
    return <SkeletonForm fields={4} />;
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      <div className="w-11 h-11 rounded-xl bg-amber-50 ring-1 ring-amber-200/70 flex items-center justify-center">
        <Icon name="clock" size={20} className="text-amber-600" />
      </div>
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900 mt-4">The free beta is full</h1>
      <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
        Every seat on {CURRENT_PLAN.programCode} {CURRENT_PLAN.name} has been taken. Your account is
        safe — nothing is lost, and it opens the moment a seat is yours.
      </p>

      <div className="mt-5 rounded-xl bg-slate-50/80 ring-1 ring-slate-200/70 px-4 py-3.5">
        <p className="text-[12.5px] text-slate-600 leading-relaxed">
          Join the list and we&apos;ll email <span className="font-medium text-slate-800">{user.email}</span>{" "}
          when the next intake opens. We aren&apos;t charging for the course yet, so there is nothing to pay.
        </p>
      </div>

      <Link
        href="/waitlist"
        className="focus-ring mt-5 h-10 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium tracking-tight transition-colors flex items-center justify-center gap-2 no-underline"
      >
        Join the list
        <Icon name="arrowRight" size={15} />
      </Link>

      <button
        onClick={() => signOut("/signin")}
        className="mt-4 w-full text-center text-[12.5px] text-slate-400 hover:text-slate-600"
      >
        Sign out
      </button>
    </div>
  );
}
