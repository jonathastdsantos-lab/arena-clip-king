import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Scissors } from "lucide-react";
import { ClipCard } from "@/components/clips/ClipCard";
import { mockClips } from "@/lib/mockData";

export const Route = createFileRoute("/_app/clips/")({
  head: () => ({
    meta: [{ title: "Clips — ArenaClips" }],
  }),
  component: ClipsPage,
});

function ClipsPage() {
  // In real mode this would use a proper useAllClips hook
  const clips = [...mockClips].sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-5xl">Clips</h1>
        <p className="text-muted-foreground mt-1">
          {clips.length} clip{clips.length !== 1 ? "s" : ""} gerado{clips.length !== 1 ? "s" : ""}, ordenados por viral score.
        </p>
      </motion.div>

      {clips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border bg-card py-20 text-center"
        >
          <Scissors className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-display text-3xl mb-2">Nenhum clip ainda</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Envie um vídeo e a IA vai gerar os melhores momentos para você.
          </p>
          <Link
            to="/videos/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Enviar vídeo
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {clips.map((clip, i) => (
            <ClipCard key={clip.id} clip={clip} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
