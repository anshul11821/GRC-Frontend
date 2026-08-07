import { AuthProvider } from "@/components/auth/auth-provider";
import { RouteGuard } from "@/components/app/route-guard";
import { AppShell } from "@/components/app/app-shell";
import { DatasetSwitch } from "@/components/app/dataset-switch";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>
        <AppShell>{children}</AppShell>
        <DatasetSwitch />
      </RouteGuard>
    </AuthProvider>
  );
}
