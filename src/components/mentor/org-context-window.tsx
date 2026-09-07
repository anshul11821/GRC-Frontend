"use client";

import { useEffect, useState } from "react";
import { FloatWindow } from "@/components/mentor/float-window";
import { loadOrg, peekOrg } from "@/components/mentor/desk-context";
import { isAuthError, type OrgDetail } from "@/lib/mentor";

/**
 * The organisation's file, over the work being reviewed.
 *
 * Built as two of the GRC 101 forms (`docs/forms/grc101-forms.css`) rather than as a panel of its
 * own invention. **Source folio** (07) is the form for material the organisation supplied: ochre,
 * which in this product never means warning — it means "this is theirs", the cue to test the
 * material rather than obey it, which is exactly a reviewer's stance toward the source a mentee
 * worked from. A folio always carries its provenance; one without is a bug.
 *
 * The interior is a **register** (08), whose spec names this very content: *"look up · do not read
 * end to end … the org profile is a register with a panel index — never seventeen cards."* The
 * first cut of this window was a stack of cards, which is the one thing that form forbids. A
 * reviewer here is answering "is Confidential right for a payroll bureau under the ICO" — that is
 * a lookup, and a register is shaped for lookups.
 *
 * So: mono for labels, ids and provenance (the form's assigned role for them), values in the
 * reading face, dotted rules between rows, and the panel index as tabs — one panel at a time,
 * named so a reviewer can see where a fact will be before going to it. Nothing here is a card.
 */

const OCHRE = "#9a5216";
const OCHRE_TINT = "#fbf0e1";
const OCHRE_EDGE = "#e2c49a";
const MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

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

  const panels: { id: string; label: string; render: (o: OrgDetail) => React.ReactNode }[] = [
    {
      id: "context",
      label: "Context",
      render: (o) => <Prose>{o.context}</Prose>,
    },
    {
      id: "regulator",
      label: "Regulator",
      render: (o) => (
        <>
          <Prose>{o.regulator}</Prose>
          {o.regulatorRationale && <Prose muted>{o.regulatorRationale}</Prose>}
        </>
      ),
    },
    {
      id: "standards",
      label: "Standards",
      render: (o) => <Tokens items={o.mandatoryStandards} />,
    },
    {
      id: "duties",
      label: "Duties",
      render: (o) => <Lines items={o.regulatoryRequirements} />,
    },
    { id: "data", label: "Data held", render: (o) => <Lines items={o.clientData} /> },
    { id: "processes", label: "Processes", render: (o) => <Lines items={o.processes} /> },
    {
      id: "internal",
      label: "Internal",
      render: (o) => <Lines items={o.interestedParties?.internal ?? []} />,
    },
    {
      id: "external",
      label: "External",
      render: (o) => <Lines items={o.interestedParties?.external ?? []} />,
    },
    {
      id: "onprem",
      label: "On-premises",
      render: (o) => <Lines items={o.informationAssets?.onPremises ?? []} />,
    },
    {
      id: "cloud",
      label: "Cloud",
      render: (o) => <Lines items={o.informationAssets?.cloud ?? []} />,
    },
  ];

  const [pane, setPane] = useState(panels[0].id);
  const shown = panels.find((p) => p.id === pane) ?? panels[0];

  return (
    <FloatWindow title={org?.name || orgName} icon="briefcase" width={470} height={580} onClose={onClose}>
      <div className="h-full">
        {!org ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : (
          <div
            // mt-[22px] is the folio's own rule: the tab is drawn above the body, and without
            // room for it the tab rides up into whatever sits over the folio. It then fills what
            // is left, so a short panel leaves the folio short rather than leaving the window
            // half empty below it — and the currency line sits at the foot, where it belongs.
            className="relative mt-[22px] flex h-[calc(100%-22px)] flex-col rounded-[0_8px_8px_8px] border px-4 pb-3 pt-3.5"
            style={{ background: OCHRE_TINT, borderColor: OCHRE_EDGE }}
          >
            {/* The folio's tab. It says whose material this is, which is the whole point of the
                colour: a reviewer should read it as the organisation's claim about itself, not as
                the programme's ruling. */}
            <span
              className="absolute -top-[21px] left-[-1px] flex h-[21px] items-center rounded-t-md border border-b-0 px-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ background: OCHRE_TINT, borderColor: OCHRE_EDGE, color: OCHRE, fontFamily: MONO }}
            >
              Supplied by the organisation
            </span>

            <Row label="Sector" value={[org.industry, org.subIndustry].filter(Boolean).join(" — ")} />
            <Row label="Head office" value={org.headOffice} />

            {/* The register's panel index, as tabs. Ten panels of prose read end to end is exactly
                what the form says not to build; naming them and showing one is the index doing its
                job. They wrap rather than scroll — a row of tabs you have to scroll to see is an
                index that hides half of itself. */}
            <nav
              className="mt-3 flex flex-wrap gap-1 border-t border-dotted pt-2.5"
              style={{ borderColor: OCHRE_EDGE }}
            >
              {panels.map((p) => {
                const on = p.id === pane;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPane(p.id)}
                    aria-pressed={on}
                    className="rounded px-1.5 py-0.5 text-[10.5px] transition-colors"
                    style={
                      on
                        ? { fontFamily: MONO, background: OCHRE, color: OCHRE_TINT }
                        : { fontFamily: MONO, color: OCHRE }
                    }
                  >
                    {p.label.toLowerCase()}
                  </button>
                );
              })}
            </nav>

            <section
              data-panel={shown.id}
              // The panel takes the slack and scrolls if it needs to; the tabs and the currency
              // line stay put, so switching panels never moves them.
              className="mt-2.5 min-h-0 flex-1 overflow-y-auto border-t border-dotted pt-2.5"
              style={{ borderColor: OCHRE_EDGE }}
            >
              {shown.render(org)}
            </section>

            {/* The currency line. A folio without provenance is a bug: a reviewer has to know that
                this is the same text the mentee was briefed with, not our paraphrase of it. */}
            <p
              className="mt-3 border-t border-dotted pt-2 text-[10px] leading-relaxed"
              style={{ fontFamily: MONO, color: OCHRE, borderColor: OCHRE_EDGE }}
            >
              {org.id} · the profile as briefed to the mentee, unedited
            </p>
          </div>
        )}
      </div>
    </FloatWindow>
  );
}

