import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionHead } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Nav, SiteFooter } from "@/components/landing/chrome";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Work with us — grcmentor Assessment Board",
  description:
    "Join the grcmentor Assessment Board: practitioners who review mentee submissions against the rubric for their NICE work role. Remote, asynchronous, 4–6 hours a month.",
};

// Reviewer positions, each mapped to the NICE work role it grades against.
export const ROLES: { title: string; code: string; duty: string }[] = [
  { title: "Policy & Governance Analyst", code: "OG-PLA-001", duty: "Drafts, reviews and publishes cybersecurity and data-privacy policy; owns the policy register and the governance document set." },
  { title: "Compliance Manager", code: "OG-AUD-001", duty: "Owns regulatory obligations, control mapping and compliance status reporting; runs internal compliance assessments." },
  { title: "Information Security Auditor", code: "OG-AUD-002", duty: "Plans and performs control testing; owns workpaper standards, evidence quality and audit readiness." },
  { title: "Cyber Risk Manager", code: "OG-RIS-001", duty: "Owns the risk framework, scoring anchors, treatment decisions and the risk register review cycle." },
  { title: "Vendor / Third-Party Risk Analyst", code: "OG-SCRM-001", duty: "Owns supplier assessment, sub-processor governance and third-party contractual security terms." },
  { title: "Business Continuity & Resilience Analyst", code: "OG-MAP-001", duty: "Owns business impact analysis, RTO/RPO determination and ICT continuity documentation." },
  { title: "Security Awareness & Training Specialist", code: "OG-CUR-001", duty: "Owns awareness content, delivery quality, knowledge assessment and training evidence." },
  { title: "Incident Response & Crisis Manager (GRC)", code: "PD-IRM-001", duty: "Owns incident procedure design, exercise facilitation and post-incident learning." },
  { title: "Cybersecurity Program Manager", code: "OG-PMA-001", duty: "Owns programme roadmaps, charters, resourcing and delivery governance." },
  { title: "Data Protection Officer", code: "OG-PRI-001", duty: "Statutory privacy role; owns RoPA, DPIA disposition, lawful basis and supervisory-authority interface." },
];

const DUTIES: { icon: IconName; title: string; body: string }[] = [
  { icon: "file", title: "Assess submitted work", body: "Policies, risk registers, audit workpapers, DPIAs and continuity plans, submitted through the platform queue." },
  { icon: "checkSquare", title: "Grade against the rubric", body: "Score with anchored criteria, leave written feedback, and decide whether the mentee has met the standard for the role." },
  { icon: "gauge", title: "Keep the bar calibrated", body: "Join periodic calibration sessions so grading stays consistent across reviewers and cohorts." },
];

const CHIPS = ["Remote & asynchronous", "NICE-aligned work roles", "4–6 hrs per month"];

