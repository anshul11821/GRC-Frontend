# grcmentor UI Audit — Phase 0

Generated 2026-06-07 with the **ui-ux-pro-max** skill (accessibility / UX / web / nextjs domains)
cross-referenced against the actual `web/src` codebase. Severity uses the skill's scale.
Each finding notes the **phase** of the improvement plan that addresses it.

> Locked constraints honored throughout: **light-only** surface, **keep existing primitives**
> (`Card`/`Bar`/`Ring`/`SectionHead`), **keep indigo→violet brand gradients** (user decision —
> the skill's "AI gradient" anti-pattern is intentionally waived for brand surfaces).

---

## Summary

| # | Finding | Severity | Phase | Status |
|---|---------|----------|-------|--------|
| 1 | Missing `focus-visible` rings on primary interactive surfaces | **Critical** | 1 | ✅ done |
| 2 | `MASTER.md` palette/font did not match the real brand (reconciled) | High | 0 | ✅ done |
| 3 | No design-token layer — brand gradient/shadows/rings hardcoded & repeated | High | 1 | ◻ started (gradient/shadow/focus tokens) |
| 4 | App shell has no mobile drawer; desktop-only `h-screen w-screen flex` | High | 2 | ✅ done |
| 5 | A few icon-only buttons lack `aria-label` | High | 1 | ✅ done |
| 6 | `text-slate-400` used for small meta text (~2.8:1, fails 4.5:1) | Medium | 1/4 | ◻ mostly (dashboard, landing, jobs, reports done; calendar/career/settings/cv/certificate/learnings/desk pending) |
| 7 | No skip-to-content link; no `aria-live` on async updates | Medium | 1/2 | ◻ pending |
| 8 | `<img>` for remote/brand images instead of `next/image` | Medium | 4 | ✗ accepted/deferred (remote CDN already query-param-sized; `next/image` needs `remotePatterns` + the Next 16 doc caveat in AGENTS.md; low value) |
| 9 | Lone arbitrary `z-[60]`; no formal z-index scale | Low | 1 | ◻ deferred (deliberate) |

**Follow-up (new, found during Phase 2):** the desk's *inner* sidebar (`desk-sidebar.tsx`, the
activity tree) is a separate nested panel that's also desktop-oriented and not covered by the new
app-shell drawer. Candidate for a Phase 2.1 or a later desk-focused pass.

**Already good (no action):** `prefers-reduced-motion` is respected everywhere
(`motion.tsx`, dashboard `CountUp`/`RubricRadar`); skeleton loading states exist
(`skeleton.tsx`, dashboard); semantic `<button>`/`<Link>` used (not `div role=button`);
most icon buttons already labelled (`app-shell` menu, `notification-bell`, `desk-sidebar`).

---

## Findings (detail)

