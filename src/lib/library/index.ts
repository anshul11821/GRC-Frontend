// The standards library: every clause and control of the five standards GRC 101 works against,
// in our own words. Display names and descriptions come from lib/standards; plain-terms summaries
// defer to lib/controls PURPOSE where one exists, so a control reads the same everywhere.

import { CONTROLS_BY_TASK, purposeForRef } from "../controls";
import { STANDARD_BY_ID } from "../standards";
import { ISO27001 } from "./iso27001";
import { NIST_CSF } from "./nist-csf";
import { CIS_V8 } from "./cis-v8";
import { SOC2 } from "./soc2";
import { GDPR } from "./gdpr";
import type { LibGroup, LibItem, LibStandard } from "./types";

export type { LibGroup, LibItem, LibStandard };

export const LIBRARY: LibStandard[] = [ISO27001, NIST_CSF, CIS_V8, SOC2, GDPR];
export const LIBRARY_BY_ID: Record<string, LibStandard> = Object.fromEntries(LIBRARY.map((s) => [s.id, s]));

export const nameOf = (s: LibStandard) => STANDARD_BY_ID[s.id]?.fullName ?? s.id;
export const slugOf = (ref: string) => ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const summaryOf = (i: LibItem) => purposeForRef(i.ref) ?? i.summary ?? "";
export const partsOf = (s: LibStandard) => [...new Set(s.groups.map((g) => g.part))];
export const entriesOf = (s: LibStandard) => s.groups.flatMap((group) => group.items.map((item) => ({ item, group })));
export const findEntry = (s: LibStandard, slug: string) => entriesOf(s).find((e) => slugOf(e.item.ref) === slug);

export const itemHref = (s: LibStandard, i: LibItem, task?: string) =>
  `/app/library/${s.id}/${slugOf(i.ref)}${task ? `?task=${encodeURIComponent(task)}` : ""}`;

/** A task register's reference in the spellings the library uses. The registers cite CIS as
 *  "Control 11.1", GDPR sub-paragraphs and pairs ("Article 5(1)(e)", "Article 13 & 14") and SOC 2
 *  as a range ("CC1–CC9"). */
export function expandRef(ref: string): string[] {
  const r = ref.trim();
  const cis = r.match(/^Control\s+(\d[\d.]*)$/);
  if (cis) return [`CIS ${cis[1]}`];
  const art = r.match(/^Article\s+(\d+)(?:\S*\s*&\s*(\d+))?/);
  if (art) return [art[1], art[2]].filter(Boolean).map((n) => `Article ${n}`);
  const range = r.match(/^CC(\d)\s*[–-]\s*CC(\d)$/);
  if (range) return Array.from({ length: +range[2] - +range[1] + 1 }, (_, k) => `CC${+range[1] + k}`);
  return [r];
}

/** Is this item what the reference cites — the item itself, a part of it (GV.OC-02 is part of
 *  GV.OC), or a family it belongs to (A1 contains A1.2)? */
export function covers(itemRef: string, ref: string): boolean {
  return expandRef(ref).some((r) =>
    r === itemRef || r.startsWith(`${itemRef}.`) || r.startsWith(`${itemRef}-`) || itemRef.startsWith(`${r}.`));
}

/** The one library item a reference opens. Family-level references (A1, CC1–CC9) open nothing:
 *  they name many items, and picking one of them would be a guess. */
export function resolveRef(ref: string): { standard: LibStandard; item: LibItem } | null {
  for (const r of expandRef(ref))
    for (const standard of LIBRARY)
      for (const { item } of entriesOf(standard))
        if (r === item.ref || r.startsWith(`${item.ref}.`) || r.startsWith(`${item.ref}-`)) return { standard, item };
  return null;
}

export const taskCovers = (task: string, itemRef: string) =>
  (CONTROLS_BY_TASK[task]?.controls ?? []).some((c) => covers(itemRef, c.num));

export const tasksCovering = (itemRef: string) =>
  Object.keys(CONTROLS_BY_TASK).filter((code) => taskCovers(code, itemRef));
