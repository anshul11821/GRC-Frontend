import { RECORD_TASKS } from "./record-tasks";

/**
 * The column labels and order a mentee's register was filled in with.
 *
 * The mentor's card is built from the payload alone (`build_entries`), which is what lets it show
 * all 24 verbs without a renderer each, and lets it still show a submission whose workspace has
 * since changed. The cost is that a table's headers are the payload's own object keys, in whatever
 * order that object happens to hold them — so a reviewer was reading
 *
 *     cost | item | kind | routedTo | assurance | acceptedBy
 *
 * against a form the mentee had seen as
 *
 *     Item Filed Or Recommended | Type | What It Proves | Cost / Disruption | Routed To (role) | …
 *
 * Different words, different order, same data. On a register whose whole point is that the mentee
 * put the right fact in the right column, that is the one thing a reviewer must not have to
 * reconstruct.
 *
 * The workspace already declares this — `RECORD_TASKS[<task>/<step>].columns` is `{key, label}` in
 * the order the form lays them out — so the fix is to read it rather than to invent a second
 * description of the same table. Only the record workspaces declare keys; the other spec maps
 * (apply, identify, map, xref) carry display strings for columns the mentee never keys by name, so
 * there is nothing to align there.
 *
 * Presentation only. `head` stays the raw keys over the wire because that is the table's identity,
 * and comment anchors are per row, so re-ordering columns changes nothing a mark points at.
 */
export interface WorkspaceColumn {
  key: string;
  label: string;
}

/** `AA-001` + `3` → the register's columns, or null when this step is not a keyed register. */
export function columnsFor(
  taskCode: string | undefined,
  activityCode: string | undefined,
): WorkspaceColumn[] | null {
  if (!taskCode || !activityCode) return null;
  const spec = RECORD_TASKS[`${taskCode.toUpperCase()}/${activityCode}`];
  return spec ? spec.columns.map((c) => ({ key: c.key, label: c.label })) : null;
}

/**
 * A payload key as a heading, for the tables no spec covers.
 *
 * `routedTo` → "Routed to", `data_held` → "Data held". The server humanises field names already
 * but not the keys inside a row object, and it cannot: it would have to send them transformed,
 * and then nothing here could match them back to a spec.
 */
export function humaniseKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return key;
  // An all-caps run is an acronym and keeps its case: lowercasing everything turned a key like
  // ISO27001Ref into "Iso27001 ref", which is worse than the raw key it was meant to improve.
  const cased = (w: string, first: boolean) =>
    /^[A-Z0-9]{2,}$/.test(w)
      ? w
      : first
        ? w[0].toUpperCase() + w.slice(1).toLowerCase()
        : w.toLowerCase();
  return words.map((w, i) => cased(w, i === 0)).join(" ");
}

/**
 * Line a table's columns up with the form the mentee filled in.
 *
 * Spec columns first, in the form's order; then anything the payload holds that the spec does not
 * mention, so a key added to a workspace since — or one the spec never had — is still shown rather
 * than silently dropped. A column the spec names but this submission never filled is dropped, so a
 * reviewer is not given four empty columns to scan past.
 */
export function alignColumns(
  head: string[],
  rows: string[][],
  spec: WorkspaceColumn[] | null,
): { head: string[]; rows: string[][]; reordered: boolean } {
  const label = (k: string) => spec?.find((c) => c.key === k)?.label ?? humaniseKey(k);
  if (!spec) {
    return { head: head.map(label), rows, reordered: false };
  }

  const known = spec.filter((c) => head.includes(c.key)).map((c) => c.key);
  const extra = head.filter((k) => !spec.some((c) => c.key === k));
  const order = [...known, ...extra];
  const reordered = order.some((k, i) => head[i] !== k);
  if (!reordered) return { head: head.map(label), rows, reordered: false };

  const at = order.map((k) => head.indexOf(k));
  return {
    head: order.map(label),
    rows: rows.map((r) => at.map((i) => r[i] ?? "")),
    reordered: true,
  };
}

/**
 * What to call a row once the columns are in the form's order.
 *
 * The server names a row by its first cell, which is right until the first column turns out to be
 * a conditional one — on BCRP-002/8 that is "Cost / Disruption", left blank on three rows out of
 * four, so the reviewer saw three rows called "" and one called by a 900-character paragraph. The
 * first cell that has something in it is the row's name, and it is truncated because a row label
 * is a handle, not the content.
 */
export function rowLabel(row: string[], index: number): string {
  const first = row.find((c) => c && c.trim());
  if (!first) return `Row ${index + 1}`;
  const text = first.trim().replace(/\s+/g, " ");
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}
