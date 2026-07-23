"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/primitives";
import { Field, TextInput, Select, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { getCaptchaToken } from "@/lib/recaptcha";

// Standalone early-access waitlist. Not linked from anywhere — reachable by /waitlist only.
// One page, two audiences (student / university) sharing a shell and one submit.

type Audience = "student" | "university";

const STAGES = [
  "Student",
  "Career changer",
  "0–2 years in GRC / security",
  "2–5 years in GRC / security",
  "5+ years in GRC / security",
];

const COPY: Record<Audience, { eyebrow: string; title: string; body: string }> = {
  student: {
    eyebrow: "Early access",
    title: "Join the grcmentor waitlist",
    body: "Hands-on GRC engagements, AI-graded, that compile into a CV, badges and a verifiable certificate. We're onboarding in batches — leave your details and we'll be in touch.",
  },
  university: {
    eyebrow: "University partnership programme",
    title: "Give your students the edge of real-world GRC experience.",
    body: "Hands-on governance, risk and compliance mentorship on simulated enterprise engagements — mentor-graded, standards-aligned, and mapped straight to the roles your graduates want.",
  },
};

export default function WaitlistPage() {
  const [audience, setAudience] = useState<Audience>("student");
  const [form, setForm] = useState({
    // student
    name: "",
    stage: "",
    linkedin: "",
    why: "",
    // university
    institution: "",
    contactName: "",
    designation: "",
    // shared
    email: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ alreadyRegistered: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await getCaptchaToken("waitlist_join");
      // Only send the fields this audience actually filled in — the rest stay NULL.
      const res = await api.post<{ alreadyRegistered: boolean }>(
        "/waitlist",
        audience === "university"
          ? {
              audience,
              email: form.email,
              name: form.contactName,
              institution: form.institution,
              designation: form.designation,
              captchaToken,
            }
          : {
              audience,
              email: form.email,
              name: form.name,
              stage: form.stage,
              linkedin: form.linkedin,
              why: form.why,
              captchaToken,
            },
        { noAuth: true, noRefresh: true },
      );
      setDone(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = COPY[audience];
  const firstName = (audience === "university" ? form.contactName : form.name).split(" ")[0];

  return (
    <main className="min-h-screen bg-[#FAFAF7] flex flex-col items-center px-6 py-14">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600">
                <Icon name="check" size={22} strokeWidth={2.5} />
              </div>
              <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
                {done.alreadyRegistered
                  ? "You're already registered"
                  : audience === "university"
                    ? "Thanks — we've got it"
                    : "You're on the list"}
              </h1>
              <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
                {done.alreadyRegistered ? (
                  <>
                    <span className="font-medium text-slate-700">{form.email}</span> is already on our
                    list — no need to submit again. We&apos;ll be in touch.
                  </>
                ) : (
                  <>
                    Thanks{firstName ? `, ${firstName}` : ""}.{" "}
                    {audience === "university" ? "Our partnerships team will reach out to " : "We'll email "}
                    <span className="font-medium text-slate-700">{form.email}</span>
                    {audience === "university"
                      ? " to walk you through the programme."
                      : " the moment early access opens."}
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Audience switch */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 mb-6">
                {(["student", "university"] as Audience[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAudience(a)}
                    aria-pressed={audience === a}
                    className={`flex-1 h-8 rounded-lg text-[12.5px] font-medium tracking-tight transition-colors ${
                      audience === a
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {a === "student" ? "I'm a student" : "I'm a university"}
                  </button>
                ))}
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 ring-1 ring-indigo-100 rounded-full px-2.5 py-1 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {copy.eyebrow}
              </span>
              <h1 className="mt-3 text-[21px] font-semibold tracking-tight text-slate-900 leading-snug">
                {copy.title}
              </h1>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{copy.body}</p>

              {error && (
                <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                {audience === "student" ? (
                  <>
                    <Field label="Full name">
                      <TextInput icon="user" required value={form.name} onChange={set("name")} placeholder="Jane Doe" />
                    </Field>
                    <Field label="Email address">
                      <TextInput
                        icon="mail"
                        type="email"
                        required
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field label="Where are you in your GRC journey?">
                      <Select icon="target" required value={form.stage} onChange={set("stage")}>
                        <option value="" disabled>
                          Select one
                        </option>
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="LinkedIn" hint="optional">
                      <TextInput
                        icon="linkedin"
                        value={form.linkedin}
                        onChange={set("linkedin")}
                        placeholder="https://linkedin.com/in/…"
                      />
                    </Field>
                    <Field label="Why do you want in?" hint="optional">
                      <TextInput
                        value={form.why}
                        onChange={set("why")}
                        placeholder="A sentence on what you're hoping to get out of it"
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="University / institution">
                      <TextInput
                        icon="book"
                        required
                        value={form.institution}
                        onChange={set("institution")}
                        placeholder="e.g. University of Manchester"
                      />
                    </Field>
                    <Field label="Contact name">
                      <TextInput
                        icon="user"
                        required
                        value={form.contactName}
                        onChange={set("contactName")}
                        placeholder="Jane Doe"
                      />
                    </Field>
                    <Field label="Designation">
                      <TextInput
                        icon="briefcase"
                        required
                        value={form.designation}
                        onChange={set("designation")}
                        placeholder="e.g. Head of Careers Service"
                      />
                    </Field>
                    <Field label="Email">
                      <TextInput
                        icon="mail"
                        type="email"
                        required
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@university.ac.uk"
                      />
                    </Field>
                  </>
                )}

                <PrimaryBtn type="submit" disabled={busy} className="w-full">
                  {busy ? "Submitting…" : audience === "university" ? "Submit" : "Join the waitlist"}
                </PrimaryBtn>
              </form>
              <p className="mt-4 text-center text-[11.5px] text-slate-400">
                {audience === "university"
                  ? "We'll only use your details to discuss the partnership programme."
                  : "We'll only use your details to invite you to early access."}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
