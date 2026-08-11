// Credential medal artwork, transcribed from the "Achievement Badges" mockup:
// scalloped brand-orange edge, gold ring, navy field, GRC MENTOR top arc, credential
// name on the bottom arc, and an HTML overlay (cqw-sized) for rank / family / level.
import { bandFor, type BadgeDef } from "@/lib/badges";

/** Scalloped outer edge — 20 lobes on a r=180 circle. */
const SCALLOP =
  "M 200.0 20.0A18.2 18.2 0 0 1 231.3 22.7A18.2 18.2 0 0 1 261.6 30.9A18.2 18.2 0 0 1 290.0 44.1A18.2 18.2 0 0 1 315.7 62.1A18.2 18.2 0 0 1 337.9 84.3A18.2 18.2 0 0 1 355.9 110.0A18.2 18.2 0 0 1 369.1 138.4A18.2 18.2 0 0 1 377.3 168.7A18.2 18.2 0 0 1 380.0 200.0A18.2 18.2 0 0 1 377.3 231.3A18.2 18.2 0 0 1 369.1 261.6A18.2 18.2 0 0 1 355.9 290.0A18.2 18.2 0 0 1 337.9 315.7A18.2 18.2 0 0 1 315.7 337.9A18.2 18.2 0 0 1 290.0 355.9A18.2 18.2 0 0 1 261.6 369.1A18.2 18.2 0 0 1 231.3 377.3A18.2 18.2 0 0 1 200.0 380.0A18.2 18.2 0 0 1 168.7 377.3A18.2 18.2 0 0 1 138.4 369.1A18.2 18.2 0 0 1 110.0 355.9A18.2 18.2 0 0 1 84.3 337.9A18.2 18.2 0 0 1 62.1 315.7A18.2 18.2 0 0 1 44.1 290.0A18.2 18.2 0 0 1 30.9 261.6A18.2 18.2 0 0 1 22.7 231.3A18.2 18.2 0 0 1 20.0 200.0A18.2 18.2 0 0 1 22.7 168.7A18.2 18.2 0 0 1 30.9 138.4A18.2 18.2 0 0 1 44.1 110.0A18.2 18.2 0 0 1 62.1 84.3A18.2 18.2 0 0 1 84.3 62.1A18.2 18.2 0 0 1 110.0 44.1A18.2 18.2 0 0 1 138.4 30.9A18.2 18.2 0 0 1 168.7 22.7A18.2 18.2 0 0 1 200.0 20.0Z";

export type MedalState = "earned" | "in-progress" | "locked";

// Unearned badges keep the artwork but drain the colour — the card's chip and bar carry the detail.
const DIM: Record<MedalState, string> = {
  earned: "",
  "in-progress": "grayscale-[0.7] opacity-70",
  locked: "grayscale opacity-40",
};

export function BadgeMedal({
  badge,
  state = "earned",
  className = "",
}: {
  badge: BadgeDef;
  state?: MedalState;
  className?: string;
}) {
  const { rank, field, gold, muted } = bandFor(badge.level);
  const arcTop = `medal-top-${badge.id}`;
  const arcBot = `medal-bot-${badge.id}`;
  const level = `LEVEL ${String(badge.level).padStart(2, "0")}`;

  return (
    <div
      className={`relative aspect-square transition-all duration-300 ${DIM[state]} ${className}`}
      style={{ containerType: "inline-size" }}
    >
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full block" aria-hidden>
        <path id={arcTop} d="M 62 200 A 138 138 0 0 1 338 200" fill="none" />
        <path id={arcBot} d="M 66 200 A 134 134 0 0 0 334 200" fill="none" />

        <path d={SCALLOP} fill="#C83200" />
        <circle cx="200" cy="200" r="174" fill={gold} />
        <circle cx="200" cy="200" r="167" fill={field} />
        <circle cx="200" cy="200" r="152" fill="none" stroke={gold} strokeWidth="1" opacity="0.4" />
        <circle cx="200" cy="130" r="118" fill="#ffffff" opacity="0.06" />

        <text fontSize="17" fontWeight="600" letterSpacing="4" fill={gold}>
          <textPath href={`#${arcTop}`} startOffset="50%" textAnchor="middle">GRC MENTOR</textPath>
        </text>
        <text fontSize="13" fontWeight="600" letterSpacing="1.6" fill={gold}>
          <textPath href={`#${arcBot}`} startOffset="50%" textAnchor="middle">{badge.name.toUpperCase()}</textPath>
        </text>

        <g transform="translate(200 112)">
          <path d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill={gold} />
          <path d="M 0 -12 L 8.5 -8.5 L 12 0 L 8.5 8.5 L 0 12 L -8.5 8.5 L -12 0 L -8.5 -8.5 Z" fill={field} opacity="0.45" />
        </g>
        <line x1="152" y1="164" x2="248" y2="164" stroke={gold} strokeWidth="1" opacity="0.5" />
      </svg>

      <div
        className="absolute inset-x-0 text-center font-mono font-medium"
        style={{ top: "34.5%", fontSize: "3.1cqw", letterSpacing: "0.75cqw", textIndent: "0.75cqw", color: muted }}
      >
        {rank}
      </div>
      <div
        className="absolute flex items-center justify-center text-center font-semibold uppercase text-white"
        style={{ left: "14%", right: "14%", top: "43%", bottom: "34%", fontSize: "6.1cqw", lineHeight: 1.2, letterSpacing: "0.28cqw", textWrap: "balance" }}
      >
        {badge.family}
      </div>
      <div className="absolute inset-x-0 flex justify-center" style={{ top: "67%" }}>
        <div
          className="rounded-full font-mono font-semibold text-center"
          style={{ padding: "1.6cqw 4cqw", background: gold, color: field, fontSize: "3cqw", letterSpacing: "0.5cqw", textIndent: "0.5cqw" }}
        >
          {level}
        </div>
      </div>
    </div>
  );
}
