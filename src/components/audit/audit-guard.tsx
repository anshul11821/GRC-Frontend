"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingState } from "./primitives";

/** Guards /audit/*: waits for the auth probe, then bounces non-auditors. Auditors who haven't
 *  finished their application go to /auditor to complete it. No "paid" gate (that's mentee-only). */
export function AuditGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
    } else if (user.role !== "auditor") {
      router.replace("/app");
    } else if (!user.isProfileComplete) {
      router.replace("/auditor");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "auditor" || !user.isProfileComplete) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAFAF7]">
        <LoadingState />
      </div>
    );
  }
  return <>{children}</>;
}
