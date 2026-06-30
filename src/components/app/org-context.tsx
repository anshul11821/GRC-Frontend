"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { OrgLogo } from "@/components/app/org-logo";
import { LRN_CHIP } from "@/lib/tones";
import type { LearningOrg } from "@/lib/learnings";

/** Soft chip tones for the standards-coverage pills (includes slate, which SOFT_TONES omits). */
const STD_TONE: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/70",
  sky: "bg-sky-50 text-sky-700 ring-sky-200/70",
  slate: "bg-slate-100 text-slate-700 ring-slate-200/70",
};

/**
 * A titled block in the org-context view. Native <details>, open-state from `open` (the caller's
 * default-open choice); pass collapsible={false} to keep it always-expanded and chevron-less.
 */
function CtxSection({ icon, title, children, collapsible = true, open = false }: { icon: IconName; title: string; children: React.ReactNode; collapsible?: boolean; open?: boolean }) {
  const head = (
    <>
      <Icon name={icon} size={14} className="text-indigo-500 shrink-0" />
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">{title}</h3>
    </>
  );
  if (!collapsible) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-2.5">{head}</div>
        {children}
      </section>
    );
  }
  return (
    <details open={open} className="group">
      <summary className="flex items-center gap-2 mb-2.5 cursor-pointer list-none select-none">
        {head}
        <Icon name="chevronDown" size={14} className="text-slate-400 shrink-0 ml-auto transition-transform group-open:rotate-180" />
      </summary>
      {children}
    </details>
  );
}

/** Pills for a flat string list. */
function Chips({ items, tone = "slate" }: { items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <span key={i} className={`inline-flex items-center px-2.5 h-7 rounded-lg text-[11.5px] font-medium tracking-tight ring-1 ${STD_TONE[tone] ?? STD_TONE.slate}`}>{s}</span>
      ))}
    </div>
  );
}

/** Bulleted list of strings (for longer, sentence-like context). */
function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2 text-[12.5px] text-slate-600 tracking-tight leading-relaxed">
          <span className="mt-[7px] w-1 h-1 rounded-full bg-indigo-300 shrink-0" />
          <span style={{ textWrap: "pretty" }}>{s}</span>
        </li>
      ))}
    </ul>
  );
}

/** Labeled sub-group (e.g. Internal / External) rendered as chips. */
function CtxGroup({ label, items, tone }: { label: string; items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-1.5">{label}</div>
      <Chips items={items} tone={tone} />
    </div>
  );
}

/** The organisation's full context only — no engagement/progress data. Shared by the dashboard
 *  drawer and the Working Desk org page. */
