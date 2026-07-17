/**
 * A single, calm spinner for full-page / single-document loads (CV, certificate, verify, forms)
 * where a skeleton would fake a document that isn't there yet. For card grids prefer the
 * skeletons in ./skeleton.tsx — those preview real layout. Matches the route-guard spinner.
 */
export function Loader({
  label = "Loading…",
  className = "",
  size = 28,
}: {
  label?: string;
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-20 text-slate-400 ${className}`}>
      <div
        className="rounded-full border-[2.5px] border-slate-200 border-t-indigo-500 animate-spin"
        style={{ width: size, height: size }}
      />
      {label && <span className="text-[12.5px] tracking-tight">{label}</span>}
    </div>
  );
}
