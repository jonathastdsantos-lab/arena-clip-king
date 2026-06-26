import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ArenaClips — Edite seus melhores momentos de jogo" },
      {
        name: "description",
        content:
          "ArenaClips é o editor de clipes para gamers: corte, legende e exporte highlights prontos para postar em segundos.",
      },
      { property: "og:title", content: "ArenaClips — Edite seus melhores momentos de jogo" },
      {
        property: "og:description",
        content:
          "Corte, legende e exporte highlights prontos para postar em segundos. O editor de clipes feito para gamers.",
      },
    ],
  }),
  component: LandingPage,
});
