/**
 * The plaque (form 01) — the one form in the system that quotes. See docs/FORM_LANGUAGE.md.
 *
 * Lives here rather than beside either caller because it has two: the Control references panel on
 * the task brief, and the RUA gate's control-reference documents. The form language says a form is
 * reused, never copied — two implementations of one silhouette drift silently, and a drifted
 * plaque is worse than none, because the whole point of the shape is that it means one thing.
 *
 * Props are deliberately narrow strings rather than the `Control` type from lib/controls: the RUA
 * references are a different shape entirely (parsed out of a document body), and coupling the form
 * to one caller's data model is what would force the second caller to copy it.
 *
 * Exact tokens, no near neighbours:
 *   ground #e8ecf7 · edge #b9c4e0 · rail + clause #1f3564 · quotation #131c28
 *   explanation #4e5a6b · meta #7d899a · steel label #0b6e99
 *
 * The 5px hatched rail hangs off the left edge and is the load-bearing cue: it is what identifies
 * the plaque against any ground, including the RUA gate's coloured sticky-note windows, where the
 * pale tint alone would not separate the object from the panel behind it.
 */
export function Plaque({
  standard,
  reference,
  quotation,
  explanation,
  verbatim = false,
  domain,
}: {
  /** e.g. "ISO/IEC 27001:2022". Rendered in the mono clause line beside the reference. */
  standard?: string;
  /** e.g. "Annex A 5.9". */
  reference: string;
  /** The standard's own words — the clause where licensed, otherwise the published control title. */
  quotation: string;
  /** OUR plain-terms account of what the control asks for. Never the standard's wording. */
  explanation?: string;
  /** True only when `quotation` is licensed clause text copied verbatim from the source. */
  verbatim?: boolean;
  /** Optional footer, e.g. the Annex A theme. */
  domain?: string;
}) {
  return (
    <div className="relative ml-[5px] border border-[#b9c4e0] bg-[#e8ecf7] px-5 py-4">
      <span
        aria-hidden
        className="absolute -left-[5px] -top-px -bottom-px w-[5px] [background:repeating-linear-gradient(180deg,#1f3564_0_3px,transparent_3px_6px),#1f3564]"
      />
      <span className="block font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[#1f3564]">
        {standard ? `${standard} · ${reference}` : reference}
      </span>
      <q className="mt-1.5 block font-serif text-[14.5px] leading-[1.55] text-[#131c28]">{quotation}</q>
      <span className="mt-2 block font-mono text-[10px] tracking-[0.06em] text-[#7d899a]">
        {verbatim
          ? "Verbatim · retrieved from control library · not editable"
          : "Control title as published · not the clause text"}
      </span>

      {/* Ours. Behind a rule and under its own label — the two captions are the only thing keeping
          the standard's words and ours apart inside one card. Do not remove them to tidy up. */}
      {explanation && (
        <div className="mt-3.5 pt-3.5 border-t border-[#b9c4e0]">
          <span className="block font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#0b6e99] mb-1">
            What it asks for · in plain terms
          </span>
          <p className="m-0 text-[13px] leading-relaxed tracking-tight text-[#4e5a6b]" style={{ textWrap: "pretty" }}>
            {explanation}
          </p>
        </div>
      )}

      {domain && (
        <span className="mt-3 block font-mono text-[9.5px] uppercase tracking-[0.07em] text-[#7d899a]">
          {domain}
        </span>
      )}
    </div>
  );
}
