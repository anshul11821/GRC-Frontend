import { AuthProvider } from "@/components/auth/auth-provider";
import { AuditGuard } from "@/components/audit/audit-guard";
import { ReviewProvider } from "@/components/audit/review-context";
import { AuditShell } from "@/components/audit/audit-shell";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuditGuard>
        <ReviewProvider>
          <AuditShell>{children}</AuditShell>
        </ReviewProvider>
      </AuditGuard>
    </AuthProvider>
  );
}
