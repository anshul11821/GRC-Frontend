/**
 * The desktop zoom factor the app is painted at (see the density block in `globals.css`).
 *
 * CSS `zoom` shrinks what is painted but not what is measured: `getBoundingClientRect`,
 * `clientX` and `window.innerWidth` all stay in unzoomed viewport pixels, while a pixel written
 * into a style is drawn zoomed. So any number that comes off the viewport and then becomes a
 * style value has to be divided by this first, or it lands 10% short of the thing it was measured
 * from — a spotlight beside its target, a window that trails the cursor.
 *
 * Read from the computed style rather than hardcoded, so the factor lives in one place and a
 * browser that ignores `zoom` (or a viewport under `lg`, where nothing is scaled) gets 1.
 */
export function appZoom(): number {
  if (typeof document === "undefined") return 1;
  return Number(getComputedStyle(document.documentElement).zoom) || 1;
}
