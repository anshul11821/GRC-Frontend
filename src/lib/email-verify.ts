"use client";

/**
 * Email OTP verification for the waitlist / reviewer forms. Two calls: request a code, then
 * verify it for a short-lived email token the final submit sends as proof. Stateless on the
 * backend — the challenge token round-trips through this hook.
 */
import { useState } from "react";

import { api } from "@/lib/api";
import { getCaptchaToken } from "@/lib/recaptcha";

export function useEmailVerify() {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verified = !!token;
  const sent = !!challenge && !token;

  const sendCode = async (email: string) => {
    setBusy(true);
    setError(null);
    try {
      const captchaToken = await getCaptchaToken("waitlist_email");
      const res = await api.post<{ challengeToken: string }>(
        "/waitlist/email/request",
        { email, captchaToken },
        { noAuth: true, noRefresh: true },
      );
      setChallenge(res.challengeToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (email: string, otp: string) => {
    if (!challenge) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ emailToken: string }>(
        "/waitlist/email/verify",
        { email, otp, challengeToken: challenge },
        { noAuth: true, noRefresh: true },
      );
      setToken(res.emailToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Try again.");
    } finally {
      setBusy(false);
    }
  };

  // Editing the email after verifying invalidates the proof — start over.
  const reset = () => {
    setChallenge(null);
    setToken(null);
    setError(null);
  };

  return { verified, sent, busy, error, token, sendCode, verifyCode, reset };
}
