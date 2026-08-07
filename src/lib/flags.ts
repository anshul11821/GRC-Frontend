/**
 * Pre-launch switch. With NEXT_PUBLIC_WAITLIST_MODE=1 the site serves only the landing page
 * and /waitlist — every other route redirects (see ../proxy.ts) and the landing CTAs point at
 * the waitlist instead of signup. Unset it and the full app comes back; nothing else changes.
 */
export const WAITLIST_MODE = process.env.NEXT_PUBLIC_WAITLIST_MODE === "1";

/**
 * "Sign in with LinkedIn" verification on the waitlist / reviewer forms. Set to "1" ONLY once the
 * backend LinkedIn env vars are configured — otherwise the button appears but /waitlist/linkedin/start
 * 404s. See src/lib/linkedin-verify.ts.
 */
export const LINKEDIN_ENABLED = process.env.NEXT_PUBLIC_LINKEDIN_ENABLED === "1";
