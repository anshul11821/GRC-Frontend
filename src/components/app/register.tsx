"use client";

import type { ReactNode } from "react";

/**
 * The register (form 08) — look it up · do not read it end to end. See docs/FORM_LANGUAGE.md.
 *
 * A source folio with a dense interior: the same ochre tab, because the contents are the
 * organisation's own records and ochre means "this is theirs, interrogate it". Mono and tight,
 * because nobody reads a register — they find a row in it.
 *
 * Exact tokens: ground `#fbf0e1` · edge `#e2c49a` · tab + headings `#9a5216` · body `#4e5a6b`.
 *
 * **A register never appears on stage.** It is reference you consult while doing something else,
 * so it may not be the elevated object on a screen — see law 2.
 */
export function Register({
  tab,
  meta,
  children,
  className = "",
}: {
  /** The filing tab, e.g. "Org context". Always says whose records these are. */
  tab: string;
  /** Scope line, e.g. "2 of 214 rows · filtered to this task". A register states what it is showing. */
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative mt-[22px] rounded-[0_8px_8px_8px] border border-[#e2c49a] bg-[#fbf0e1] px-4 py-3 ${className}`}
    >
      <span className="absolute -top-[21px] -left-px flex h-[21px] items-center rounded-t-md border border-b-0 border-[#e2c49a] bg-[#fbf0e1] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9a5216]">
        {tab}
      </span>
      {children}
      {meta && (
        <span className="mt-2 block font-mono text-[10px] tracking-[0.06em] text-[#9a5216]">{meta}</span>
      )}
    </section>
  );
}

/**
 * A row of the register. Mono, tabular, hairline-dotted — a line in a ledger, not a card.
 * `label` is the lookup key; `children` is what you came to find.
 */
export function RegisterRow({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_1fr] items-baseline gap-3 border-b border-dotted border-[#e2c49a] py-[5px] last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#9a5216]">{label}</span>
      <span className="min-w-0 text-[12px] leading-snug tracking-tight text-[#4e5a6b]" style={{ textWrap: "pretty" }}>
        {children}
      </span>
    </div>
  );
}
