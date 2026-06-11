# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** grcmentor
**Generated:** 2026-06-07 (skill) · **Reconciled to real brand:** 2026-06-07
**Category:** GRC / Compliance Education SaaS — style archetype: *Trust & Authority*

> ⚠️ The skill's auto-generated palette/typography (Legal-Services blue + orange, Plus Jakarta
> Sans) did **not** match the shipped product. The values below are the **actual** grcmentor brand,
> derived from `src/app/globals.css`, `primitives.tsx`, and the landing/app surfaces. Use these.

---

## Global Rules

### Color Palette (actual brand)

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Primary | `#6366F1` | `indigo-500` | Brand, rings, active nav, progress |
| Primary (strong) | `#4F46E5` | `indigo-600` | Buttons, links, gradient start |
| Accent | `#7C3AED` | `violet-600` | Gradient end (hero/CTA/tracks) |
| Success / CTA-positive | `#10B981` | `emerald-500` | "Complete", live dot, positive stats |
| Warning | `#F59E0B` | `amber-500` | Badges, scores |
| Danger | `#E11D48` | `rose-600` | Sign-out, destructive |
| Background (canvas) | `#FAFAF7` | — | App + landing canvas (**light-only**) |
| Surface | `#FFFFFF` | `white` | Cards |
| Text | `#0F172A` | `slate-900` | Headings / body |
| Muted text (min) | `#64748B` | `slate-500` | Smallest readable meta (≥4.5:1). **Do not use slate-400 for text.** |
| Hairline | `rgba(slate-200,0.7)` | `ring-slate-200/70` | Card/border ring |

**Brand gradient (signature — keep):** `linear-gradient(135deg, #4f46e5 0%, #5b53e8 45%, #7c3aed 100%)`
— used on hero, CTA, track cards. The skill's "AI purple/pink gradient" anti-pattern is **waived**
for these brand surfaces by explicit decision.

### Typography (actual)

- **Sans:** Geist Sans (`--font-geist-sans`) — headings + body
- **Mono:** Geist Mono (`--font-geist-mono`) — task/step codes, badges
- **Mood:** modern, clean, professional, SaaS
- Note: the skill suggested Plus Jakarta Sans; Geist is the shipped choice and is being kept.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

> The CSS blocks below are the skill's **generic** illustrations and still reference the old
> orange/blue palette — treat them as structural hints only. The **real** components are the
> Tailwind primitives in `src/components/ui/primitives.tsx` (`Card`, `Bar`, `Ring`, `SectionHead`)
> and inline button styles using the indigo brand above. Reuse those, not this CSS.

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #F97316;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #2563EB;
  border: 2px solid #2563EB;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #2563EB;
  outline: none;
  box-shadow: 0 0 0 3px #2563EB20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Trust & Authority

**Keywords:** Certificates/badges displayed, expert credentials, case studies with metrics, before/after comparisons, industry recognition, security badges

**Best For:** Healthcare/medical landing pages, financial services, enterprise software, premium/luxury products, legal services

**Key Effects:** Badge hover effects, metric pulse animations, certificate carousel, smooth stat reveal

### Page Pattern

**Pattern Name:** Hero + Testimonials + CTA

- **Conversion Strategy:** Social proof before CTA. Use 3-5 testimonials. Include photo + name + role. CTA after social proof.
- **CTA Placement:** Hero (sticky) + Post-testimonials
- **Section Order:** 1. Hero, 2. Problem statement, 3. Solution overview, 4. Testimonials carousel, 5. CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Outdated design
- ❌ Hidden credentials
- ❌ AI purple/pink gradients

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