export function OrgDetail({ org, defaultOpen = false }: { org: LearningOrg; defaultOpen?: boolean }) {
  // Caller decides the default open-state for collapsible sections (desk: expanded, dashboard: collapsed).
  const Section = (props: React.ComponentProps<typeof CtxSection>) => <CtxSection open={defaultOpen} {...props} />;
  const p = org.profile;
  const headOffice = p?.officeLocations?.headOffice || p?.headOffice || "";
  const regional = p?.officeLocations?.regionalOffices ?? [];
  const kr = p?.keyRequirements;
  const hasReqs = !!kr && [kr.stakeholder, kr.employee, kr.regulator, kr.partner].some((v) => v?.length);

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="flex items-start gap-3.5">
        <OrgLogo org={org} className="w-12 h-12 rounded-xl text-[15px]" iconSize={24} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 h-[20px] px-2 rounded-md text-[10.5px] font-medium tracking-tight ring-1 ${LRN_CHIP[org.tone] ?? LRN_CHIP.indigo}`}>
              <Icon name="briefcase" size={11} /> {org.industry}
            </span>
            {p?.subIndustry && (
              <span className="inline-flex items-center h-[20px] px-2 rounded-md text-[10.5px] font-medium tracking-tight ring-1 bg-slate-100 text-slate-600 ring-slate-200/70">{p.subIndustry}</span>
            )}
          </div>
          {headOffice && (
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 tracking-tight mt-2">
              <Icon name="mapPin" size={12} className="text-slate-400 shrink-0" /> {headOffice}
            </div>
          )}
          {p?.primaryRegulator && (
            <div className="flex items-start gap-1.5 text-[12px] text-slate-500 tracking-tight mt-1">
              <Icon name="shield" size={12} className="text-slate-400 shrink-0 mt-0.5" /> <span style={{ textWrap: "pretty" }}>{p.primaryRegulator}</span>
            </div>
          )}
        </div>
      </div>

      {(p?.organisationalContext || org.context) && (
        <Section icon="book" title="Overview" collapsible={false}>
          <p className="text-[12.5px] text-slate-600 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{p?.organisationalContext || org.context}</p>
        </Section>
      )}

      {p?.hqRegulatoryRationale && (
        <Section icon="flag" title="HQ regulatory rationale">
          <p className="text-[12.5px] text-slate-600 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{p.hqRegulatoryRationale}</p>
        </Section>
      )}

      {(headOffice || regional.length > 0) && (
        <Section icon="globe" title="Office locations">
          <div className="space-y-2.5">
            <CtxGroup label="Head office" items={headOffice ? [headOffice] : undefined} tone="indigo" />
            <CtxGroup label="Regional offices" items={regional} />
          </div>
        </Section>
      )}

      {p?.servicesAndProducts?.length ? (
        <Section icon="cube" title="Services & products">
          <Chips items={p.servicesAndProducts} tone="violet" />
        </Section>
      ) : null}

      {(p?.interestedParties?.internal?.length || p?.interestedParties?.external?.length) ? (
        <Section icon="users" title="Interested parties">
          <div className="space-y-2.5">
            <CtxGroup label="Internal" items={p?.interestedParties?.internal} tone="sky" />
            <CtxGroup label="External" items={p?.interestedParties?.external} tone="amber" />
          </div>
        </Section>
      ) : null}

      {hasReqs ? (
        <Section icon="checkSquare" title="Key requirements">
          <div className="space-y-3">
            <CtxGroup label="Stakeholder" items={kr?.stakeholder} />
            <CtxGroup label="Employee" items={kr?.employee} />
            <CtxGroup label="Regulator" items={kr?.regulator} />
            <CtxGroup label="Partner" items={kr?.partner} />
          </div>
        </Section>
      ) : null}

      {p?.customerFacingProcesses?.length ? (
        <Section icon="refresh" title="Customer-facing processes">
          <Bullets items={p.customerFacingProcesses} />
        </Section>
      ) : null}

      {p?.clientDataHandled?.length ? (
        <Section icon="lock" title="Client data handled">
          <Bullets items={p.clientDataHandled} />
        </Section>
      ) : null}

      {(p?.informationAssets?.onPremises?.length || p?.informationAssets?.cloud?.length) ? (
        <Section icon="layers" title="Information assets">
          <div className="space-y-2.5">
            <CtxGroup label="On-premises" items={p?.informationAssets?.onPremises} />
            <CtxGroup label="Cloud" items={p?.informationAssets?.cloud} tone="sky" />
          </div>
        </Section>
      ) : null}

      {(p?.mandatoryStandards?.length || p?.optionalStandards?.length) ? (
        <Section icon="shield" title="Standards & regulations">
          <div className="space-y-2.5">
            <CtxGroup label="Mandatory" items={p?.mandatoryStandards} tone="emerald" />
            <CtxGroup label="Optional / recommended" items={p?.optionalStandards} />
          </div>
        </Section>
      ) : null}

      {p?.regulatoryRequirements?.length ? (
        <Section icon="bullseye" title="Regulatory requirements">
          <Bullets items={p.regulatoryRequirements} />
        </Section>
      ) : null}

      {!p && (
        <p className="text-[12.5px] text-slate-400 tracking-tight">No organisation context available yet.</p>
      )}
    </div>
  );
}
