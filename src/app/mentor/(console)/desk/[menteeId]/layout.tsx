"use client";

import { useParams } from "next/navigation";
import { MenteeGatesProvider } from "@/components/mentor/mentee-gates";
import { MenteeTreeProvider, useDeskFilter } from "@/components/mentor/desk-context";
import { OrgStrip, PublishActiveMentee } from "@/components/mentor/desk-chrome";

/**
 * One learner's desk: bands across the top, the work beneath them.
 *
 * The bands are in a layout rather than the page so that choosing a step re-renders only the work
 * — the organisation filter and the state tab keep their place, and nothing is refetched. Measured
 * on this seam earlier: navigating between steps of one learner issues no requests at all.
 *
 * The providers sit above both because both halves are built from the same two fetches, and they
 * reset their own state when `menteeId` changes — which covers it whether the router remounts this
 * layout for a new param or re-renders it in place. A frame of one learner's steps under another's
 * name is the worst thing this screen could show, and it should not depend on which of those the
 * router chooses to do.
 */
export default function MenteeLayout({ children }: { children: React.ReactNode }) {
  const { menteeId } = useParams<{ menteeId: string }>();
  return (
    <MenteeGatesProvider menteeId={menteeId}>
      <MenteeTreeProvider menteeId={menteeId}>
        <PublishActiveMentee />
        <Bands />
        {children}
      </MenteeTreeProvider>
    </MenteeGatesProvider>
  );
}

/**
 * Collapsed in place once a step is open — never unmounted by navigating elsewhere.
 *
 * The organisation band is a picker like the tabs and the step row, so it goes with them. The
 * toolbar inside the work area is what brings all four back.
 */
function Bands() {
  const { activityId } = useParams<{ activityId?: string }>();
  const { expanded } = useDeskFilter();
  if (activityId && !expanded) return null;
  return <OrgStrip />;
}
