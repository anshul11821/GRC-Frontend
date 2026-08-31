"use client";

import { MentorShell } from "@/components/mentor/shell";

/**
 * The Mentor Guide — the learner's User Guide, for reviewers.
 *
 * Static on purpose. These are the programme's own rules (docs/MENTOR_REVIEW.md, MENTOR_GATES.md)
 * and they change on a deploy, not at runtime; serving them from an endpoint would be a query for
 * text that ships in the bundle anyway.
 */
export default function MentorGuidePage() {
  return (
    <MentorShell>
      <div className="mx-auto max-w-[760px] px-6 pt-7 pb-16">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Mentor Guide</h1>
        <p className="text-[12.5px] text-slate-500 mt-1 mb-7">
          What a decision does, and what it costs the person on the other end of it.
        </p>

        <Section title="Your decision is final">
          <p>
            The AI grades every step and its pass is <b>provisional</b>. Yours is not. Approving
            releases the step; returning it takes the step back out of the learner&rsquo;s passed set,
            which reopens it and re-locks everything that followed.
          </p>
          <p>
            A <b>pending</b> review blocks nothing. The learner keeps working while they wait, so
            nobody sits idle behind a two-day SLA — and a later disapproval pulls the step back open
            rather than a queue freezing their whole rotation.
          </p>
        </Section>

        <Section title="The four outcomes">
          <Outcome name="Approve" tone="green">
            The work meets the gate. The step releases.
          </Outcome>
          <Outcome name="Approve with note" tone="green">
            Good enough to release, but a habit needs correcting. Costs them no revision — the step
            simply does not complete until they have read your note.
          </Outcome>
          <Outcome name="Disapprove — return" tone="red">
            Sends it back with your reasons and grants an extra attempt. Two returns are allowed at
            one gate.
          </Outcome>
          <Outcome name="Disapprove — escalate" tone="red">
            The third disapproval. It never reopens the gate; the learner is shown the worked
            reference answer instead, and acknowledging it releases the step. Nobody is ever left
            permanently stuck.
          </Outcome>
        </Section>

        <Section title="Answering the checklist is the review">
          <p>
            Every gate carries six questions. A &ldquo;no&rdquo; produces its own reason code and the
            correction the mentee receives, so you never pick a disapproval from a menu. Nothing is
            pre-cleared for you and no agent result is shown before you answer.
          </p>
          <p>
            Your note is compulsory on every decision. The codes say which rule was missed; only you
            can say what you actually looked at, and a decision the mentee cannot interrogate is not
            feedback.
          </p>
        </Section>

        <Section title="Judgment calls are graded on the reasoning">
          <p>
            One step in every task carries a decision with no clean answer. Two or three of the four
            options are genuinely defensible, so the <i>choice</i> cannot be the grade. You are
            judging whether the reasoning they wrote would survive being read back to them by
            somebody the decision affected.
          </p>
          <p>
            The reference position on the card is the practitioner&rsquo;s view, and it is advisory.
            It names what a good answer notices, not which option is right. Taking an option the
            library argues against does not by itself fail; an empty box does.
          </p>
        </Section>

        <Section title="Judge against their brief, not the register">
          <p>
            Every learner rotates through a different organisation, asset and framing. The gate
            register&rsquo;s wording is org-agnostic; what your mentee read is not. The card shows you
            the brief they actually worked from, and marking correct work down because it answers a
            different organisation is the most common way a good submission gets returned.
          </p>
        </Section>

        <Section title="Machine output is marked; your decision is sealed">
          <p>
            Anything a model produced wears a dotted violet outline and the words &ldquo;Generated ·
            not a mentor decision&rdquo;. Your decisions carry a solid header band, a timestamp and
            your name. That asymmetry is the signal — a learner must always be able to tell which
            one binds.
          </p>
        </Section>
      </div>
    </MentorShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-[14px] font-semibold text-slate-900 mb-2">{title}</h2>
      <div className="space-y-2.5 text-[12.5px] text-slate-700 leading-relaxed [&_b]:font-semibold [&_b]:text-slate-900">
        {children}
      </div>
    </section>
  );
}

function Outcome({ name, tone, children }: { name: string; tone: "green" | "red"; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        className={`shrink-0 mt-0.5 inline-flex items-center h-[19px] px-2 rounded text-[10px] font-semibold ${
          tone === "green" ? "bg-[#e8f5ee] text-[#1e7a46]" : "bg-[#fdecec] text-[#a31d1d]"
        }`}
      >
        {name}
      </span>
      <span className="text-[12.5px] text-slate-700 leading-relaxed">{children}</span>
    </div>
  );
}
