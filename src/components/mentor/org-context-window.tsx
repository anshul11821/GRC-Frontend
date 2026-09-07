"use client";

import { useEffect, useState } from "react";
import { FloatWindow } from "@/components/mentor/float-window";
import { Icon } from "@/components/ui/icon";
import { loadOrg, peekOrg } from "@/components/mentor/desk-context";
import {
  PANES,
  PaneOverview,
  PaneData,
  PaneStandards,
  PanePeople,
  PaneInfra,
} from "@/components/mentor/orgs-workspace";
import { isAuthError, type OrgDetail } from "@/lib/mentor";

/**
 * The organisation's briefing, over the work being reviewed.
 *
 * Same content as the dashboard's Organisations tab, section for section — it renders the
 * dashboard's own pane components rather than a second version of them, so a field added to the
 * profile shows up in both places or neither.
 *
 * What differs is only the shape the sections take. The dashboard has a full page and shows one
 * pane at a time behind a tab strip; this is a 470px window floating over a submission, where a
 * reviewer wants two sections open at once — the client data beside the standards, say, to judge
 * whether the mentee classified it right. So the tabs become collapsible sections, all of them
 * reachable by scrolling, and Overview is open on arrival because it is the one that says what
 * this organisation is. The dashboard's Mentees pane is not carried over — see SECTIONS below.
 */

const BODIES: Record<string, (o: OrgDetail) => React.ReactNode> = {
  context: (o) => <PaneOverview o={o} />,
  data: (o) => <PaneData o={o} />,
  std: (o) => <PaneStandards o={o} />,
  people: (o) => <PanePeople o={o} />,
  infra: (o) => <PaneInfra o={o} />,
};

// The dashboard's Mentees pane is dropped here. This window opens from inside one mentee's desk,
// over their submission — a roster of who else works at this organisation answers a question
// nobody is asking at that moment. What is left is the briefing itself.
const SECTIONS = PANES.filter((s) => s.id !== "mentees");

export function OrgContextWindow({
  orgId,
  orgName,
  onClose,
}: {
  orgId: string;
  orgName: string;
  onClose: () => void;
}) {
  const [org, setOrg] = useState<OrgDetail | null>(() => peekOrg(orgId) ?? null);
  // Open on arrival, so the window says something the moment it appears rather than presenting
  // six shut drawers. The rest are the reviewer's to open.
  const [open, setOpen] = useState<Set<string>>(() => new Set(["context"]));

  useEffect(() => {
    let live = true;
    loadOrg(orgId)
      .then((r) => live && setOrg(r))
      .catch((e) => {
        if (!isAuthError(e)) console.error(e);
      });
    return () => {
      live = false;
    };
  }, [orgId]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <FloatWindow title={org?.name || orgName} icon="briefcase" width={470} height={580} onClose={onClose}>
      {!org ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* The identifying line the dashboard puts in its page header. In a window the title bar
              already carries the name, so only what the name does not say is repeated. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 pb-1">
            <span className="text-[12px] font-medium text-indigo-700">{org.industry}</span>
            {org.subIndustry && (
              <>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-[11.5px] text-slate-500">{org.subIndustry}</span>
              </>
            )}
            {org.headOffice && (
              <>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-[11.5px] text-slate-400">{org.headOffice}</span>
              </>
            )}
          </div>

          {SECTIONS.map((s) => {
            const on = open.has(s.id);
            return (
              <section key={s.id} className="rounded-xl bg-slate-50/70 ring-1 ring-slate-200/70">
                <button
                  onClick={() => toggle(s.id)}
                  aria-expanded={on}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-100/70"
                >
                  <Icon
                    name="chevronDown"
                    size={14}
                    className={`shrink-0 text-slate-400 transition-transform ${on ? "" : "-rotate-90"}`}
                  />
                  <span className="text-[12.5px] font-semibold tracking-tight text-slate-900">
                    {s.label}
                  </span>
                </button>
                {on && <div className="@container px-3 pb-3">{BODIES[s.id](org)}</div>}
              </section>
            );
          })}
        </div>
      )}
    </FloatWindow>
  );
}
