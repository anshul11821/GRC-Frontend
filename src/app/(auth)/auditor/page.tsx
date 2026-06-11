"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi, passwordRules } from "@/lib/auth";
import { catalog, type Standard } from "@/lib/catalog";
import { setAccessToken } from "@/lib/token";
import { getCaptchaToken } from "@/lib/recaptcha";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";

type Step = "intro" | "account" | "verify" | "application";

const DISCIPLINES = [
  { id: "iso", label: "ISO Auditor" },
  { id: "internal", label: "Internal Auditor" },
  { id: "grc", label: "GRC Auditor" },
  { id: "soc", label: "SOC Auditor" },
  { id: "privacy", label: "Privacy Auditor" },
  { id: "risk", label: "Risk Auditor" },
  { id: "other", label: "Other" },
];

export default function AuditorOnboardingPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const rules = passwordRules(password);
  const passOk = rules.every((r) => r.ok);
  const match = password.length > 0 && password === confirm;

  // verify
  const [otp, setOtp] = useState("");

  // application
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [discipline, setDiscipline] = useState("iso");
  const [firm, setFirm] = useState("");
  const [years, setYears] = useState("");
  const [certs, setCerts] = useState("");
  const [bio, setBio] = useState("");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => { catalog.standards().then(setStandards).catch(() => {}); }, []);

  // Resume: an already-signed-in auditor skips to the right place.
  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "auditor" && user.isProfileComplete) router.replace("/audit");
    else if (user.role === "auditor") setStep("application");
  }, [loading, user, router]);

  const run = async (fn: () => Promise<void>) => {
    setError(null); setBusy(true);
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); } finally { setBusy(false); }
  };

  const submitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOk || !match) return;
    run(async () => {
      const captchaToken = await getCaptchaToken("auditor_signup_start");
      await authApi.auditorSignupStart({ email, password, captchaToken });
      setStep("verify");
    });
  };

  const submitVerify = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { accessToken } = await authApi.signupVerifyEmail({ email, otp });
      setAccessToken(accessToken);
      setStep("application");
    });
  };

  const toggleStd = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) { setError("Select at least one standard you can audit."); return; }
    run(async () => {
      await authApi.auditorApplication({
        firstName, lastName, discipline, firm: firm || null,
        yearsExperience: years ? Number(years) : null,
        certifications: certs.split(",").map((c) => c.trim()).filter(Boolean),
        bio: bio || null, assignedStandards: selected,
      });
      // refresh the session user (role + profile-complete) then enter the console
      await signIn((await authApi.refresh()).accessToken, true).catch(() => {});
      router.replace("/audit");
    });
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      {step !== "intro" && <StepDots step={step} />}

      {error && (
        <div className="mb-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">{error}</div>
      )}

      {step === "intro" && (
        <>
          <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md bg-slate-900 text-white text-[10.5px] font-semibold tracking-wide">
            <Icon name="shield" size={12} /> AUDITOR PROGRAMME
          </span>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 mt-3">Become a grcmentor auditor</h1>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Independently assess mentees&apos; completed engagements against the standards you specialise in.
            You review the compiled deliverable, leave findings and a rubric score, and decide whether it clears —
            feeding the mentee&apos;s CV and certificate.
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Applications are auto-approved — start reviewing right away.",
              "Work is routed to you by the standards you select.",
              "Open findings block a certificate until the mentee reworks them.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mt-0.5 shrink-0"><Icon name="check" size={10} strokeWidth={2.5} /></span>
                {t}
              </li>
            ))}
          </ul>
          <PrimaryBtn onClick={() => setStep("account")} className="w-full mt-6">Apply as an auditor</PrimaryBtn>
          <p className="mt-4 text-center text-[12.5px] text-slate-500">
            Already an auditor? <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">Sign in</Link>
          </p>
        </>
      )}

      {step === "account" && (
        <>
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Create your auditor account</h1>
          <p className="text-[13px] text-slate-500 mt-1">We&apos;ll email a code to verify it.</p>
          <form onSubmit={submitAccount} className="mt-5 space-y-4">
            <Field label="Work email">
              <TextInput icon="mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@firm.com" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <TextInput icon="lock" type={show ? "text" : "password"} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Icon name="eye" size={16} /></button>
              </div>
            </Field>
            <ul className="grid grid-cols-2 gap-1.5">
              {rules.map((r) => (
                <li key={r.label} className="flex items-center gap-1.5 text-[11.5px]">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"}`}><Icon name="check" size={10} strokeWidth={2.5} /></span>
                  <span className={r.ok ? "text-slate-600" : "text-slate-400"}>{r.label}</span>
                </li>
              ))}
            </ul>
            <Field label="Confirm password">
              <TextInput icon="lock" type={show ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" />
              {confirm.length > 0 && !match && <span className="mt-1.5 block text-[11.5px] text-rose-600">Passwords don&apos;t match</span>}
            </Field>
            <PrimaryBtn type="submit" disabled={busy || !passOk || !match} className="w-full">{busy ? "Sending code…" : "Continue"}</PrimaryBtn>
          </form>
        </>
      )}

      {step === "verify" && (
        <>
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Verify your email</h1>
          <p className="text-[13px] text-slate-500 mt-1">We sent a code to <span className="font-medium text-slate-700">{email}</span>.</p>
          <form onSubmit={submitVerify} className="mt-5 space-y-4">
            <Field label="Verification code">
              <TextInput inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
            </Field>
            <PrimaryBtn type="submit" disabled={busy} className="w-full">{busy ? "Verifying…" : "Verify & continue"}</PrimaryBtn>
          </form>
        </>
      )}

      {step === "application" && (
        <>
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Your auditor profile</h1>
          <p className="text-[13px] text-slate-500 mt-1">Auto-approved — experience and certifications are self-declared.</p>
          <form onSubmit={submitApplication} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name"><TextInput required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Dana" /></Field>
              <Field label="Last name"><TextInput required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Reyes" /></Field>
            </div>
            <Field label="Discipline">
              <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 text-[13.5px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
                {DISCIPLINES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Firm (optional)"><TextInput value={firm} onChange={(e) => setFirm(e.target.value)} placeholder="Acme Assurance" /></Field>
              <Field label="Years of experience"><TextInput type="number" min={0} max={70} value={years} onChange={(e) => setYears(e.target.value)} placeholder="8" /></Field>
            </div>
            <Field label="Certifications (comma-separated)">
              <TextInput value={certs} onChange={(e) => setCerts(e.target.value)} placeholder="ISO 27001 LA, CISA" />
            </Field>
            <Field label="Standards you can audit">
              <div className="flex flex-wrap gap-2 mt-1">
                {standards.map((s) => {
                  const on = selected.includes(s.id);
                  return (
                    <button type="button" key={s.id} onClick={() => toggleStd(s.id)}
                      className={`px-3 h-9 rounded-lg text-[12.5px] font-medium tracking-tight ring-1 transition-all inline-flex items-center gap-1.5 ${on ? "bg-indigo-600 text-white ring-transparent" : "bg-white text-slate-600 ring-slate-200/80 hover:ring-slate-300"}`}>
                      {on && <Icon name="check" size={13} strokeWidth={2.5} />}{s.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Short bio (optional)">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={800}
                className="w-full px-3 py-2 rounded-lg bg-white ring-1 ring-slate-200/80 text-[13px] text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                placeholder="A line on your background as an auditor." />
            </Field>
            <PrimaryBtn type="submit" disabled={busy || selected.length === 0} className="w-full">{busy ? "Submitting…" : "Submit application"}</PrimaryBtn>
          </form>
        </>
      )}
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["account", "verify", "application"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {steps.map((s, i) => <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-indigo-500" : "bg-slate-200"}`} />)}
    </div>
  );
}
