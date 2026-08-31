"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useDeskLearnings } from "@/components/app/desk-context";
import { PageSkeleton } from "@/components/ui/skeleton";

/**
 * The client the mentee is working for, and their run of tasks inside it.
 *
 * Every learner rotates through a different organisation, so this is the single most useful piece
 * of context a reviewer can have before reading their work: the org on the card is theirs, not the
 * catalogue's, and a submission judged against the wrong brief fails correct work.
 */
export default function MenteeOrgPage() {
  const { menteeId, orgId } = useParams<{ menteeId: string; orgId: string }>();
  const { learnings, loading } = useDeskLearnings();

  const org = useMemo(
    () => (learnings?.orgs ?? []).find((o) => o.id === orgId),
    [learnings, orgId],
  );

  if (loading && !learnings) return <PageSkeleton cards={3} />;
  if (!org) {
    return <div className="px-6 py-10 text-[12.5px] text-slate-500">Organisation not found on this desk.</div>;
  }

  return (
    <div className="px-6 py-6 max-w-[900px]">
      <div className="flex items-center gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-600 grid place-items-center text-[13px] font-semibold">
          {org.initials}
        </span>
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-900 truncate">{org.name}</h1>
          <p className="text-[11.5px] text-slate-500">{org.industry}</p>
        </div>
      </div>

      {org.context && (
        <p className="mt-4 text-[12.5px] text-slate-700 leading-relaxed">{org.context}</p>
      )}

      {org.profile && (
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#e6eaf0] rounded-lg overflow-hidden">
          <Fact label="Head office" value={org.profile.headOffice} />
          <Fact label="Regulator" value={org.profile.primaryRegulator} />
          <Fact label="Mandatory standards" value={(org.profile.mandatoryStandards ?? []).join(", ")} />
        </div>
      )}

      {org.projects.map((p) => (
        <section key={p.id} className="mt-7">
          <div className="flex items-baseline gap-2 mb-2.5">
            <h2 className="text-[13px] font-semibold text-slate-900">{p.title}</h2>
            <span className="font-mono text-[11px] text-slate-400">{p.code}</span>
          </div>
          <div className="space-y-1.5">
            {p.tasks.map((t) => (
              <Link
                key={t.code}
                href={`/mentor/desk/${menteeId}/task/${t.code}`}
                className="flex items-center gap-3 rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3 no-underline hover:bg-[#f8fafc] transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-slate-900 truncate">{t.title}</span>
                  <span className="block font-mono text-[10.5px] text-slate-400">{t.code}</span>
                </span>
                <span className="shrink-0 text-[11.5px] text-slate-500 tabular-nums">
                  {t.done}/{t.total}
                </span>
                <Icon name="chevronRight" size={15} className="shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="text-[9.5px] font-semibold tracking-[0.1em] uppercase text-slate-400">{label}</div>
      <div className="text-[12px] text-slate-800 mt-0.5 break-words">{value || "—"}</div>
    </div>
  );
}
