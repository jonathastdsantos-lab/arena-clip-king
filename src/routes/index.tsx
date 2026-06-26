import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase, isMockMode } from "@/lib/supabase";

export const Route = createFileRoute("/")(({
  beforeLoad: async () => {
    if (isMockMode) {
      // In demo mode, always go to biblioteca
      throw redirect({ to: "/biblioteca" });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      throw redirect({ to: "/biblioteca" });
    } else {
      throw redirect({ to: "/auth/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "ArenaClips — Os melhores momentos. Em um clique." },
      {
        name: "description",
        content:
          "Plataforma de geração automática de cortes virais para conteúdo esportivo brasileiro. Análise de copyright integrada.",
      },
    ],
  }),
  component: () => null,
}));
