"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/primitives";
import { useAuth } from "@/components/auth/auth-provider";
import { DASH_NAV, initialsOf } from "./nav";
import { FloatingMentor } from "./floating-mentor";
import { NotificationBell } from "./notification-bell";

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
      <nav className="flex-1 min-h-0 p-3 flex flex-col gap-0.5">
        {DASH_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={closeMobile}
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

      {open && (
        <div className="absolute right-0 mt-2 w-[284px] rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_8px_40px_-8px_rgba(15,23,42,0.22)] overflow-hidden z-50">
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
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors no-underline"
            >
              <Icon name="settings" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Account Settings</span>
              <Icon name="chevronRight" size={14} className="ml-auto text-slate-300 group-hover:text-slate-400" />
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
        </div>
      )}
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
        <NotificationBell />
        <UserMenu />
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
        <main className="flex-1 min-h-0 overflow-y-auto print:overflow-visible print:h-auto">{children}</main>
      </div>
      <div className="print:hidden"><FloatingMentor /></div>
    </div>
  );
}
