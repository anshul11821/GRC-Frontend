// Shapes for the standards library. Kept apart from ./index so the data files can import the
// `item` helper without a runtime import cycle (index imports every data file).

export interface LibItem {
  /** Same spelling the task registers use ("Annex A 5.9", "Clause 6.1", "GV.OC", "CIS 3",
   *  "Article 30", "CC6.1"), so a task's reference resolves to its item without a lookup table. */
  ref: string;
  /** The published title where the standard publishes one; ours for SOC 2 (see publishedTitles). */
  title: string;
  /** OUR one-line summary. Omitted where lib/controls PURPOSE already has one — that wins, so the
   *  task's Control references panel and the library can never say two different things. */
  summary?: string;
  /** OUR plain-terms account of what the item asks for, drawn as the wheel. Never the standard's words. */
  points?: string[];
  /** Sub-items not listed individually (CIS safeguards). */
  count?: number;
}

export interface LibGroup {
  name: string;
  /** Which poster the group sits on — ISO has clauses and Annex A, SOC 2 common and additional criteria. */
  part: string;
  unit: string;
  items: LibItem[];
}

export interface LibStandard {
  /** Matches lib/standards ids, which carry the display name and description. */
  id: string;
  /** Attribution line printed on every exported image. */
  source: string;
  /** False for SOC 2: the AICPA criteria have no short titles, so ours are ours and may not wear the plaque. */
  publishedTitles: boolean;
  countUnit?: string;
  groups: LibGroup[];
}

export const item = (ref: string, title: string, summary?: string, points?: string[], count?: number): LibItem =>
  ({ ref, title, summary, points, count });