### 1. Focus states — **Critical**
The skill rates visible `:focus-visible` indicators *Critical*. Only 5 files reference
`focus`/`outline` at all (`schema-form`, `forms`, `calendar`, `jobs`, `reports`). The most-used
interactive surfaces have **no focus ring**, relying on the browser default which is easy to miss
on these light surfaces:
- [app-shell.tsx](src/components/app/app-shell.tsx) — sidebar nav `<Link>`s, sidebar collapse button (L28), user-menu button (L102), sign-out (L139)
- [floating-mentor.tsx:37](src/components/app/floating-mentor.tsx#L37) — FAB toggle
- [primitives.tsx](src/components/ui/primitives.tsx) — `Logo` link
- [page.tsx](src/app/page.tsx) — landing nav links, hero CTAs
- **Fix (Phase 1):** add a shared `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` utility and apply to interactive primitives.

### 2. MASTER.md mismatch — High (resolved in Phase 0)
The skill's generated `design-system/grcmentor/MASTER.md` guessed *Legal Services / Trust blue
`#2563EB` + orange CTA `#F97316` / Plus Jakarta Sans*. The real brand is **indigo `#6366F1` →
violet `#7C3AED`**, canvas **`#FAFAF7`**, **Geist** font. MASTER.md has been **reconciled** to the
real tokens so it's usable as the source of truth in later phases.

### 3. No design-token layer — High
[globals.css](src/app/globals.css) defines only `--background`/`--foreground`. The brand gradient
`linear-gradient(135deg,#4f46e5…#7c3aed)`, card shadows, and `ring-slate-200/70` are hardcoded and
repeated across `page.tsx`, `app/page.tsx`, `primitives.tsx`, etc. Centralize as Tailwind v4
`@theme` tokens so surfaces stay consistent. **(Phase 1)**

### 4. Mobile app shell — High
[app-shell.tsx:174](src/components/app/app-shell.tsx#L174) is `h-screen w-screen flex`; the sidebar
only collapses to 68px and never becomes an off-canvas drawer, so at 375px the rail + content is
cramped and there's no hamburger entry point. **(Phase 2)**

### 5. Icon-only buttons missing labels — High
- [floating-mentor.tsx:37](src/components/app/floating-mentor.tsx#L37) — FAB, icon-only, no `aria-label`
- [app-shell.tsx:102](src/components/app/app-shell.tsx#L102) — user-menu trigger is icon-only below `lg` (name is `hidden lg:block`)
- [schema-form.tsx:82](src/components/app/schema-form.tsx#L82), [:122](src/components/app/schema-form.tsx#L122) — remove-row `×` buttons
- **Fix (Phase 1):** add descriptive `aria-label`s.

### 6. Low-contrast meta text — Medium
`text-slate-400` (#94A3B8 ≈ 2.8:1 on white) is used for small labels (dashboard stat sublabels,
footer copyright, org meta). Below the 4.5:1 floor. Bump the smallest *informational* text to
`text-slate-500` (#64748B ≈ 4.6:1); purely decorative text can stay. **(Phase 1)**

### 7. Skip link & aria-live — Medium
No skip-to-content link on the nav-heavy landing/app shells; async updates (notifications, mentor
scores becoming available) aren't announced via `aria-live`. **(Phase 1 skip link / Phase 2 live regions)**

### 8. `next/image` — Medium
[page.tsx](src/app/page.tsx) (Unsplash industry tiles) and [primitives.tsx](src/components/ui/primitives.tsx)
(`BrandMark`) use `<img>`. `next/image` would give optimization/lazy-loading; requires
`remotePatterns` for the Unsplash host. Deferred to **Phase 4** (deliberate current choice, low urgency).

### 9. z-index scale — Low
One arbitrary [drawer.tsx:32](src/components/ui/drawer.tsx#L32) `z-[60]`; the rest use 10/20/30/50.
Formalize a small scale token in Phase 1.

---

## Phase 3–4 outcomes (component upgrades + polish)

- **Badge medallion** (`app/badges/page.tsx`) rebuilt into a dimensional achievement medal:
  gradient face + completion ring (reuses `b.pct`) + earned glow + check sub-badge, with
  earned / in-progress / locked states. Hand-built to match the design system (the Magic MCP
  `component_builder` hung on remote generation; `logo_search` works but only covered 1 of 4 job
  sources, so real logos were skipped to avoid inconsistent chips).
- **Charts** (skill `chart` domain): intentionally **not** added. Reports is a register/table
  surface; existing bespoke viz (dashboard radar, rings, progress/match/badge rings) is
  appropriate. Adding a chart lib (e.g. recharts) would be a gratuitous dependency.
- **Contrast (#6)** swept on jobs + reports informational text → `slate-500`.

### Pre-existing issue logged (not introduced by this work)
- `app/reports/page.tsx:207` — `setState` called synchronously in an effect body (ESLint
  "cascading renders"). Surfaced by lint; does **not** fail the production build. A small refactor
  (derive from `programId`, or guard) — out of scope for the UI pass; fix separately if desired.

## Pre-Delivery Checklist (skill, final pass)

- [x] No emojis as icons — SVG/Lucide throughout (`Icon`)
- [x] Consistent icon set — single `Icon` component
- [x] `cursor-pointer` / semantic `<button>`/`<a>` on interactive elements
- [x] Hover states with smooth 150–300ms transitions
- [x] **Focus states visible** — shared `focus-ring` applied to primary surfaces (#1)
- [x] `prefers-reduced-motion` respected (`motion.tsx`, dashboard, etc.)
- [x] Responsive 375/768/1024/1440 — app shell now has a mobile drawer (#4); pages use responsive grids
- [x] Light-mode text contrast ≥4.5:1 — primary surfaces done; **secondary pages still have `slate-400` micro-labels (#6 remaining)**
- [x] No content hidden behind fixed nav; no horizontal scroll on mobile
- [~] `next/image` — **accepted exception** (#8): remote CDN images kept as `<img>`
- [ ] `aria-live` on async updates + skip-to-content link (#7) — **pending**

## Remaining (optional follow-ups)
- #6 contrast on secondary pages (calendar/career/settings/cv/certificate/learnings/desk)
- #7 skip-link + `aria-live` regions
- Desk inner sidebar (`desk-sidebar.tsx`) mobile treatment
- Pre-existing `reports/page.tsx:207` effect refactor
