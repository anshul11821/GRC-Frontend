"use client";

import { useEffect, useState } from "react";
import { FloatWindow } from "@/components/mentor/float-window";
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
 * The tab strip is the dashboard's too, so a reviewer who knows where a fact lives on one screen
 * knows where it lives on the other. It wraps rather than scrolls: five labels do not fit across
 * 430px, and a tab row you have to scroll to see is an index that hides half of itself.
 *
 * The dashboard's Mentees pane is not carried over — see SECTIONS below.
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
  const [pane, setPane] = useState<string>(SECTIONS[0].id);

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

  const shown = SECTIONS.find((s) => s.id === pane) ?? SECTIONS[0];

  return (
    <FloatWindow title={org?.name || orgName} icon="briefcase" width={470} height={580} onClose={onClose}>
      {!org ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
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

          {/* Wraps rather than scrolls, for the reason in the docblock. The buttons sit 1px proud
              of the rule via -mb-px, so the underline of the active tab meets it. */}
          <div
            role="tablist"
            className="flex flex-wrap items-end gap-0.5 border-b border-slate-200/70"
          >
            {SECTIONS.map((s) => {
              const on = s.id === pane;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setPane(s.id)}
                  className={`-mb-px h-8 whitespace-nowrap border-b-2 px-2 text-[11.5px] font-medium transition-colors ${
                    on
                      ? "border-indigo-600 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="@container pt-1">{BODIES[shown.id](org)}</div>
        </div>
      )}
    </FloatWindow>
  );
}