/** Two-column register row: mono key, read value. */
function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-[3px]">
      <span
        className="w-[86px] shrink-0 pt-[1px] text-[10px] uppercase tracking-[0.06em]"
        style={{ fontFamily: MONO, color: OCHRE }}
      >
        {label}
      </span>
      <span className="min-w-0 flex-1 text-[12px] leading-snug text-[#131c28]">{value}</span>
    </div>
  );
}

function Prose({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  if (!children) return null;
  return (
    <p className={`text-[12px] leading-relaxed ${muted ? "mt-1.5 text-[#7d899a]" : "text-[#4e5a6b]"}`}>
      {children}
    </p>
  );
}

/**
 * Named artefacts — ISO/IEC 27001:2022 and the like. These earn a bordered token because they are
 * a closed vocabulary a reviewer matches against exactly; everything else on this window is prose
 * the organisation wrote, and pillboxing prose only made its sentence fragments look like tags.
 */
function Tokens({ items }: { items: string[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((x) => (
        <span
          key={x}
          className="rounded border px-1.5 py-0.5 text-[10.5px]"
          style={{ fontFamily: MONO, borderColor: OCHRE_EDGE, color: OCHRE }}
        >
          {x}
        </span>
      ))}
    </div>
  );
}

/**
 * A list of facts — or a sentence that was stored as one.
 *
 * The seed holds these two ways. Some organisations carry a curated list ("Employee PII (names,
 * contacts, payroll data)"); others carry a single sentence that was split on its commas, so the
 * last item reads "and highly sensitive payroll and tax data requiring strict security." Bulleted,
 * that fragment looks like a fact in its own right and the reader is left wondering what it means.
 *
 * The text is intact either way — only its shape is wrong — so a prose-shaped list is rejoined and
 * read as the sentence it is. Detected rather than configured: which organisations are affected is
 * a property of the content, and 9 of the 17 are (`scripts/audit_org_profiles.py`).
 */
function Lines({ items }: { items: string[] }) {
  if (items.length === 0) return <Empty />;

  // Two tells, both properties of a split sentence rather than of a list: a clause opening
  // with "and", or items that end in a full stop. Curated entries do neither.
  const prose =
    items.some((x) => /^\s*and\s/i.test(x)) ||
    (items.length > 2 && items.some((x) => /\.\s*$/.test(x)));
  // Joining on ", " reproduces the original sentence exactly — that is how it was split.
  if (prose) return <Prose>{items.join(", ")}</Prose>;

  return (
    <ul className="space-y-[3px]">
      {items.map((x) => (
        <li key={x} className="text-[12px] leading-snug text-[#4e5a6b]">
          {x}
        </li>
      ))}
    </ul>
  );
}

const Empty = () => <p className="text-[11.5px] text-[#7d899a]">Not recorded in the profile.</p>;
