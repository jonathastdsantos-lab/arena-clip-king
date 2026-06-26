import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, Scissors, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Video } from "@/types/db";
import { formatDuration, formatBytes } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const statusConfig = {
  done: {
    label: "Processado",
    color: "#6FE08A",
    bg: "rgba(111,224,138,0.12)",
    border: "rgba(111,224,138,0.25)",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processando",
    color: "#FFD43B",
    bg: "rgba(255,212,59,0.12)",
    border: "rgba(255,212,59,0.25)",
    icon: Loader2,
    spin: true,
  },
  queued: {
    label: "Na fila",
    color: "#6B7A6B",
    bg: "rgba(107,122,107,0.10)",
    border: "rgba(107,122,107,0.20)",
    icon: Clock,
  },
  uploading: {
    label: "Enviando",
    color: "#6B7A6B",
    bg: "rgba(107,122,107,0.10)",
    border: "rgba(107,122,107,0.20)",
    icon: Loader2,
    spin: true,
  },
  error: {
    label: "Erro",
    color: "#FF7A6B",
    bg: "rgba(255,122,107,0.10)",
    border: "rgba(255,122,107,0.25)",
    icon: AlertCircle,
  },
} as const;

interface VideoRowProps {
  video: Video;
  clipCount?: number;
  index?: number;
}

export function VideoRow({ video, clipCount = 0, index = 0 }: VideoRowProps) {
  const status = statusConfig[video.status] ?? statusConfig.queued;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
    >
      <Link
        to="/videos/$videoId"
        params={{ videoId: video.id }}
        className="group flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-white/3"
        style={{ borderBottom: "1px solid rgba(194,255,69,0.04)" }}
      >
        {/* Clip count */}
        <div
          className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(194,255,69,0.08)" }}
        >
          <Scissors className="h-4 w-4" style={{ color: "#C2FF45" }} />
        </div>

        {/* Title & meta */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#F0F5F0] text-sm truncate group-hover:text-white transition-colors">
            {video.title}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[11px]" style={{ color: "#3A4A3A" }}>
              {formatDuration(video.duration_seconds)}
            </span>
            <span className="font-mono text-[11px]" style={{ color: "#3A4A3A" }}>
              {formatBytes(video.size_bytes)}
            </span>
            {clipCount > 0 && (
              <span className="text-[11px] font-semibold" style={{ color: "#C2FF45" }}>
                {clipCount} corte{clipCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shrink-0"
          style={{
            color: status.color,
            background: status.bg,
            border: `1px solid ${status.border}`,
          }}
        >
          <StatusIcon
            className={cn("h-3 w-3", "spin" in status && status.spin && "animate-spin")}
          />
          {status.label}
        </div>
      </Link>
    </motion.div>
  );
}
