"use client";

import { useParams } from "next/navigation";
import { DeskFilterProvider, useDeskFilter } from "@/components/mentor/desk-context";
import { MenteeStrip } from "@/components/mentor/desk-chrome";

/**
 * The Review Desk's outermost frame: the strip of the mentor's learners.
 *
 * It belongs to a layout rather than to a page because it does not depend on which mentee, which
 * organisation or which step is open — so it should not be thrown away when one of those changes.
 * The roster behind it sits one level up again, in the console layout, because the Dashboard wants
 * it too.
 *
 * It scrolls away with everything else. It used to be pinned above a nested scroller and then
 * hidden by a scroll listener, which meant the chrome snapped in and out under the reader — the
 * page moving on its own while they were trying to read something on it. Ordinary scrolling does
 * the same job with nothing to go wrong.
 */
export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const { menteeId } = useParams<{ menteeId?: string }>();
  return (
    // Above every band that reads it. Mounted one level down, as it was, this outer strip saw only
    // the default and stayed open while the three bands below it collapsed.
    <DeskFilterProvider menteeId={menteeId}>
      {/* No height cap and no scroller of its own: the console shell already has one, and a
          second nested inside it is what pinned these bands above the work instead of letting
          them scroll away with it. */}
      <div>
        <MenteeBand />
        {children}
      </div>
    </DeskFilterProvider>
  );
}

function MenteeBand() {
  const { activityId } = useParams<{ activityId?: string }>();
  const { expanded } = useDeskFilter();
  if (activityId && !expanded) return null;
  return <MenteeStrip />;
}