const REQUIREMENTS = [
  "Minimum three years in the discipline you apply to review.",
  "A LinkedIn profile we can match to your stated experience.",
  "Capacity for roughly five submissions a month.",
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)" }} />
        <div className="absolute -top-24 left-1/3 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)" }} />
        <div className="absolute top-10 right-10 w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.14), transparent 70%)" }} />
      </div>
      <div className="relative max-w-[1140px] mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white ring-1 ring-slate-200/70 text-[12px] font-medium text-slate-600 tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Now recruiting reviewers
        </div>
        <h1 className="mt-5 text-[36px] md:text-[52px] font-semibold tracking-[-0.035em] text-slate-900 leading-[1.06] max-w-3xl mx-auto" style={{ textWrap: "balance" }}>
          Join the <span className="text-indigo-600">Assessment Board</span> and grade the next generation of GRC.
        </h1>
        <p className="mt-5 text-[16px] md:text-[17px] text-slate-500 leading-relaxed tracking-tight max-w-2xl mx-auto" style={{ textWrap: "pretty" }}>
          Assessment Board members review submissions made by mentees on the grcmentor application. You bring the practitioner judgement; we bring the workflow, the rubric and the candidates.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
          <a href="#apply" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_8px_24px_-8px_rgba(79,70,229,0.7)]">
            Apply to review <Icon name="arrowRight" size={15} />
          </a>
          <a href="#positions" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white ring-1 ring-slate-200/70 text-slate-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-slate-50 transition-colors">
            See open positions
          </a>
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {CHIPS.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200/70 text-[13px] font-medium text-slate-700 tracking-tight shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatTheBoardDoes() {
  return (
    <section className="relative overflow-hidden border-y border-white/5" style={{ background: "linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #0b1120 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }} />
      <div className="relative max-w-[1140px] mx-auto px-6 py-20">
        <SectionHead dark eyebrow="What the board does" icon="clipboard" sub="Mentees complete simulated enterprise engagements inside our application. Board members assess the evidence they produce against the rubric for their work role.">
          Review real submissions, <span className="text-indigo-400">not exam papers</span>
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {DUTIES.map((d, i) => (
            <StaggerItem key={d.title} className="relative rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-400/30">
              <span className="absolute top-5 right-6 font-mono text-[13px] font-semibold tabular-nums text-white/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-white/15 bg-white/10 text-indigo-200">
                <Icon name={d.icon} size={20} />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-white">{d.title}</h3>
              <p className="mt-2 text-[13px] text-slate-400 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{d.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Positions() {
  return (
    <section id="positions" className="scroll-mt-16 bg-white">
      <div className="max-w-[1140px] mx-auto px-6 py-20">
        <SectionHead eyebrow="Open positions" icon="briefcase" sub="Each reviewer role maps to a NICE work role. Apply for the one your day job qualifies you to judge.">
          Reviewer <span className="text-indigo-600">roles</span>
        </SectionHead>
        <div className="mt-10 rounded-2xl ring-1 ring-slate-200/70 overflow-hidden shadow-card">
          <div className="hidden md:grid grid-cols-[1.1fr_0.5fr_1.8fr] gap-6 px-6 py-3.5 bg-slate-900 text-white text-[11px] font-semibold tracking-[0.08em] uppercase">
            <div>Reviewer role</div>
            <div>NICE work role</div>
            <div>Responsibility that qualifies them</div>
          </div>
          {ROLES.map((r) => (
            <div key={r.code} className="grid md:grid-cols-[1.1fr_0.5fr_1.8fr] gap-1.5 md:gap-6 px-6 py-4 bg-white border-t border-slate-100 first:border-t-0 md:first:border-t md:items-start hover:bg-slate-50/70 transition-colors">
              <div className="text-[14px] font-semibold tracking-tight text-slate-900 leading-snug">{r.title}</div>
              <div className="font-mono text-[12px] text-indigo-600 md:pt-0.5">{r.code}</div>
              <div className="text-[13px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{r.duty}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-slate-500 tracking-tight">
          All positions are voluntary board appointments, reviewed every 12 months.
        </p>
      </div>
    </section>
  );
}

function Apply() {
  return (
    <section id="apply" className="scroll-mt-16 bg-[#F4F5F8] border-t border-slate-200/60">
      <div className="max-w-[1140px] mx-auto px-6 py-20 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
        <div>
          <SectionHead center={false} eyebrow="Application" icon="send" sub="Tell us who you are and which reviewer position you want. We verify your background against the work role, then invite you to a calibration walkthrough.">
            Apply to join the <span className="text-indigo-600">board</span>
          </SectionHead>
          <div className="mt-7 flex flex-col gap-3">
            {REQUIREMENTS.map((req) => (
              <div key={req} className="flex gap-2.5 items-start">
                <span className="mt-0.5 text-emerald-500 shrink-0"><Icon name="checkCircle" size={16} /></span>
                <span className="text-[13.5px] text-slate-600 leading-relaxed tracking-tight">{req}</span>
              </div>
            ))}
          </div>
        </div>
        <ApplyForm roles={ROLES.map((r) => ({ title: r.title, code: r.code }))} />
      </div>
    </section>
  );
}

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Nav active="/work-with-us" />
      <Hero />
      <WhatTheBoardDoes />
      <Positions />
      <Apply />
      <SiteFooter />
    </div>
  );
}
