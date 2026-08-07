"use client";

import { cloneElement, Fragment, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { splitTerms, termsIn } from "@/lib/glossary";

/** Elements whose text must stay plain: nesting a <button> inside any of these is invalid HTML. */
const SKIP = new Set(["button", "a", "input", "textarea", "select", "option", "label", "summary", "code"]);

/** Walks the *authored* node tree, glossing string leaves. Host elements and fragments are
 *  transparent (their children are right there); custom components are opaque — their subtree
 *  doesn't exist until React renders it — so they're left alone and gloss themselves if they care. */
function walk(node: ReactNode, seen: Set<string>, prefix: string): ReactNode {
  if (typeof node === "string") return gloss(node, seen, prefix);
  if (Array.isArray(node)) return node.map((n, i) => <Fragment key={i}>{walk(n, seen, `${prefix}-${i}`)}</Fragment>);
  if (!isValidElement(node)) return node;
  const type = node.type;
  if (typeof type === "string" ? SKIP.has(type) : type !== Fragment) return node;
  const el = node as ReactElement<{ children?: ReactNode }>;
  const kids = el.props.children;
  if (kids === undefined || typeof kids === "function") return node;
  return cloneElement(el, undefined, walk(kids, seen, `${prefix}x`));
}

/**
 * Glosses prose. Drop-in wherever a technical term can appear — a bare string
 * (`<Gloss>{content.objective}</Gloss>`) or authored markup (`<Gloss><>Open the <strong>register</strong></></Gloss>`).
 *
 * `seen` is optional and only for callers rendering many strings that read as ONE document (a
 * reference body): pass a shared set so a term is underlined on first appearance only. Omit it and
 * dedupe is per-string, which is what separate cards want.
 */
export function Gloss({ children, seen }: { children: ReactNode; seen?: Set<string> }) {
  const uid = useId();
  if (children === null || children === undefined || children === false) return null;
  return <>{walk(children, seen ?? new Set(), uid)}</>;
}

/**
 * Wraps every defined technical term in `text` with a dotted underline and a definition popover.
 * A plain function, not a component, so the caller owns the `seen` set (first-occurrence-only
 * within one deliverable) and the id prefix — no hooks, no per-term state.
 *
 * ponytail: native `popover` + `popovertarget` do the work — top layer (no clipping inside the
 * scrolling reference panel), light-dismiss, Esc and focus handling all free. No JS, no library.
 *
 * The term/definition pair is tied together by an explicit `anchor-name`. `position-anchor: auto`
 * (the implicit invoker anchor) does NOT resolve here, and an unresolved anchor drops the popover
 * into the viewport's top-left corner — so the name is named, not inferred.
 */
export function gloss(text: string, seen: Set<string>, idPrefix: string): React.ReactNode[] {
  return splitTerms(text, seen).map((part, i) => {
    if (typeof part === "string") return part;
    const id = `${idPrefix}-t${i}`;
    // useId() emits colons/guillemets — illegal in a CSS dashed-ident, so strip to [a-z0-9].
    const anchor = `--gl-${idPrefix.replace(/[^a-zA-Z0-9]/g, "")}-${i}`;
    return (
      <Fragment key={i}>
        {/* display:inline (not the button default inline-block) so a multi-word term can still
            break across lines inside a narrow panel. */}
        <button
          type="button"
          popoverTarget={id}
          aria-label={`Definition of ${part.text}`}
          style={{ anchorName: anchor } as React.CSSProperties}
          className="focus-ring inline cursor-help align-baseline text-left underline decoration-dotted decoration-slate-400 underline-offset-[3px] hover:decoration-indigo-500"
        >
          {part.text}
        </button>
        <span
          popover="auto"
          id={id}
          style={{ positionAnchor: anchor } as React.CSSProperties}
          className="gloss-pop w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-white p-3 text-[12.5px] leading-relaxed tracking-tight text-slate-700 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80"
        >
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">{part.text}</span>
          {part.definition}
        </span>
      </Fragment>
    );
  });
}

/**
 * "Terms used here" — every defined term appearing in `texts`, derived from the same map. Hover is
 * opt-in and unauditable; this list makes the guarantee mechanical: if a term is in the glossary and
 * in the deliverable, it is defined on the page.
 */
export function TermsUsed({ texts, className = "" }: { texts: string[]; className?: string }) {
  const hits = termsIn(texts);
  if (!hits.length) return null;
  return (
    <details className={`group rounded-xl bg-slate-50/70 ring-1 ring-slate-200/70 ${className}`}>
      <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:text-slate-700">
        Terms used here
        <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-semibold tabular-nums tracking-normal text-slate-600">{hits.length}</span>
        <span className="ml-auto text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none">▾</span>
      </summary>
      <dl className="space-y-2 border-t border-slate-200/70 px-3.5 py-3">
        {hits.map((h) => (
          <div key={h.key}>
            <dt className="text-[12px] font-medium tracking-tight text-slate-900">{h.text}</dt>
            <dd className="text-[12px] leading-relaxed tracking-tight text-slate-600" style={{ textWrap: "pretty" }}>{h.definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
