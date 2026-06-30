import type { ReactNode } from "react";
import { LRN_AVATAR } from "@/lib/tones";

/**
 * Bespoke per-org logomarks. White line-art glyphs (same aesthetic as ui/icon.tsx) sized to a
 * 0 0 24 24 viewBox, chosen to read as each fictional company's brand mark. Keyed by org id;
 * unknown ids fall back to the initials avatar.
 */
const MARKS: Record<string, ReactNode> = {
  // CloudTech — Technology & IT Services: cloud + circuit node.
  cloudtech: (
    <>
      <path d="M7.5 17.5a3.6 3.6 0 0 1-.4-7.18A4.8 4.8 0 0 1 16.6 9.4a3.3 3.3 0 0 1-.1 8.1H7.5z" />
      <circle cx="11.8" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <path d="M11.8 13l2.4-1.4M11.8 13l-2.3-1" />
    </>
  ),
  // LearnTech — Education: mortarboard.
  learntech: (
    <>
      <path d="M12 5l9 3.8-9 3.8-9-3.8 9-3.8z" />
      <path d="M6.5 10.6V15c0 1.3 2.5 2.3 5.5 2.3s5.5-1 5.5-2.3v-4.4" />
      <path d="M21 8.8v4.2" />
    </>
  ),
  // GlobalConnect — BPO / customer ops: globe + connection nodes.
  globalconnect: (
    <>
      <circle cx="11.5" cy="12.5" r="6.2" />
      <path d="M5.3 12.5h12.4" />
      <path d="M11.5 6.3c2.6 2.7 2.6 9.7 0 12.4M11.5 6.3c-2.6 2.7-2.6 9.7 0 12.4" />
      <circle cx="19.5" cy="5.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Strategic Advisory — consulting: compass.
  strategic: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M15.2 8.8l-2.2 5.4L8.8 16l2.2-5.4 4.2-1.8z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.6" fill="#fff" stroke="none" />
    </>
  ),
  // Meridian Bank — finance: portico / columns.
  meridian: (
    <>
      <path d="M4 9.5l8-4.5 8 4.5" />
      <path d="M5.5 9.5v7.5M9.8 9.5v7.5M14.2 9.5v7.5M18.5 9.5v7.5" />
      <path d="M3.5 19.5h17" />
    </>
  ),
  // Caregrid Health — healthcare: rounded cross.
  caregrid: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </>
  ),
  // NorthPeak Cloud — SaaS: twin mountain peaks.
  northpeak: (
    <>
      <path d="M2.5 19h19L14.5 7l-3 4.8L9 9 2.5 19z" />
      <path d="M11.5 11.8l1.6 2.6" />
    </>
  ),
  // Atlas Industrial — manufacturing: gear.
  atlas: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" />
    </>
  ),
};

export interface OrgLogoProps {
  org: { id: string; initials: string; tone: string; status?: string };
  /** Box classes — size + rounding (e.g. "w-11 h-11 rounded-xl"). */
  className?: string;
  /** Glyph size in px. */
  iconSize?: number;
}

export function OrgLogo({ org, className = "w-11 h-11 rounded-xl", iconSize = 22 }: OrgLogoProps) {
  const locked = org.status === "locked";
  const mark = MARKS[org.id];
  return (
    <div
      className={`bg-gradient-to-br ${LRN_AVATAR[org.tone] ?? LRN_AVATAR.indigo} flex items-center justify-center text-white font-semibold shrink-0 ${locked ? "opacity-50 grayscale" : ""} ${className}`}
    >
      {mark ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.85}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {mark}
        </svg>
      ) : (
        org.initials
      )}
    </div>
  );
}
