"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatWindow } from "@/components/ui/float-window";
import { Gloss } from "@/components/app/glossary";
import { ORG_TABS, OrgPanels, type OrgTab } from "@/components/app/org-context";
import { Icon } from "@/components/ui/icon";
import type { LearningOrg } from "@/lib/learnings";

/**
 * The organisation's briefing: an identity line, five tabs, and the fact panels of the open tab —
 * the same five tabs under the same labels as the mentor console's `OrgContextWindow`.
 *
 * One component for both places a mentee reads it, the draggable window and the org context page,
 * so the two cannot drift apart: a fact is in the same tab, in the same words, wherever you look.
 * Nothing is fetched; the whole profile already rides on the desk's learnings tree.
 */
export function OrgBrief({ org, href, onLeave }: {
  org: LearningOrg;
  /** The full context page. Only the window offers it — on the page you are already there. */
  href?: string;
  onLeave?: () => void;
}) {
  const [tab, setTab] = useState<OrgTab>(ORG_TABS[0].id);
  const p = org.profile;
  const headOffice = p?.officeLocations?.headOffice || p?.headOffice || "";
  const description = p?.organisationalContext || org.context;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 pb-1">
        <span className="text-[12px] font-medium text-indigo-700">{org.industry}</span>
        {p?.subIndustry && (
          <>
            <span className="h-3 w-px bg-slate-200" />
            <span className="text-[11.5px] text-slate-500">{p.subIndustry}</span>
          </>
        )}
        {headOffice && (
          <>
            <span className="h-3 w-px bg-slate-200" />
            <span className="text-[11.5px] text-slate-400">{headOffice}</span>
          </>
        )}
        {href && (
          <Link
            href={href}
            onClick={onLeave}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 no-underline hover:text-indigo-700"
          >
            Full context <Icon name="arrowRight" size={11} />
          </Link>
        )}
      </div>

      {/* A segmented control, not an underline: five labels wrap in a narrow window, and an
          underline on a wrapped strip marks a tab mid-block where it reads as a divider. */}
      <div role="tablist" className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {ORG_TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`h-7 whitespace-nowrap rounded-md px-2.5 text-[11.5px] font-medium transition-colors ${
                active ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.10)]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* The context paragraph leads the Overview tab — it is the first thing anyone needs. */}
      {tab === "context" && description && (
        <p className="px-1 pt-1 text-[12.5px] leading-[1.65] tracking-tight text-slate-600" style={{ textWrap: "pretty" }}>
          <Gloss>{description}</Gloss>
        </p>
      )}

      <div className="pt-1">
        <OrgPanels org={org} tab={tab} />
      </div>
    </div>
  );
}

/**
 * The briefing over the work. A window rather than a page because the facts are needed *while*
 * answering, and leaving the step to look one up loses the sheet being written on.
 */
export function OrgWindow({ org, href, onClose }: {
  org: LearningOrg;
  href: string;
  onClose: () => void;
}) {
  return (
    // Clears the header — whatever height it currently is — so it never opens over the `i` that
    // opened it.
    <FloatWindow title={org.name} icon="briefcase" width={620} height={620} top="calc(var(--hdr-h, 64px) + 12px)" onClose={onClose}>
      <OrgBrief org={org} href={href} onLeave={onClose} />
    </FloatWindow>
  );
}
