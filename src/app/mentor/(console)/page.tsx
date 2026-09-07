"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { OrgsWorkspace } from "@/components/mentor/orgs-workspace";
import { loadAnalytics, peekAnalytics } from "@/components/mentor/desk-context";
import { isAuthError, type MentorAnalytics } from "@/lib/mentor";

/**
 * The mentor's home: what is waiting, what has been done, and where the work is.
 *
 * It replaced a Kanban of the worklist. The board was the same information the Review Desk now
 * carries — its state tabs *are* a worklist, and better at it, because they sit beside the thing
 * being reviewed — so the home was a second place to read one list. This answers the questions the
 * desk cannot: how much is outstanding across every learner, which organisations it is piling up
 * at, and whether the backlog is growing or shrinking.
 *
 * Every figure is this mentor's own caseload. There is deliberately no cohort number and no
 * ranking: the programme measures items and gates rather than reviewers (HITL v3 §11).
 */
export default function MentorDashboardPage() {
  return (
    // useSearchParams needs a Suspense boundary to prerender; the console shell is already
    // client-side, so this only ever shows for a frame.
    <Suspense fallback={<div className="px-6 py-6 text-[12.5px] text-slate-500">Loading…</div>}>
      <Dashboard />
    </Suspense>
  );
}

/**
 * Two views of one caseload, on one page.
 *
 * Organisations were briefly a nav item of their own. They are not a separate place — they are the
 * same work counted a different way, and the dashboard's own "busiest organisations" list points
 * straight into them, so a second destination meant leaving the numbers to read what they were
 * about. The tab is in the URL (`?tab=orgs&org=NPP`) so that link still opens exactly one
 * organisation.
 */
