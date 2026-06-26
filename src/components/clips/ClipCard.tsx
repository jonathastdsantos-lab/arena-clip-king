import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Play, Clock, ArrowRight } from "lucide-react";
import { ViralScoreRing } from "./ViralScoreBadge";
import type { Clip } from "@/types/db";
import { msToTimestamp } from "@/lib/mockData";

const statusColors = {
  generated: "text-muted-foreground bg-surface border-border",
  published: "text-primary bg-primary/15 border-primary/30",
  archived: "text-muted-foreground/50 bg-surface/50 border-border/50",
};

const statusLabels = {
  generated: "Gerado",
  published: "Publicado",
  archived: "Arquivado",
};

interface ClipCardProps {
  clip: Clip;
  index?: number;
}

export function ClipCard({ clip, index = 0 }: ClipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to="/clips/$clipId"
        params={{ clipId: clip.id }}
        className="group relative flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 shadow-card transition-all hover:shadow-glow overflow-hidden"
      >
        {/* Subtle bg glow for top clips */}
        {(clip.viral_score ?? 0) >= 90 && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        )}

        {/* Thumbnail placeholder */}
        <div className="relative h-20 w-32 shrink-0 rounded-lg bg-surface overflow-hidden flex items-center justify-center">
          <Play className="h-7 w-7 text-primary/60 group-hover:text-primary transition-colors group-hover:scale-110 duration-200" />
          <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5">
            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] font-mono text-foreground">{clip.length_seconds}s</span>
          </div>
          <div className="absolute top-1 right-1 text-[10px] font-mono text-muted-foreground bg-background/60 rounded px-1">
            {msToTimestamp(clip.start_ms)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors[clip.status]}`}>
              {statusLabels[clip.status]}
            </span>
          </div>
          {clip.transcript_excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              "{clip.transcript_excerpt}"
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {clip.retention_score !== null && (
              <span>Retenção: {clip.retention_score.toFixed(0)}</span>
            )}
            {clip.ctr_score !== null && (
              <span>CTR: {clip.ctr_score.toFixed(0)}</span>
            )}
          </div>
        </div>

        {/* Score + arrow */}
        <div className="flex flex-col items-end gap-2">
          <ViralScoreRing score={clip.viral_score} />
          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}
