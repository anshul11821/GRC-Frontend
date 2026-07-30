"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { OrgLogo } from "@/components/app/org-logo";
import { LRN_CHIP } from "@/lib/tones";
import type { LearningOrg } from "@/lib/learnings";

/**
 * A titled panel — the single building block of this page. Every panel is a direct child of one
 * six-column grid, so panels sharing a row share a top and a bottom edge (that's the alignment;
 * nested per-column flex stacks can't do it). `span` is the lg column count: 2 = compact fact
 * panel, 3 = half width.
 */
function Panel({ title, icon, aside, span, tour, children }: {
  title: string;
  icon: IconName;
  aside?: string;
  span: 2 | 3;
  /** data-tour tag, for the walkthrough to spotlight this panel. */
  tour?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-tour={tour} className={`rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 flex flex-col ${span === 3 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-2"}`}>
      <div className="flex items-baseline justify-between gap-3 mb-3.5">
        <h3 className="text-[13px] font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <Icon name={icon} size={14} className="text-indigo-500 shrink-0 translate-y-[2px]" />
          {title}
        </h3>
        {aside && <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-slate-500 shrink-0 tabular-nums">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** Inset row — the tonal list item this page repeats for every enumerable fact. */
const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-2.5 py-2">{children}</div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-2.5 h-[26px] rounded-full bg-slate-100 text-slate-700 text-[11.5px] tracking-tight">{children}</span>
);

/** Ruled list — asset inventories read as an audit table, not as chips. */
const RuledList = ({ items }: { items: string[] }) => (
  <ul>
    {items.map((s, i) => (
      <li key={i} className="text-[12.5px] text-slate-700 tracking-tight py-2 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0" style={{ textWrap: "pretty" }}>{s}</li>
    ))}
  </ul>
);

/** Column heading inside a panel. */
const SubHead = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-indigo-600 border-b border-indigo-100 pb-1.5 mb-2">{children}</h4>
);

const REQ_PARTIES = [
  ["Stakeholder", "stakeholder"],
  ["Employee", "employee"],
  ["Regulator", "regulator"],
  ["Partner", "partner"],
] as const;

/**
 * The organisation's full context — the Working Desk's landing page, and the source material every
 * task is answered from. One continuous overview (no tabs): identity and engagement counters, then
 * a single grid of fact panels ordered who they are → what they run → who has a stake → what they
 * must comply with. Every panel is conditional; a thin profile simply renders fewer.
 */
export function OrgDetail({ org, action }: { org: LearningOrg; action?: React.ReactNode }) {
  const p = org.profile;
  const headOffice = p?.officeLocations?.headOffice || p?.headOffice || "";
  const regional = p?.officeLocations?.regionalOffices ?? [];
  const onPrem = p?.informationAssets?.onPremises ?? [];
  const cloud = p?.informationAssets?.cloud ?? [];
  const internal = p?.interestedParties?.internal ?? [];
  const external = p?.interestedParties?.external ?? [];
  const kr = p?.keyRequirements;
  const reqRows = REQ_PARTIES.flatMap(([label, key]) => (kr?.[key] ?? []).map((need) => ({ party: label, need })));
  const description = p?.organisationalContext || org.context;

  // Engagement counters — the header's right column. Real progress from the tree, not a score.
  const tasks = org.projects.flatMap((pr) => pr.tasks);
  const acts = tasks.reduce((n, t) => n + t.total, 0);
  const actsDone = tasks.reduce((n, t) => n + t.done, 0);
  const tasksDone = tasks.filter((t) => t.total > 0 && t.done === t.total).length;
  const pct = acts ? Math.round((actsDone / acts) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Identity — description on the left at a readable measure, engagement counters on the right. */}
      <header data-tour="org-identity" className="rounded-2xl ring-1 ring-slate-200/70 bg-gradient-to-br from-indigo-50/70 via-white to-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <OrgLogo org={org} className="w-12 h-12 rounded-xl text-[15px] shrink-0" iconSize={23} />
            <div className="min-w-0">
              <span className="inline-flex items-center h-[20px] px-2 rounded-full bg-indigo-50 ring-1 ring-indigo-200/70 text-indigo-700 font-mono text-[9.5px] font-medium uppercase tracking-[0.1em]">
                Organisation context
              </span>
              <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-slate-900 leading-tight mt-1.5">{org.name}</h1>
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className={`inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md text-[11px] font-medium tracking-tight ring-1 ${LRN_CHIP[org.tone] ?? LRN_CHIP.indigo}`}>
                  <Icon name="briefcase" size={11} /> {org.industry}
                </span>
                {p?.subIndustry && (
                  <span className="inline-flex items-center h-[22px] px-2 rounded-md text-[11px] font-medium tracking-tight ring-1 bg-slate-100 text-slate-600 ring-slate-200/70">{p.subIndustry}</span>
                )}
                {headOffice && (
                  <span className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md text-[11px] font-medium tracking-tight ring-1 bg-slate-100 text-slate-600 ring-slate-200/70">
                    <Icon name="mapPin" size={11} /> {headOffice}
                  </span>
                )}
              </div>
            </div>
          </div>
          {action}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-4 mt-4">
          <div className="flex-1 min-w-0 space-y-3">
            {description && (
              <p className="text-[13px] text-slate-600 leading-[1.65] tracking-tight max-w-[68ch]" style={{ textWrap: "pretty" }}>{description}</p>
            )}
            {p?.primaryRegulator && (
              <p className="flex items-start gap-2 text-[12.5px] text-indigo-900 bg-indigo-50/70 ring-1 ring-indigo-100 rounded-xl px-3 py-2 max-w-[68ch]">
                <Icon name="shield" size={14} className="text-indigo-500 shrink-0 mt-[2px]" />
                <span style={{ textWrap: "pretty" }}><span className="font-semibold">Primary regulator — </span>{p.primaryRegulator}</span>
              </p>
            )}
          </div>

          {acts > 0 && (
            <div className="lg:w-[248px] shrink-0 rounded-xl bg-white/70 ring-1 ring-slate-200/70 p-3.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-slate-500">Tasks</div>
                  <div className="text-[19px] font-semibold tracking-tight text-slate-900 tabular-nums mt-0.5">{tasksDone}<span className="text-slate-500 font-normal">/{tasks.length}</span></div>
                </div>
                <div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-slate-500">Activities</div>
                  <div className="text-[19px] font-semibold tracking-tight text-slate-900 tabular-nums mt-0.5">{actsDone}<span className="text-slate-500 font-normal">/{acts}</span></div>
                </div>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-3">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-slate-500 mt-1.5 tabular-nums">{pct}% of this engagement complete</div>
            </div>
          )}
        </div>
      </header>

      {/* One grid for every fact panel — rows align because they're siblings, not nested columns. */}
      <div data-tour="org-grid" className="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {(headOffice || regional.length > 0) && (
          <Panel title="Office locations" icon="globe" span={2} aside={`${(headOffice ? 1 : 0) + regional.length} sites`}>
            <div className="space-y-1.5">
              {headOffice && (
                <Row>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-[12.5px] text-slate-800 tracking-tight truncate">{headOffice}</span>
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-indigo-600 shrink-0">HQ</span>
                </Row>
              )}
              {regional.map((o, i) => (
                <Row key={i}><span className="text-[12.5px] text-slate-700 tracking-tight pl-[14px] truncate">{o}</span></Row>
              ))}
            </div>
            {p?.hqRegulatoryRationale && (
              <div className="mt-auto pt-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500 mb-1 border-t border-slate-100 pt-3">Why here</div>
                <p className="text-[11.5px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{p.hqRegulatoryRationale}</p>
              </div>
            )}
          </Panel>
        )}

        {p?.clientDataHandled?.length ? (
          <Panel title="Data inventory" icon="lock" span={2} aside={`${p.clientDataHandled.length} types`}>
            <div className="flex flex-wrap gap-1.5">
              {p.clientDataHandled.map((d, i) => <Chip key={i}>{d}</Chip>)}
            </div>
          </Panel>
        ) : null}

        {(p?.mandatoryStandards?.length || p?.optionalStandards?.length) ? (
          <Panel title="Standards" icon="shield" span={2} tour="org-obligations" aside={p?.mandatoryStandards?.length ? `${p.mandatoryStandards.length} mandatory` : undefined}>
            <div className="space-y-1.5">
              {(p?.mandatoryStandards ?? []).map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-50/60 ring-1 ring-emerald-100 px-2.5 py-2">
                  <Icon name="checkCircle" size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-[12px] font-medium text-slate-800 tracking-tight" style={{ textWrap: "pretty" }}>{s}</span>
                </div>
              ))}
            </div>
            {p?.optionalStandards?.length ? (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500 mb-1.5">Optional</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.optionalStandards.map((s, i) => <Chip key={i}>{s}</Chip>)}
                </div>
              </div>
            ) : null}
          </Panel>
        ) : null}

        {p?.servicesAndProducts?.length ? (
          <Panel title="Service ecosystem" icon="cube" span={3} aside="What they sell">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {p.servicesAndProducts.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-2.5">
                  <Icon name="bolt" size={14} className="text-indigo-500 shrink-0 mt-[2px]" />
                  <span className="text-[12px] font-medium text-slate-800 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{s}</span>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {(internal.length > 0 || external.length > 0) && (
          <Panel title="Stakeholders" icon="users" span={3} aside={`${internal.length + external.length} parties`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {internal.length > 0 && (
                <div>
                  <SubHead>Internal governance</SubHead>
                  <div className="space-y-1.5">
                    {internal.map((s, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-800 tracking-tight" style={{ textWrap: "pretty" }}>{s}</div>
                    ))}
                  </div>
                </div>
              )}
              {external.length > 0 && (
                <div>
                  <SubHead>External partners</SubHead>
                  <div className="space-y-1.5">
                    {external.map((s, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-800 tracking-tight" style={{ textWrap: "pretty" }}>{s}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}

        {onPrem.length > 0 && (
          <Panel title="On-premises" icon="grid" span={2} aside="Self-hosted"><RuledList items={onPrem} /></Panel>
        )}
        {cloud.length > 0 && (
          <Panel title="Cloud infrastructure" icon="globe" span={2} aside="Hosted"><RuledList items={cloud} /></Panel>
        )}
        {p?.customerFacingProcesses?.length ? (
          <Panel title="Customer-facing processes" icon="refresh" span={2}>
            <ul className="space-y-2">
              {p.customerFacingProcesses.map((s, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-slate-600 tracking-tight leading-relaxed">
                  <span className="w-1 h-1 rounded-full bg-indigo-300 shrink-0 mt-[7px]" />
                  <span style={{ textWrap: "pretty" }}>{s}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {reqRows.length > 0 && (
          <Panel title="Requirements matrix" icon="checkSquare" span={3} aside={`${reqRows.length} needs`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-slate-500 border-b border-slate-200">
                  <th className="font-medium pb-1.5 pr-3 w-[92px]">Party</th>
                  <th className="font-medium pb-1.5">Primary need</th>
                </tr>
              </thead>
              <tbody>
                {reqRows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="py-1.5 pr-3 text-[11.5px] font-semibold text-slate-800 tracking-tight whitespace-nowrap">{r.party}</td>
                    <td className="py-1.5 text-[12px] text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}>{r.need}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}

        {p?.regulatoryRequirements?.length ? (
          <Panel title="Regulatory requirements" icon="flag" span={3} aside={`${p.regulatoryRequirements.length} obligations`}>
            <ol className="relative pl-5 border-l-2 border-slate-200 space-y-3">
              {p.regulatoryRequirements.map((s, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[26px] top-[5px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                  <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{s}</p>
                </li>
              ))}
            </ol>
          </Panel>
        ) : null}
      </div>

      {!p && !description && (
        <p className="text-[12.5px] text-slate-500 tracking-tight">No organisation context available yet.</p>
      )}
    </div>
  );
}