function Dashboard() {
  const params = useSearchParams();
  const tab = params.get("tab") === "orgs" ? "orgs" : "overview";

  // Seeded from the cache, so coming back to the dashboard paints with no skeleton at all.
  const [a, setA] = useState<MentorAnalytics | null>(() => peekAnalytics() ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    loadAnalytics()
      .then((r) => live && setA(r))
      .catch((e) => {
        if (live && !isAuthError(e)) setError("Could not load your dashboard.");
      });
    return () => {
      live = false;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-[1560px] px-6 py-6">
        <div className="rounded-xl border border-[#f0c2c2] bg-[#fdecec] px-4 py-3 text-[12.5px] text-[#a31d1d]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1560px] flex-col gap-4 px-6 py-5">
      <div className="flex items-end gap-1 border-b border-slate-200/70">
        {(
          [
            ["overview", "Overview"],
            ["orgs", `Organisations${a?.orgs ? ` (${a.orgs})` : ""}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            // Not `router.replace`: a search-param change through the router is a navigation, and
            // it made switching tab wait on a server round trip. See `selectOrg` for the measurement.
            onClick={() =>
              window.history.replaceState(null, "", id === "orgs" ? "?tab=orgs" : "/mentor")
            }
            aria-pressed={tab === id}
            className={`-mb-px h-9 whitespace-nowrap border-b-2 px-3 text-[12.5px] font-medium transition-colors ${
              tab === id
                ? "border-indigo-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "orgs" ? (
        // The list travels with the figures; the tab makes no request of its own.
        <OrgsWorkspace orgs={a?.orgList ?? null} />
      ) : a ? (
        <Overview a={a} />
      ) : (
        <OverviewSkeleton />
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-3">
      <div className="h-12 w-72 animate-pulse rounded-lg bg-slate-100" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[74px] animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-3.5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[232px] animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function Overview({ a }: { a: MentorAnalytics }) {
  const done = a.gatesDelivered - a.pending;
  // Everything still moving: the two piles on the mentor and the two on the learner. Past due is a
  // slice of the first two, so it is deliberately not added in.
  const open_ = a.awaitingFirst + a.inProgress + a.inRework + a.awaitingResponse;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
            Your caseload
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500">
            <b className="tabular-nums text-indigo-600">{a.pending}</b> deliverable
            {a.pending === 1 ? "" : "s"} awaiting review
            {a.overdue > 0 && (
              <>
                {" · "}
                <b className="tabular-nums text-[#a31d1d]">{a.overdue}</b> past the 48-hour mark
              </>
            )}
            {a.dueToday > 0 && (
              <>
                {" · "}
                <b className="tabular-nums text-[#b4741a]">{a.dueToday}</b> due today
              </>
            )}
          </p>
        </div>
        <Link
          href="/mentor/desk"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-[12px] font-medium text-white no-underline transition-colors hover:bg-slate-800"
        >
          Open review desk <Icon name="arrowRight" size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <Metric icon="users" tone="indigo" value={a.mentees} label="Mentees assigned" />
        <Metric icon="briefcase" tone="violet" value={a.orgs} label="Organisations" />
        <Metric
          icon="inbox"
          tone="sky"
          value={a.pending}
          label="Awaiting your review"
          accent="text-indigo-600"
        />
        <Metric
          icon="check"
          tone="emerald"
          value={done}
          sub={`/ ${a.gatesDelivered}`}
          label="Gates decided"
        />
        <Metric
          icon="flag"
          tone="rose"
          value={a.overdue}
          label="Past due"
          accent={a.overdue > 0 ? "text-[#a31d1d]" : undefined}
        />
      </div>

      <div className="grid gap-3.5 md:grid-cols-3">
        <Panel title="Review queue" meta={`${open_} open`}>
          {/* Spread down the panel, not stacked at the top. The rows are the panel's whole
              content, so letting them share its height gives each label and bar room to be read
              as its own thing rather than as a dense list. */}
          <div className="flex h-full flex-col justify-between gap-3">
            {/* Split by whose court the ball is in, not by how late it is. The old split — past
                due / due today / in hand — cut the same pile three ways and never said that two
                of those piles are not the mentor's to move. Past due stays, because a reviewer
                needs it, but as what it is: a slice across the two rows above it. */}
            {[
              {
                label: "Awaiting first review",
                value: a.awaitingFirst,
                bar: "bg-indigo-500",
                hint: "Delivered and not yet picked up.",
              },
              {
                label: "In progress",
                value: a.inProgress,
                bar: "bg-violet-500",
                hint: "You have started marking these up.",
              },
              {
                label: "In rework",
                value: a.inRework,
                bar: "bg-amber-500",
                hint: "Returned to the mentee, with an extra attempt.",
              },
              {
                label: "Awaiting mentee response",
                value: a.awaitingResponse,
                bar: "bg-sky-500",
                hint: "Decided, but they have not read it yet — the step stays open until they do.",
              },
              {
                label: "Past due",
                value: a.overdue,
                bar: "bg-rose-500",
                hint: `Past the ${48}-hour mark. Counted again above, not a separate pile.`,
              },
            ]
              // A row that has never had anything in it is a row that teaches nothing. "In
              // progress" only appears once a review has actually been started.
              .filter((q) => q.value > 0 || q.label !== "In progress")
              .map((q) => (
                <div key={q.label} title={q.hint}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[12px] text-slate-600">
                      <span className={`h-1.5 w-1.5 rounded-full ${q.bar}`} />
                      {q.label}
                    </span>
                    <span className="text-[12px] font-semibold tabular-nums text-slate-900">
                      {q.value}
                    </span>
                  </div>
                  <span className="block h-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full ${q.bar}`}
                      style={{ width: `${open_ ? (q.value / open_) * 100 : 0}%` }}
                    />
                  </span>
                </div>
              ))}
            {open_ === 0 && (
              <p className="text-center text-[12px] text-slate-400">Nothing is waiting on you.</p>
            )}
          </div>
        </Panel>

        <Panel title="Decisions recorded" meta="Last 10 weeks">
          <Weeks weeks={a.weeks} />
        </Panel>

        <Panel title="Oldest in your queue" meta={`${a.overdue} past due`}>
          <div className="flex h-full flex-col">
            {a.oldest.length === 0 ? (
              <p className="my-auto text-center text-[12px] text-slate-400">
                Nothing is waiting on you.
              </p>
            ) : (
              a.oldest.map((m) => (
                <Link
                  key={`${m.userId}${m.activityId}`}
                  href={`/mentor/desk/${m.userId}/${m.activityId}`}
                  className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 no-underline transition-colors hover:bg-slate-50"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[9px] font-semibold text-white">
                    {initials(m.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-slate-900">
                      {m.gateName || m.name}
                    </span>
                    <span className="block truncate text-[10.5px] text-slate-400">
                      {m.name}
                      {m.taskCode && ` · ${m.taskCode}`}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[11px] font-medium tabular-nums ${
                      m.waitedDays > 2 ? "text-[#a31d1d]" : "text-slate-500"
                    }`}
                  >
                    {m.waitedDays}d
                  </span>
                </Link>
              ))
            )}
            {a.busiest.length > 0 && (
              <div className="mt-auto border-t border-slate-100 pt-2">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Busiest organisations
                </div>
                {a.busiest.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    href={`/mentor?tab=orgs&org=${encodeURIComponent(o.id)}`}
                    className="group flex w-full items-center gap-2.5 py-1 no-underline"
                  >
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-600 group-hover:text-slate-900">
                      {o.name}
                    </span>
                    <span className="flex w-14 shrink-0">
                      <span className="block h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${(o.pending / (a.busiest[0].pending || 1)) * 100}%`,
                          }}
                        />
                      </span>
                    </span>
                    <span className="w-3 text-right text-[11px] font-semibold tabular-nums text-slate-900">
                      {o.pending}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

const TONE: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
};

function Metric({
  icon,
  tone,
  value,
  sub,
  label,
  accent,
}: {
  icon: IconName;
  tone: keyof typeof TONE;
  value: number | string;
  sub?: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex min-h-[74px] items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 ring-1 ring-slate-200/70">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${TONE[tone]}`}
      >
        <Icon name={icon} size={16} />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span
            className={`text-[20px] font-semibold leading-none tabular-nums tracking-[-0.02em] ${accent || "text-slate-900"}`}
          >
            {value}
          </span>
          {sub && <span className="text-[11px] font-medium tabular-nums text-slate-400">{sub}</span>}
        </div>
        <div className="mt-1 text-[10.5px] leading-snug text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[232px] flex-col overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {meta && <span className="text-[11px] text-slate-400">{meta}</span>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** Ten weeks of decisions. Bars, because the question is "is the backlog moving", not "how many". */
function Weeks({ weeks }: { weeks: number[] }) {
  const max = Math.max(...weeks, 1);
  const total = weeks.reduce((a, b) => a + b, 0);
  const half = Math.floor(weeks.length / 2);
  const prior = weeks.slice(0, half).reduce((a, b) => a + b, 0);
  const recent = weeks.slice(half).reduce((a, b) => a + b, 0);
  // Only claim a trend when there is a prior period to compare with — "+100%" against zero is
  // arithmetic, not information.
  const trend = prior > 0 ? Math.round(((recent - prior) / prior) * 100) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-baseline gap-2">
        <span className="text-[22px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-slate-900">
          {total}
        </span>
        {trend !== null && (
          <span
            className={`text-[11px] font-medium ${trend >= 0 ? "text-emerald-600" : "text-slate-500"}`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% vs the five before
          </span>
        )}
        {total === 0 && <span className="text-[11px] text-slate-400">nothing decided yet</span>}
      </div>
      <div className="mt-3 flex min-h-0 flex-1 items-end gap-2">
        {weeks.map((v, i) => (
          <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[9.5px] font-medium tabular-nums text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
              {v}
            </span>
            <div
              className={`w-full rounded-md transition-colors ${
                i === weeks.length - 1 ? "bg-indigo-600" : "bg-indigo-200"
              } group-hover:bg-indigo-500`}
              // A floor of 2px, so a week with no decisions is still a week rather than a gap.
              style={{ height: `${Math.max(2, (v / max) * 100)}%` }}
            />
            <span className="font-mono text-[9px] text-slate-400">
              {i === weeks.length - 1 ? "now" : `-${weeks.length - 1 - i}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
