"use client";

import { MentorShell } from "@/components/mentor/shell";
import { RosterProvider, useWarmCaseload } from "@/components/mentor/desk-context";

/**
 * The console chrome, mounted once for every mentor route except sign-in.
 *
 * It used to be mounted by each page instead, which meant every navigation unmounted it: the
 * sidebar, the account menu and the `GET /mentor/me` behind them were thrown away and rebuilt on
 * each click, so moving between two mentees blanked the whole screen to "Loading the console…"
 * and reset the sidebar's collapsed state on the way. A layout persists across navigations within
 * its subtree, which is the whole reason to have one.
 *
 * `(console)` is a route group: it shapes the layout tree without appearing in any URL, so
 * `/mentor/desk` stays `/mentor/desk` while `/mentor/login` — a sibling, outside the group —
 * correctly gets no chrome and no auth gate.
 *
 * The roster is console-wide rather than desk-only for two reasons: the warm-up below needs it
 * from wherever the reviewer signs in, and arriving at the desk from the Dashboard then finds it
 * already loaded.
 */
export default function MentorConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <MentorShell>
      <RosterProvider>
        <Warm />
        {children}
      </RosterProvider>
    </MentorShell>
  );
}

/** Warms the top of the worklist in the background. Draws nothing. */
function Warm() {
  useWarmCaseload();
  return null;
}
