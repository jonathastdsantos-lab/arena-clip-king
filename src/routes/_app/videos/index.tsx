import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Upload, Video, Plus, Filter } from "lucide-react";
import { useVideos } from "@/lib/queries/useVideos";
import { VideoCard } from "@/components/videos/VideoCard";

export const Route = createFileRoute("/_app/videos/")({
  head: () => ({
    meta: [{ title: "Vídeos — ArenaClips" }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { data: videos = [], isLoading } = useVideos();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-5xl">Vídeos</h1>
          <p className="text-muted-foreground mt-1">
            {videos.length} vídeo{videos.length !== 1 ? "s" : ""} na sua biblioteca
          </p>
        </div>
        <Link
          to="/videos/upload"
          id="btn-new-video"
          className="flex items-center gap-2 rounded-xl bg-gradient-hero px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
        >
          <Plus className="h-4 w-4" />
          Novo vídeo
        </Link>
      </motion.div>

      {/* Empty state */}
      {!isLoading && videos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-3xl mb-2">Nenhum vídeo ainda</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Envie sua primeira gravação e a IA encontra os melhores momentos automaticamente.
          </p>
          <Link
            to="/videos/upload"
            className="flex items-center gap-2 rounded-xl bg-gradient-hero px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <Upload className="h-4 w-4" />
            Enviar primeiro vídeo
          </Link>
        </motion.div>
      )}

      {/* Video list */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
