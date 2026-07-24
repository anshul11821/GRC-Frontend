"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/primitives";
import { useAuth } from "@/components/auth/auth-provider";
import { DASH_NAV, initialsOf } from "./nav";
import { WelcomeTour, startWelcomeTour } from "./welcome-tour";
import { UpNext } from "./up-next";
import { DropdownPanel } from "@/components/ui/motion";

function DashSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  closeMobile,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
  // Labels/badge/brand are hidden only on desktop when collapsed; the mobile drawer is always
  // full-width, so on small screens `collapsed` must not hide them.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";

  return (
    <aside
      aria-label="Sidebar"
      className={[
        "bg-white/60 backdrop-blur-xl border-r border-slate-200/70 flex flex-col print:hidden",
        // Mobile: fixed off-canvas drawer that slides in over the content.
        "fixed inset-y-0 left-0 z-50 w-[244px] transition-transform duration-300",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Desktop (md+): part of the flex flow, collapsible width, never translated.
        "md:static md:z-auto md:translate-x-0 md:shadow-none md:h-full md:shrink-0 md:transition-all",
        collapsed ? "md:w-[68px]" : "md:w-[244px]",
      ].join(" ")}
    >
      <div className="h-[68px] flex items-center px-4 gap-3 border-b border-slate-200/60">
        {/* Desktop: collapse toggle. */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="focus-ring hidden md:flex w-9 h-9 rounded-lg items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" size={18} />
        </button>
        {/* Mobile: close drawer. */}
        <button
          onClick={closeMobile}
          className="focus-ring md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <Icon name="x" size={18} />
        </button>
        <div className={`flex items-baseline gap-0 ${hideWhenCollapsed}`}>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">grc</span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 self-center mt-1" />
        </div>
      </div>
      <nav data-tour="nav" className="flex-1 min-h-0 p-3 flex flex-col gap-0.5">
        {DASH_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={closeMobile}
              data-tour={`nav-${item.id}`}
              title={item.soon ? `${item.label} — coming soon` : item.label}
              className={`focus-ring group w-full flex-1 min-h-0 max-h-10 px-3 rounded-lg flex items-center gap-3 transition-all no-underline ${
                active ? "bg-indigo-50/80 text-indigo-700" : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              }`}
            >
              <Icon name={item.icon} size={17} strokeWidth={active ? 2 : 1.6} className="shrink-0" />
              <span className={`flex-1 flex items-center min-w-0 ${hideWhenCollapsed}`}>
                <span className={`text-[13.5px] tracking-tight truncate ${active ? "font-medium" : ""}`}>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto shrink-0 px-1.5 h-5 rounded-md text-[11px] font-medium flex items-center ${
                      active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = initialsOf(user?.firstName, user?.lastName, user?.email);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "";

  const onSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="relative pl-3 ml-1 border-l border-slate-200/70" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`focus-ring flex items-center gap-2 h-11 pl-1.5 pr-2 rounded-xl transition-colors ${open ? "bg-slate-100" : "hover:bg-slate-100/70"}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[12px] font-semibold ring-2 ring-white">
          {initials}
        </div>
        <div className="hidden lg:block text-left leading-tight">
          <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{user?.firstName || "Account"}</div>
          <div className="text-[10.5px] text-slate-500 capitalize">{user?.role || "Mentee"}</div>
        </div>
        <Icon name="chevronDown" size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <DropdownPanel open={open} className="absolute right-0 mt-2 w-[284px]">
          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 border-b border-slate-100">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[15px] font-semibold ring-2 ring-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-slate-900 tracking-tight truncate">{name}</div>
              <div className="text-[11.5px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/app/guide"
              onClick={() => setOpen(false)}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors no-underline"
            >
              <Icon name="help" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">User Guide</span>
              <Icon name="chevronRight" size={14} className="ml-auto text-slate-300 group-hover:text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                startWelcomeTour();
              }}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Icon name="play" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Replay the tour</span>
            </button>
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors no-underline"
            >
              <Icon name="settings" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Account Settings</span>
              <Icon name="chevronRight" size={14} className="ml-auto text-slate-300 group-hover:text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="p-1.5 border-t border-slate-100">
            <button
              onClick={onSignOut}
              className="focus-ring w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Icon name="logout" size={16} />
              <span className="text-[13px] font-medium tracking-tight">Sign out</span>
            </button>
          </div>
      </DropdownPanel>
    </div>
  );
}

function DashTopBar({ openMobile }: { openMobile: () => void }) {
  return (
    <div className="relative z-30 h-[68px] shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-slate-200/70 bg-white/40 backdrop-blur-xl print:hidden">
      <div className="flex items-center gap-3">
        {/* Mobile: open the navigation drawer. */}
        <button
          onClick={openMobile}
          className="focus-ring md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Icon name="menu" size={18} />
        </button>
        <BrandMark size={36} />
        <div>
          <div className="text-[13.5px] font-semibold tracking-tight text-slate-900">GRC 101</div>
          <div className="text-[11px] text-slate-500">Foundations</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span data-tour="bell"><UpNext /></span>
        <span data-tour="account"><UserMenu /></span>
      </div>
    </div>
  );
}

/** Desk is a focus surface — the workspace column wants the width. Nudge (don't force) the mentee
 *  to collapse the main menu the first time they land there. Lives in AppShell because AppShell
 *  owns `collapsed`; the desk layout can't reach it. Desktop only: on mobile the menu is a drawer
 *  and already out of the way. */
// Waved off for this page load only. ponytail: module-level, not persisted — a nudge that comes
// back next session is cheaper to live with than one that silently never returns.
let dismissed = false;

function CollapseMenuHint({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Collapsing *is* taking the hint — never coach them again, not even if they reopen the menu
    // while still on the desk.
    if (collapsed) dismissed = true;
    if (dismissed || !pathname.startsWith("/app/desk")) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), 700);
    return () => clearTimeout(t);
  }, [pathname, collapsed]);

  const close = () => {
    dismissed = true;
    setShow(false);
  };

  // Escape waves it off, same as the X.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show]);

  if (!show) return null;
  // Geometry of the real toggle in DashSidebar's header: px-4 (16px) inset, w-9/h-9 (36px), inside
  // a h-[68px] row → top (68-36)/2 = 16px. ponytail: hardcoded; measure the node if the header
  // ever stops being a fixed height.
  return (
    <div className="hidden md:block print:hidden">
      {/* Spotlight. The 9999px shadow spread *is* the dim — everything outside this 36px box goes
          dark, the box itself stays clear. pointer-events-none throughout so the toggle beneath
          (and the rest of the app) stays clickable; this coaches, it doesn't trap. */}
      <div
        aria-hidden="true"
        className="fixed top-4 left-4 w-9 h-9 z-40 rounded-lg pointer-events-none outline outline-2 outline-offset-[3px] outline-white/70 shadow-[0_0_0_9999px_rgba(2,6,23,0.62)] motion-safe:animate-[spotlight_2s_ease-out_infinite]"
      />

      {/* Cursor tapping the toggle. Anchored off the toggle's bottom-right corner; the keyframes
          walk it in, press, and drift back out. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="fixed top-6 left-6 z-40 w-7 h-7 pointer-events-none drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] motion-safe:animate-[cursorTap_2s_ease-in-out_infinite]"
      >
        {/* Lucide mouse-pointer-click — the arrow-plus-click-rays icon these tours converge on.
            Its tip sits at ~9,9 in the viewBox (≈11px at 28px), so top/left 24 lands the tip on the
            toggle's centre at the press keyframe and just off its corner at rest. Rays are indigo
            so they read on the white toggle; the arrow is white-on-slate so it reads on both the
            toggle and the dimmed backdrop. */}
        <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M14 4.1 12 6" />
          <path d="m5.1 8-2.9-.8" />
          <path d="m6 12-1.9 2" />
          <path d="M7.2 2.2 8 5.1" />
        </g>
        <path
          d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"
          fill="#fff"
          stroke="#0f172a"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
      </svg>

      <div
        role="status"
        className="fixed top-[78px] left-4 z-40 w-[268px] rounded-xl bg-white ring-1 ring-slate-200/70 shadow-2xl shadow-black/40 motion-safe:animate-[popIn_.35s_ease-out]"
      >
        {/* Caret aimed up at the toggle, centred on it. */}
        <span className="absolute left-[26px] -top-[5px] w-2.5 h-2.5 rotate-45 bg-white ring-1 ring-slate-200/70 [clip-path:polygon(0_0,100%_0,0_100%)]" />
        <div className="flex items-start gap-2.5 px-3.5 pt-3">
          <Icon name="sparkle" size={15} className="shrink-0 mt-px text-indigo-500" />
          <p className="text-[12.5px] leading-[1.55] text-slate-600">
            Collapse the menu here. The Working Desk gives you more room to think.
          </p>
        </div>
        <div className="flex justify-end px-2 pb-2 pt-1.5">
          <button
            onClick={close}
            className="focus-ring cursor-pointer h-7 px-2.5 rounded-lg text-[12px] font-medium tracking-tight text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer on navigation and on Escape.
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#FAFAF7] print:h-auto print:w-auto print:overflow-visible print:block">
      {/* Mobile drawer backdrop. */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden print:hidden"
          aria-hidden="true"
        />
      )}
      <DashSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <DashTopBar openMobile={() => setMobileOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden print:overflow-visible print:h-auto">{children}</main>
      </div>
      <CollapseMenuHint collapsed={collapsed} />
      <div className="print:hidden"><WelcomeTour openNav={() => setMobileOpen(true)} /></div>
    </div>
  );
}
