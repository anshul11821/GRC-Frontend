"use client";

import { useEffect, useState } from "react";
import { MentorShell } from "@/components/mentor/shell";
import { isAuthError, mentorApi, type Earnings } from "@/lib/mentor";

/**
 * My Earnings — the mentor's counterpart to the learner's My Learnings.
 *
 * Paid per gate reviewed, counted from `gate_decisions` and nothing else, so this can never
 * disagree with the record in the account menu. A withdrawn decision is excluded: an undone review
 * was not a review, and paying for one would make the undo button worth money.
 *
 * When no rate has been agreed the page shows the volume and says so, rather than printing a
 * figure nobody signed off. That is deliberate — a number here is something a person may plan
 * around, and inventing one would be worse than showing none.
 */
export default function MentorEarningsPage() {
  return (
    <MentorShell>
      <EarningsBody />
    </MentorShell>
  );
}

function EarningsBody() {
  const [data, setData] = useState<Earnings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mentorApi
      .earnings()
      .then(setData)
      .catch((e) => {
        if (!isAuthError(e)) setError("Could not load your earnings.");
      });
  }, []);

  if (error) {
    return <div className="px-6 py-10 text-[12.5px] text-[#a31d1d]">{error}</div>;
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-[900px] px-6 pt-7">
        <div className="h-[120px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
      </div>
    );
  }

  const priced = data.ratePerReview > 0;
  const money = (n: number | null) =>
    n === null ? "—" : `${data.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="mx-auto max-w-[900px] px-6 pt-7 pb-16">
      <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">My Earnings</h1>
      <p className="text-[12.5px] text-slate-500 mt-1 mb-6">
        {priced
          ? `Paid per gate reviewed, at ${data.currency} ${data.ratePerReview.toFixed(2)} each. Withdrawn decisions are not counted.`
          : "Paid per gate reviewed. Withdrawn decisions are not counted."}
      </p>

      {!priced && (
        <div className="mb-6 rounded-xl border border-[#e8c48a] bg-[#fdf1e6] px-4 py-3 text-[12.5px] text-[#7c4a10] leading-relaxed">
          No rate has been set on your account yet, so this page shows the work and not the money.
          Everything below is counted and will price itself the moment a rate is agreed.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Figure label="Reviews this month" value={String(data.reviewsThisMonth)} />
        <Figure label="Reviews all time" value={String(data.reviewsTotal)} />
        <Figure label="This month" value={money(data.amountThisMonth)} muted={!priced} />
        <Figure label="All time" value={money(data.amountTotal)} muted={!priced} />
      </div>

      <h2 className="text-[13px] font-semibold text-slate-900 mb-2.5">By month</h2>
      {data.months.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/50 px-5 py-8 text-center text-[12.5px] text-slate-500">
          You have not decided any gates yet.
        </div>
      ) : (
        <div className="rounded-[14px] border border-[#e6eaf0] bg-white overflow-x-auto">
          <table className="w-full min-w-[420px] text-[12.5px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left font-semibold px-4 py-2.5">Month</th>
                <th className="text-right font-semibold px-4 py-2.5">Gates reviewed</th>
                <th className="text-right font-semibold px-4 py-2.5">Earned</th>
              </tr>
            </thead>
            <tbody>
              {data.months.map((m) => (
                <tr key={m.month} className="border-t border-[#f1f5f9]">
                  <td className="px-4 py-2.5 text-slate-800">{monthLabel(m.month)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700 tabular-nums">{m.reviews}</td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${m.amount === null ? "text-slate-400" : "text-slate-800"}`}
                  >
                    {money(m.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
        This is a record of reviewing done, not an invoice or a statement of account.
      </p>
    </div>
  );
}

/** "2026-08" → "August 2026". Built from the parts rather than parsed as a date, because
 *  `new Date("2026-08")` is UTC-midnight and renders as July in any negative offset. */
function monthLabel(month: string): string {
  const [year, mm] = month.split("-");
  const index = Number(mm) - 1;
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return names[index] ? `${names[index]} ${year}` : month;
}

function Figure({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
      <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400">{label}</div>
      <div
        className={`text-[20px] font-semibold tracking-tight mt-1 tabular-nums ${muted ? "text-slate-300" : "text-slate-900"}`}
      >
        {value}
      </div>
    </div>
  );
}
