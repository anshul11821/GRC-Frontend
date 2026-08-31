"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { isAuthError, mentorApi, type MentorStats } from "@/lib/mentor";
import { mentorBadges, bandForThreshold, UNIT_LABEL, type MentorBadge } from "@/lib/mentor-badges";

/**
 * What a mentor can point at outside the product.
 *
 * Everything here is read off their own record — gates decided, learners held, learners who
 * reached a certificate, roles the register granted them. Nothing is issued, so nothing can be
 * awarded by mistake and nothing can disagree with the audit trail. Withdrawn decisions are
 * already excluded upstream: an undone review was not a review.
 */
export default function MentorBadgesPage() {
  return (
    <MentorShell>
      <BadgesBody />
    </MentorShell>
  );
}

function BadgesBody() {
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mentorApi
      .stats()
      .then(setStats)
      .catch((e) => {
        if (!isAuthError(e)) setError("Could not load your record.");
      });
  }, []);

  if (error) return <div className="px-6 py-10 text-[12.5px] text-[#a31d1d]">{error}</div>;
  if (!stats) {
    return (
      <div className="mx-auto max-w-[980px] px-6 pt-7">
        <div className="h-[140px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
      </div>
    );
  }

  const badges = mentorBadges(stats);
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <div className="mx-auto max-w-[980px] px-6 pt-7 pb-16">
      <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Recognition</h1>
      <p className="text-[12.5px] text-slate-500 mt-1 mb-6">
        Earned from your own record, not awarded. Every figure below is something you did that the
        programme can evidence.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Figure value={stats.decidedTotal} label="Gates reviewed" />
        <Figure value={stats.mentees} label="Learners mentored" />
        <Figure value={stats.menteesCertified} label="Learners certified" />
        <Figure value={stats.roles} label="Reviewer roles held" />
      </div>

      {/* The professional credential, and the most quotable thing on the page: the reviewer roles
          map onto NICE work roles, which is a vocabulary a GRC employer already recognises. */}
      {stats.roleDetail.length > 0 && (
        <section className="mb-9">
          <h2 className="text-[13px] font-semibold text-slate-900 mb-1">
            Qualified to review as
          </h2>
          <p className="text-[11.5px] text-slate-500 mb-3">
            Each reviewer role maps to the NICE work role that qualifies someone to hold it.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {stats.roleDetail.map((r) => (
              <div key={r.code} className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{r.code}</span>
                  <span className="text-[13px] font-medium text-slate-900">{r.name}</span>
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">NICE {r.nice}</div>
                {r.responsibility && (
                  <p className="text-[11.5px] text-slate-500 leading-relaxed mt-1.5">
                    {r.responsibility}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-9">
        <h2 className="text-[13px] font-semibold text-slate-900 mb-3">
          Earned <span className="font-normal text-slate-400">{earned.length}</span>
        </h2>
        {earned.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/50 px-5 py-8 text-center text-[12.5px] text-slate-500">
            Nothing yet. Your first gate decision earns the first of these.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {earned.map((b) => (
              <BadgeCard key={b.id} b={b} />
            ))}
          </div>
        )}
      </section>

      {locked.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-slate-900 mb-3">
            Ahead of you <span className="font-normal text-slate-400">{locked.length}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locked.map((b) => (
              <BadgeCard key={b.id} b={b} />
            ))}
          </div>
        </section>
      )}

      {stats.memberSince && (
        <p className="mt-8 text-[11px] text-slate-400">
          On the bench since{" "}
          {new Date(stats.memberSince).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      )}
    </div>
  );
}

function BadgeCard({ b }: { b: MentorBadge }) {
  const band = bandForThreshold(b.threshold);
  const pct = Math.min(100, Math.round((b.progress / b.threshold) * 100));
  return (
    <div
      className={`rounded-[14px] border px-4 py-3.5 ${
        b.earned ? "border-[#e0d6b0] bg-white" : "border-[#e6eaf0] bg-white/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <Medal earned={b.earned} band={band} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[13.5px] font-semibold truncate ${b.earned ? "text-slate-900" : "text-slate-500"}`}
            >
              {b.name}
            </span>
            {b.earned && <Icon name="check" size={13} className="shrink-0 text-[#1e7a46]" />}
          </div>
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-400 mt-0.5">
            {b.family}
          </div>
        </div>
      </div>
      <p
        className={`text-[11.5px] leading-relaxed mt-2.5 ${b.earned ? "text-slate-700" : "text-slate-400"}`}
      >
        {b.certifies}
      </p>
      {!b.earned && (
        <div className="mt-2.5">
          <div className="flex items-baseline justify-between text-[10.5px] text-slate-400 mb-1">
            <span>
              {b.progress} of {b.threshold} {UNIT_LABEL[b.unit]}
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-slate-300 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Same three-band vocabulary as the learner medal, so the two schemes read as one. */
function Medal({ earned, band }: { earned: boolean; band: string }) {
  const field = earned
    ? band === "MASTERY"
      ? "#0b1020"
      : band === "PRACTITIONER"
        ? "#1e1b4b"
        : "#312e81"
    : "#e2e8f0";
  const gold = earned ? "#e9c46a" : "#cbd5e1";
  return (
    // `Icon` takes no style prop, so the medal's gold is set on the wrapper and the glyph inherits
    // it through currentColor.
    <span
      className="shrink-0 w-10 h-10 rounded-full grid place-items-center"
      style={{ background: field, boxShadow: `inset 0 0 0 2px ${gold}`, color: gold }}
      aria-hidden
    >
      <Icon name="ribbon" size={17} />
    </span>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
      <div className="text-[24px] font-semibold tracking-tight text-slate-900 tabular-nums">{value}</div>
      <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}
