/**
 * Pre-launch switch. With NEXT_PUBLIC_WAITLIST_MODE=1 the site serves only the landing page
 * and /waitlist — every other route redirects (see ../proxy.ts) and the landing CTAs point at
 * the waitlist instead of signup. Unset it and the full app comes back; nothing else changes.
 */
export const WAITLIST_MODE = process.env.NEXT_PUBLIC_WAITLIST_MODE === "1";
