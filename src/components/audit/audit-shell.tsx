"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { useAuth } from "@/components/auth/auth-provider";
import { useCachedQuery } from "@/lib/use-query";
import { auditApi } from "@/lib/audit";
import { useReview } from "./review-context";
import { Avatar } from "./primitives";

interface NavItem { href: string; label: string; icon: IconName; badge?: number }

export function AuditShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { version } = useReview();

  const { data: me } = useCachedQuery("audit:me", () => auditApi.me());
  const { data: overview } = useCachedQuery(`audit:overview:${version}`, () => auditApi.overview());

  const nav: NavItem[] = [
    { href: "/audit", label: "Overview", icon: "home" },
    { href: "/audit/queue", label: "Review Queue", icon: "inbox", badge: overview?.newRequests.length },
    { href: "/audit/in-progress", label: "In Progress", icon: "clipboard", badge: overview?.awaitingVerdict.length },
    { href: "/audit/flagged", label: "Flagged", icon: "flag", badge: overview?.flagged.length },
    { href: "/audit/approved", label: "Approved", icon: "checkSquare" },
    { href: "/audit/mentees", label: "Mentees", icon: "users" },
    { href: "/audit/reports", label: "Reports", icon: "chart" },
    { href: "/audit/standards", label: "Standards", icon: "shield" },
  ];

  const fullName = `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || me?.email || "Auditor";
  const initials = ((me?.firstName?.[0] ?? "") + (me?.lastName?.[0] ?? "")).toUpperCase() || (me?.email?.[0] ?? "A").toUpperCase();
  const firm = me?.profile?.firm || (me?.profile ? `${me.profile.discipline.toUpperCase()} auditor` : "Auditor");

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#FAFAF7]">
      <aside className={`shrink-0 h-full bg-white/60 backdrop-blur-xl border-r border-slate-200/70 flex flex-col transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[244px]"}`}>
        <div className="h-[68px] flex items-center px-4 gap-3 border-b border-slate-200/60">
          <button onClick={() => setCollapsed((c) => !c)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Icon name="menu" size={18} />
          </button>
          {!collapsed && (
            <div className="flex items-baseline gap-0">
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">grc</span>
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
              <span className="ml-2 px-1.5 h-[18px] rounded text-[9.5px] font-semibold tracking-wide bg-slate-900 text-white flex items-center self-center">AUDIT</span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const on = item.href === "/audit" ? pathname === "/audit" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`group w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-all ${on ? "bg-indigo-50/80 text-indigo-700" : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"}`}>
                <Icon name={item.icon} size={17} strokeWidth={on ? 2 : 1.6} />
                {!collapsed && (
                  <>
                    <span className={`text-[13.5px] tracking-tight ${on ? "font-medium" : ""}`}>{item.label}</span>
                    {item.badge ? (
                      <span className={`ml-auto px-1.5 h-5 rounded-md text-[11px] font-medium flex items-center ${on ? "bg-indigo-100 text-indigo-700" : "bg-slate-200/70 text-slate-600"}`}>{item.badge}</span>
                    ) : null}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200/60">
          {collapsed ? (
            <div className="flex justify-center"><Avatar initials={initials} tone="indigo" size={34} /></div>
          ) : (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 ring-1 ring-slate-200/60">
              <Avatar initials={initials} tone="indigo" size={34} />
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-slate-900 tracking-tight truncate">{fullName}</div>
                <div className="text-[10.5px] text-slate-500 truncate">{firm}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar firm={firm} queue={overview?.newRequests.length ?? 0} name={fullName} email={me?.email ?? ""} initials={initials} discipline={me?.profile?.discipline} />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function TopBar({ firm, queue, name, email, initials, discipline }: {
  firm: string; queue: number; name: string; email: string; initials: string; discipline?: string;
}) {
  return (
    <div className="relative z-30 h-[68px] shrink-0 flex items-center justify-between px-6 border-b border-slate-200/70 bg-white/40 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white"><Icon name="shield" size={17} /></span>
        <div>
          <div className="text-[13.5px] font-semibold tracking-tight text-slate-900">Assessment Console</div>
          <div className="text-[11px] text-slate-500">{firm}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 pl-3 pr-1">
          <div className="text-right">
            <div className="text-[11px] text-slate-500">In my queue</div>
            <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{queue} awaiting review</div>
          </div>
          <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon name="inbox" size={17} /></span>
        </div>
        <UserMenu name={name} email={email} initials={initials} discipline={discipline} />
      </div>
    </div>
  );
}

function UserMenu({ name, email, initials, discipline }: { name: string; email: string; initials: string; discipline?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const doSignOut = async () => { await signOut(); router.replace("/signin"); };

  return (
    <div className="relative pl-3 ml-1 border-l border-slate-200/70" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className={`flex items-center gap-2 h-11 pl-1.5 pr-2 rounded-xl transition-colors ${open ? "bg-slate-100" : "hover:bg-slate-100/70"}`}>
        <Avatar initials={initials} tone="indigo" size={32} />
        <div className="hidden lg:block text-left leading-tight">
          <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{name.split(" ")[0]}</div>
          <div className="text-[10.5px] text-slate-500">Auditor</div>
        </div>
        <Icon name="chevronDown" size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[280px] rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_8px_40px_-8px_rgba(15,23,42,0.22)] overflow-hidden z-50">
          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-slate-100/80 to-slate-50 border-b border-slate-100">
            <Avatar initials={initials} tone="indigo" size={44} />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-slate-900 tracking-tight truncate">{name}</div>
              <div className="text-[11.5px] text-slate-500 truncate">{email}</div>
              {discipline && <span className="inline-flex items-center gap-1 mt-1 px-1.5 h-[18px] rounded text-[10px] font-medium bg-slate-900 text-white uppercase">{discipline} auditor</span>}
            </div>
          </div>
          <div className="p-1.5">
            <Link href="/audit/standards" onClick={() => setOpen(false)} className="group w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors">
              <Icon name="shield" size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Assigned standards</span>
            </Link>
          </div>
          <div className="p-1.5 border-t border-slate-100">
            <button onClick={doSignOut} className="w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition-colors">
              <Icon name="logout" size={16} />
              <span className="text-[13px] font-medium tracking-tight">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
