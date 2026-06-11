import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo, SectionHead } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Faq, type FaqEntry } from "@/components/landing/faq";
import { LandingStats } from "@/components/landing/stats";
import { GLOW, SOFT_TONES } from "@/lib/tones";

// ============ CONTENT (ported from the mockup) ============
// Industry photos served straight from the Unsplash CDN (sized + cropped via query params).
const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`;
const INDUSTRIES: { label: string; icon: IconName; tone: string; image: string }[] = [
  { label: "Technology & IT Services", icon: "cube", tone: "sky", image: UNSPLASH("photo-1518770660439-4636190af475") },
  { label: "Banking & Financial Services", icon: "briefcase", tone: "indigo", image: UNSPLASH("photo-1554224155-6726b3ff858f") },
  { label: "Healthcare & Life Sciences", icon: "shield", tone: "emerald", image: UNSPLASH("photo-1576091160550-2173dba999ef") },
  { label: "Business Process Outsourcing", icon: "refresh", tone: "violet", image: UNSPLASH("photo-1556761175-5973dc0f32e7") },
  { label: "Legal & Consulting Services", icon: "book", tone: "amber", image: UNSPLASH("photo-1589829545856-d10d557cf95f") },
  { label: "E-commerce & Retail", icon: "grid", tone: "rose", image: UNSPLASH("photo-1556742049-0cfed4f6a45d") },
  { label: "Manufacturing & Industrial", icon: "layers", tone: "sky", image: UNSPLASH("photo-1581091226825-a6a2a5aee158") },
  { label: "Government & Public Sector", icon: "flag", tone: "indigo", image: UNSPLASH("photo-1529107386315-e1a2ed48a620") },
  { label: "Transportation & Logistics", icon: "send", tone: "emerald", image: UNSPLASH("photo-1566576912321-d58ddd7a6088") },
  { label: "Education", icon: "book", tone: "violet", image: UNSPLASH("photo-1523240795612-9a054b0db644") },
  { label: "Media & Telecommunications", icon: "chat", tone: "amber", image: UNSPLASH("photo-1522071820081-009f0129c71c") },
  { label: "Energy & Utilities", icon: "bolt", tone: "rose", image: UNSPLASH("photo-1466611653911-95081537e5b7") },
];

const PROGRAM: { title: string; icon: IconName; tone: string; body: string }[] = [
  { title: "Real-world task experience", icon: "desk", tone: "indigo", body: "Work through simulated real organisational tasks with an AI mentor — practical exposure, not just theory." },
  { title: "Autonomous workflow management", icon: "refresh", tone: "violet", body: "Own a structured workflow end to end, from request and interview through recording, classification and sign-off." },
  { title: "Intelligent decision making", icon: "target", tone: "emerald", body: "Make reasoned, standards-aligned calls on classification, risk and remediation — graded against an industry rubric." },
  { title: "Continuous learning & adaptation", icon: "history", tone: "amber", body: "Every activity is mentor-reviewed with Socratic feedback, so you improve revision over revision." },
  { title: "Real, measurable impact", icon: "chart", tone: "rose", body: "Completed work compiles into a CV, credential badges and a verifiable certificate that proves capability." },
];

const TESTIMONIALS = [
  { quote: "We could expand globally thanks to their compliance strategies.", name: "Emily Wang", role: "Director, GlobalTrade" },
  { quote: "Truly professional and reliable service throughout the engagement.", name: "Carlos Morales", role: "CFO, BrightFuture" },
  { quote: "Their solutions saved us significant time and effort.", name: "Marchent Dias", role: "CFO, Global Bright" },
];

const TRACKS = [
  { code: "GRC 101", title: "Foundations", years: "GRC Analyst · 0–2 years", body: "Maps control frameworks (e.g. NIST, ISO 27001) to business processes, conducts risk and compliance assessments, and helps prepare audit evidence." },
  { code: "GRC 301", title: "Advanced", years: "GRC Specialist · 2–4 years", body: "Leads risk assessments and assurance engagements across frameworks, manages third-party risk, and drives remediation to closure." },
  { code: "GRC 501", title: "Leadership", years: "GRC Leader · 5+ years", body: "Sets GRC strategy, designs the operating model, and reports risk posture to the board and executive leadership." },
];

const FAQS: FaqEntry[] = [
  { q: "Who is the GRC mentorship programme for?", a: "Anyone starting or growing a career in governance, risk and compliance — students, career-changers and early-career analysts who want hands-on, job-ready experience." },
  { q: "Do I need prior experience?", a: "No. GRC 101 starts from the foundations and assumes no background; the advanced tracks build on the work you complete." },
  { q: "How does the mentorship actually work?", a: "You work through real, simulated enterprise engagements. An AI mentor reviews your work and grades your output against the same rubric used in industry." },
  { q: "Which standards and frameworks will I learn?", a: "ISO/IEC 27001:2022, NIST CSF 2.0, CIS Controls v8, SOC 2 and GDPR — applied across 35 structured, hands-on tasks." },
  { q: "Will this help me get hired?", a: "Yes. Your completed work compiles into a CV, credential badges and a verifiable certificate, and the platform matches you to live roles from LinkedIn and remote-work boards." },
  { q: "How long does each track take?", a: "GRC 101 spans 16 method categories across several weeks, completed at your own pace as your schedule allows." },
];

const NAV_LINKS: [string, string][] = [
  ["#industries", "Industries"],
  ["#program", "Program"],
  ["#tracks", "Tracks"],
  ["#testimonials", "Stories"],
  ["#faq", "FAQ"],
];

// ============ SECTIONS ============
function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF7]/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-[1140px] mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} className="focus-ring rounded-md px-1 py-0.5 text-[13.5px] font-medium text-slate-600 hover:text-slate-900 tracking-tight no-underline transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/signin" className="focus-ring rounded-md px-1 py-0.5 hidden sm:inline text-[13.5px] font-medium text-slate-600 hover:text-slate-900 tracking-tight no-underline">
            Sign in
          </Link>
          <Link href="/signup" className="focus-ring inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
            Get started <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        {/* faint grid texture for subtle depth */}
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)" }} />
        <div className="absolute -top-24 left-1/3 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)" }} />
        <div className="absolute top-10 right-10 w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.14), transparent 70%)" }} />
        <div className="absolute -bottom-10 left-10 w-[320px] h-[320px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)" }} />
      </div>
      <div className="relative max-w-[1140px] mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white ring-1 ring-slate-200/70 text-[12px] font-medium text-slate-600 tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hands-on GRC mentorship · ISO 27001 · NIST · GDPR
        </div>
        <h1 className="mt-5 text-[40px] md:text-[58px] font-semibold tracking-[-0.035em] text-slate-900 leading-[1.04] max-w-3xl mx-auto">
          Become a job-ready <span className="text-indigo-600">GRC professional</span> through real work.
        </h1>
        <p className="mt-5 text-[16px] md:text-[17px] text-slate-500 leading-relaxed tracking-tight max-w-2xl mx-auto" style={{ textWrap: "pretty" }}>
          Practise governance, risk and compliance on simulated enterprise engagements — mentor-graded, standards-aligned, and mapped straight to the roles you want.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_8px_24px_-8px_rgba(79,70,229,0.7)]">
            Start GRC 101 <Icon name="arrowRight" size={15} />
          </Link>
          <a href="#tracks" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white ring-1 ring-slate-200/70 text-slate-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-slate-50 transition-colors">
            Explore tracks
          </a>
        </div>
      </div>
    </section>
  );
}

function Frameworks() {
  const items = ["ISO/IEC 27001", "NIST CSF 2.0", "CIS Controls v8", "SOC 2", "GDPR"];
  return (
    <section className="bg-[#FAFAF7]">
      <div className="max-w-[1140px] mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.14em] uppercase text-slate-500">
            <Icon name="shield" size={13} className="text-emerald-500" /> Aligned with industry standards
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {items.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200/70 text-[13px] font-medium text-slate-700 tracking-tight shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:ring-slate-300 hover:-translate-y-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="relative overflow-hidden border-y border-white/5" style={{ background: "linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #0b1120 100%)" }}>
      {/* depth: faint grid + indigo/violet glows so the dark band isn't flat */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" }} />
      <div className="relative max-w-[1140px] mx-auto px-6 py-20">
        <SectionHead dark eyebrow="Where you'll work" icon="grid" sub="Engagements span the industries that hire GRC talent — practise in the context you'll actually be employed in.">
          Industries you&apos;ll <span className="text-indigo-400">work</span> with
        </SectionHead>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {INDUSTRIES.map((i) => {
            const g = GLOW[i.tone];
            return (
              <div key={i.label} className="group relative h-32 rounded-2xl overflow-hidden ring-1 ring-white/10 cursor-default shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {/* dark gradient keeps the label legible over any photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/15" />
                {/* tone tint emanating from the icon corner, brightening on hover */}
                <div className="absolute inset-0 opacity-35 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-60" style={{ background: `linear-gradient(150deg, ${g}, transparent 60%)` }} />
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center ring-1 ring-white/25 text-white backdrop-blur-sm bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]">
                    <Icon name={i.icon} size={18} />
                  </span>
                  <span className="text-[12.5px] font-semibold text-white tracking-tight leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" style={{ textWrap: "balance" }}>{i.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Program() {
  return (
    <section id="program" className="relative" style={{ background: "linear-gradient(180deg, #ffffff, #f3f4fb)" }}>
      <div className="max-w-[1140px] mx-auto px-6 py-20">
        <SectionHead eyebrow="How it works" icon="sparkle" sub="A mentorship model built around doing the work — not watching lectures.">
          Our <span className="text-indigo-600">Mentorship</span> Program
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROGRAM.map((p, i) => (
            <StaggerItem key={p.title} className="group relative bg-white rounded-2xl ring-1 ring-slate-200/70 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-200/80">
              <span className="absolute top-5 right-6 font-mono text-[13px] font-semibold tabular-nums text-slate-300 transition-colors group-hover:text-indigo-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 transition-transform duration-300 group-hover:scale-105 ${SOFT_TONES[p.tone]}`}>
                <Icon name={p.icon} size={20} />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-slate-900">{p.title}</h3>
              <p className="mt-2 text-[13px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{p.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#F4F5F8] border-y border-slate-200/60">
      <div className="max-w-[1140px] mx-auto px-6 py-20">
        <SectionHead eyebrow="Testimonials" icon="chat" sub="Teams and leaders who built their compliance capability with grcmentor.">
          What our <span className="text-indigo-600">members</span> say
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name} className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-card p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-200/80">
              <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-[14px] text-slate-700 leading-relaxed tracking-tight flex-1" style={{ textWrap: "pretty" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[12px] font-semibold ring-2 ring-white shadow-sm">
                  {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold text-slate-900 tracking-tight">{t.name}</div>
                  <div className="text-[11.5px] text-slate-500 tracking-tight">{t.role}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Tracks() {
  return (
    <section id="tracks" className="bg-white">
      <div className="max-w-[1140px] mx-auto px-6 py-20">
        <SectionHead eyebrow="Career tracks" icon="rocket" sub="A progression from practitioner to leader — start where you are and grow with mentor-graded work.">
          Choose your <span className="text-indigo-600">track</span>
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRACKS.map((t) => (
            <StaggerItem key={t.code} className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 p-6 flex flex-col text-white transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-400/30 hover:shadow-[0_24px_50px_-24px_rgba(79,70,229,0.6)]" style={{ background: "linear-gradient(160deg, #312e81 0%, #1e1b3a 60%, #0f172a 100%)" }}>
              <div className="pointer-events-none absolute -top-8 -right-6 w-40 h-40 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.5), transparent 70%)" }} />
              <div className="pointer-events-none absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
              <div className="relative flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] tracking-wide text-indigo-200 bg-white/10 ring-1 ring-white/15 rounded px-1.5 py-0.5">{t.title}</span>
                </div>
                <h3 className="mt-3 text-[26px] font-semibold tracking-tight">{t.code}</h3>
                <div className="text-[11.5px] text-indigo-200/90 tracking-tight mt-0.5">{t.years}</div>
                <p className="mt-3 text-[13px] text-indigo-50/85 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{t.body}</p>
              </div>
              <Link href={`/tracks/${t.code.toLowerCase().replace(/\s+/g, "-")}`} className="focus-ring relative mt-5 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-[13px] font-semibold tracking-tight no-underline transition-colors">
                Know more <Icon name="arrowRight" size={14} />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CtaFooter() {
  const cols: [string, [string, string][]][] = [
    ["Programme", [["GRC 101", "/signup"], ["GRC 301", "/signup"], ["GRC 501", "/signup"]]],
    ["Platform", [["Dashboard", "/signin"], ["Reports", "/signin"], ["Certificate", "/signin"]]],
    ["Grow", [["Badges", "/signin"], ["My CV", "/signin"], ["Matching Jobs", "/signin"]]],
  ];
  return (
    <>
      <section className="bg-white">
        <div className="max-w-[1140px] mx-auto px-6 py-16">
          <div className="bg-brand-gradient relative overflow-hidden rounded-3xl text-white px-8 py-12 md:px-14 md:py-14 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-[28px] md:text-[36px] font-semibold tracking-[-0.03em] leading-tight">Ready to build a GRC career?</h2>
            <p className="relative mt-3 text-[15px] text-indigo-100/90 tracking-tight max-w-xl mx-auto" style={{ textWrap: "pretty" }}>
              Start GRC 101 today — your first mentor-graded task takes minutes to begin.
            </p>
            <Link href="/signup" className="focus-ring relative mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-indigo-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
              Get started free <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </section>
      <footer className="bg-[#FAFAF7] border-t border-slate-200/60">
        <div className="max-w-[1140px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-[12.5px] text-slate-500 leading-relaxed tracking-tight max-w-[220px]">
              Hands-on governance, risk and compliance mentorship that gets you hired.
            </p>
          </div>
          {cols.map(([title, items]) => (
            <div key={title}>
              <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500">{title}</div>
              <div className="mt-3 flex flex-col gap-2">
                {items.map(([l, h]) => (
                  <Link key={l} href={h} className="focus-ring rounded-md px-1 py-0.5 text-[13px] text-slate-600 hover:text-indigo-600 tracking-tight no-underline transition-colors">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200/60">
          <div className="max-w-[1140px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
            <span className="text-[12px] text-slate-500">© 2026 grcmentor · All rights reserved.</span>
            <div className="flex items-center gap-4 text-[12px] text-slate-500">
              <a href="#" className="focus-ring rounded-md px-1 py-0.5 no-underline hover:text-slate-700">Privacy</a>
              <a href="#" className="focus-ring rounded-md px-1 py-0.5 no-underline hover:text-slate-700">Terms</a>
              <a href="#" className="focus-ring rounded-md px-1 py-0.5 no-underline hover:text-slate-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Nav />
      <Hero />
      <LandingStats />
      <Frameworks />
      <Industries />
      <Program />
      <Testimonials />
      <Tracks />
      <section id="faq" className="bg-[#F4F5F8] border-t border-slate-200/60">
        <div className="max-w-[760px] mx-auto px-6 py-20">
          <SectionHead eyebrow="FAQs" icon="info" sub="Everything you need to know before you start.">
            Frequently asked <span className="text-indigo-600">questions</span>
          </SectionHead>
          <Faq items={FAQS} />
        </div>
      </section>
      <CtaFooter />
    </div>
  );
}
