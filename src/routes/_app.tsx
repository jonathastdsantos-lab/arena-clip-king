import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { isMockMode } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    if (isMockMode) return; // allow in mock/demo mode

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
