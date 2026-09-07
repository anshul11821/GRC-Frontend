"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoster } from "@/components/mentor/desk-context";
import { DeskSectionSkeleton } from "@/components/mentor/review-surface";

/**
 * The Review Desk opens on somebody's work.
 *
 * It used to open on a roster page — a searchable, paged list of the mentor's learners — and that
 * list is now the strip along the top, which said the same names one screen further down. Two
 * lists of the same people, one above the other, and a click between the reviewer and anything
 * decidable.
 *
 * So this route resolves rather than renders, off the roster the layout has already loaded: the
 * first learner waiting on a decision, or — for a mentor whose caseload is clear — anyone at all,
 * so they still land somewhere real. Search and "all mentees" went into the strip with the list,
 * so nothing that page could do is gone.
 */
export default function ReviewDeskPage() {
  const router = useRouter();
  const { rows, loading, waitingOnly, setWaitingOnly } = useRoster();

  useEffect(() => {
    if (loading) return;
    if (rows.length > 0) {
      router.replace(`/mentor/desk/${rows[0].userId}`);
      return;
    }
    // Nobody is waiting. Widen once to the whole roster rather than dead-ending on an empty desk.
    if (waitingOnly) setWaitingOnly(false);
  }, [rows, loading, waitingOnly, setWaitingOnly, router]);

  if (!loading && !waitingOnly && rows.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f8fa] p-4">
        <div className="mx-auto max-w-[1240px] rounded-lg border border-dashed border-[#e6eaf0] bg-white px-6 py-14 text-center">
          <div className="text-[14px] font-semibold text-slate-800">No learners assigned yet</div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            They are assigned round-robin at signup, so the next mentee to join may be yours.
          </p>
        </div>
      </div>
    );
  }

  return <DeskSectionSkeleton />;
}
