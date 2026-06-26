import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Video,
  Scissors,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Play,
  ArrowRight,
} from "lucide-react";
import { useVideos } from "@/lib/queries/useVideos";
import { useClips } from "@/lib/queries/useClips";
import { useJobs } from "@/lib/queries/useJobs";
import { usePublications } from "@/lib/queries/usePublications";
import { mockVideos } from "@/lib/mockData";
import type { JobStage } from "@/types/db";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — ArenaClips" }],
  }),
  component: Dashboard,
});

const stageLabels: Record<JobStage, string> = {
  transcribing: "Transcrevendo…",
  detecting_moments: "Detectando momentos…",
  generating_clips: "Gerando clips…",
  scoring_viral: "Calculando score viral…",
  copyright_check: "Verificando direitos…",
  done: "Concluído",
};

const stageOrder: JobStage[] = [
  "transcribing",
  "detecting_moments",
  "generating_clips",
  "scoring_viral",
  "copyright_check",
  "done",
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <p className="mt-4 font-display text-4xl text-foreground">{value}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function Dashboard() {
  const { data: videos = [] } = useVideos();
  // Get clips for the first done video for stats
  const firstDoneVideo = videos.find((v) => v.status === "done");
  const { data: clipsOfFirst = [] } = useClips(firstDoneVideo?.id ?? "");
  const { data: jobs = [] } = useJobs();
  const { data: publications = [] } = usePublications();

  const totalVideos = videos.length;
  const totalClips = mockVideos.filter((v) => v.status === "done").length * 4; // approximate
  const activeJobs = jobs.filter((j) => j.status === "running" || j.status === "pending");
  const publishedCount = publications.filter((p) => p.status === "published").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-5xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Seus clipes virais estão sendo processados agora mesmo.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Video} label="Vídeos" value={totalVideos} sub="total enviados" delay={0} />
        <StatCard icon={Scissors} label="Clips gerados" value={12} sub="nesta semana" delay={0.05} />
        <StatCard icon={TrendingUp} label="Score médio" value="84.2" sub="viral score" delay={0.1} />
        <StatCard icon={Send} label="Publicações" value={publishedCount} sub="esta semana" delay={0.15} />
      </div>

      {/* Active processing jobs */}
      {activeJobs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Processando agora</h2>
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
          <div className="space-y-3">
            {activeJobs.map((job) => {
              const video = videos.find((v) => v.id === job.video_id);
              const stageIdx = stageOrder.indexOf(job.stage);
              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {video?.title ?? "Vídeo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stageLabels[job.stage]}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {Math.round(job.progress_pct)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-hero"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress_pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  {/* Stage steps */}
                  <div className="mt-3 flex gap-1">
                    {stageOrder.slice(0, -1).map((s, i) => (
                      <div
                        key={s}
                        className={`flex-1 h-1 rounded-full ${
                          i <= stageIdx
                            ? "bg-primary"
                            : "bg-surface"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Recent videos */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Vídeos recentes</h2>
          <Link
            to="/videos"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {videos.slice(0, 3).map((video) => (
            <Link
              key={video.id}
              to="/videos/$videoId"
              params={{ videoId: video.id }}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{video.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {video.source_type}
                  </p>
                </div>
              </div>
              <StatusBadge status={video.status} />
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Top clips */}
      {clipsOfFirst.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Clips em destaque</h2>
            <Link
              to="/clips"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {clipsOfFirst.slice(0, 3).map((clip) => (
              <Link
                key={clip.id}
                to="/clips/$clipId"
                params={{ clipId: clip.id }}
                className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="rounded-lg bg-surface px-2 py-1 text-xs font-semibold">
                    {clip.length_seconds}s
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      (clip.viral_score ?? 0) >= 90
                        ? "text-primary"
                        : (clip.viral_score ?? 0) >= 70
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    🔥 {clip.viral_score?.toFixed(0) ?? "—"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {clip.transcript_excerpt ?? "Sem transcrição"}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Editar clip <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    done: { icon: CheckCircle2, color: "text-primary", label: "Pronto" },
    processing: { icon: Loader2, color: "text-accent", label: "Processando", spin: true },
    queued: { icon: Clock, color: "text-muted-foreground", label: "Na fila" },
    uploading: { icon: Clock, color: "text-muted-foreground", label: "Enviando" },
    error: { icon: AlertCircle, color: "text-destructive", label: "Erro" },
  }[status] ?? { icon: Clock, color: "text-muted-foreground", label: status };

  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${config.color}`}>
      <Icon className={`h-3.5 w-3.5 ${"spin" in config && config.spin ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}
