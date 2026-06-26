import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Play, Clock, HardDrive, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import type { Video } from "@/types/db";
import { formatDuration, formatBytes } from "@/lib/mockData";

const statusConfig = {
  done: { label: "Pronto", color: "text-primary bg-primary/15 border-primary/30", icon: CheckCircle2 },
  processing: { label: "Processando", color: "text-accent bg-accent/15 border-accent/30", icon: Loader2, spin: true },
  queued: { label: "Na fila", color: "text-muted-foreground bg-surface border-border", icon: Clock },
  uploading: { label: "Enviando", color: "text-muted-foreground bg-surface border-border", icon: Loader2, spin: true },
  error: { label: "Erro", color: "text-destructive bg-destructive/10 border-destructive/30", icon: AlertCircle },
} as const;

const sourceTypeLabels = {
  jogo: "Jogo",
  live: "Live",
  podcast: "Podcast",
} as const;

interface VideoCardProps {
  video: Video;
  index?: number;
}

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  const status = statusConfig[video.status] ?? statusConfig.queued;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to="/videos/$videoId"
        params={{ videoId: video.id }}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 shadow-card transition-all hover:shadow-glow"
      >
        {/* Thumbnail placeholder */}
        <div className="relative h-16 w-28 shrink-0 rounded-lg bg-surface overflow-hidden flex items-center justify-center">
          <Play className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
          <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 text-[10px] font-mono text-foreground">
            {formatDuration(video.duration_seconds)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{video.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              {sourceTypeLabels[video.source_type]}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatBytes(video.size_bytes)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.color}`}
          >
            <StatusIcon className={`h-3 w-3 ${"spin" in status && status.spin ? "animate-spin" : ""}`} />
            {status.label}
          </span>
          {video.status === "done" && (
            <span className="flex items-center gap-0.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Ver clips <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
