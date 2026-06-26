import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronLeft, Scissors, Loader2 } from "lucide-react";
import { useVideo } from "@/lib/queries/useVideos";
import { useClips } from "@/lib/queries/useClips";
import { useJob } from "@/lib/queries/useJobs";
import { ClipCard } from "@/components/clips/ClipCard";
import { ProcessingStatus } from "@/components/videos/ProcessingStatus";
import { ViralScoreBadge } from "@/components/clips/ViralScoreBadge";

export const Route = createFileRoute("/_app/videos/$videoId/")({
  head: () => ({
    meta: [{ title: "Clips do Vídeo — ArenaClips" }],
  }),
  component: VideoDetailPage,
});

function VideoDetailPage() {
  const { videoId } = Route.useParams();
  const { data: video, isLoading: videoLoading } = useVideo(videoId);
  const { data: clips = [], isLoading: clipsLoading } = useClips(videoId);
  const { data: job } = useJob(videoId);

  const isLoading = videoLoading || clipsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Vídeo não encontrado.</p>
        <Link to="/videos" className="text-primary hover:underline mt-2 block">
          Voltar para Vídeos
        </Link>
      </div>
    );
  }

  const isProcessing = video.status === "processing" || video.status === "queued";
  const topScore = clips[0]?.viral_score ?? null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/videos"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Vídeos
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">{video.title}</h1>
            <p className="text-muted-foreground mt-1 capitalize">{video.source_type}</p>
          </div>
          {topScore !== null && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground mb-1">Melhor score</p>
              <ViralScoreBadge score={topScore} size="lg" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Processing status */}
      {isProcessing && job && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProcessingStatus job={job} />
        </motion.div>
      )}

      {/* Clips list */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            {clips.length} clip{clips.length !== 1 ? "s" : ""} gerado{clips.length !== 1 ? "s" : ""}
          </h2>
          {clips.length > 0 && (
            <p className="text-xs text-muted-foreground">Ordenado por viral score</p>
          )}
        </div>

        {clips.length === 0 && !isProcessing && (
          <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
            <Scissors className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum clip gerado ainda.</p>
          </div>
        )}

        <div className="space-y-3">
          {clips.map((clip, i) => (
            <ClipCard key={clip.id} clip={clip} index={i} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
