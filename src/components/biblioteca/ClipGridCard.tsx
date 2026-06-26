import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import type { Clip, CopyrightReport } from "@/types/db";
import { msToTimestamp } from "@/lib/mockData";
import { MomentCategoryBadge } from "./MomentCategoryChip";

function RiskBadge({ risk }: { risk: "ok" | "medium" | "high" }) {
  const config = {
    ok: { label: "OK", color: "#6FE08A", bg: "rgba(111,224,138,0.12)", border: "rgba(111,224,138,0.25)" },
    medium: { label: "Médio", color: "#FFD43B", bg: "rgba(255,212,59,0.12)", border: "rgba(255,212,59,0.25)" },
    high: { label: "Alto", color: "#FF7A6B", bg: "rgba(255,122,107,0.12)", border: "rgba(255,122,107,0.25)" },
  }[risk];

  return (
    <span
      className="inline-flex items-center rounded-full text-[10px] font-bold px-2 py-0.5"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
    >
      ©{config.label}
    </span>
  );
}

interface ScoreBarProps {
  label: string;
  value: number | null;
  color: string;
}

function ScoreBar({ label, value, color }: ScoreBarProps) {
  if (value === null) return null;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono" style={{ color: "#3A4A3A" }}>{label}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>{value.toFixed(0)}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

interface ClipGridCardProps {
  clip: Clip & { copyright_report?: CopyrightReport | null };
  index?: number;
}

export function ClipGridCard({ clip, index = 0 }: ClipGridCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link
        to="/clips/$clipId"
        params={{ clipId: clip.id }}
        className="group flex flex-col rounded-xl overflow-hidden transition-all hover:-translate-y-1"
        style={{
          background: "#161A16",
          border: "1px solid rgba(194,255,69,0.08)",
          boxShadow: "0 4px 24px -8px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = "1px solid rgba(194,255,69,0.25)";
          e.currentTarget.style.boxShadow = "0 0 30px -8px rgba(194,255,69,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = "1px solid rgba(194,255,69,0.08)";
          e.currentTarget.style.boxShadow = "0 4px 24px -8px rgba(0,0,0,0.5)";
        }}
      >
        {/* Thumbnail */}
        <div
          className="relative aspect-video flex items-center justify-center"
          style={{ background: "#0C0F0D" }}
        >
          <Play
            className="h-8 w-8 transition-transform group-hover:scale-110"
            style={{ color: "rgba(194,255,69,0.5)" }}
          />

          {/* Viral Score */}
          {clip.viral_score !== null && (
            <div
              className="absolute top-2 right-2 rounded-lg px-2 py-1"
              style={{ background: "rgba(12,15,13,0.85)" }}
            >
              <span
                className="font-display text-xl"
                style={{
                  color: clip.viral_score >= 90 ? "#C2FF45" :
                         clip.viral_score >= 75 ? "#6FE08A" : "#FFD43B",
                }}
              >
                {clip.viral_score.toFixed(0)}
              </span>
            </div>
          )}

          {/* Duration */}
          <div
            className="absolute bottom-2 left-2 rounded px-2 py-0.5 font-mono text-[11px]"
            style={{ background: "rgba(12,15,13,0.85)", color: "#6B7A6B" }}
          >
            {clip.length_seconds}s · {msToTimestamp(clip.start_ms)}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <MomentCategoryBadge category={clip.moment_category} />
            {clip.copyright_report && (
              <RiskBadge risk={clip.copyright_report.overall_risk} />
            )}
          </div>

          {/* Transcript excerpt */}
          {clip.transcript_excerpt && (
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: "#6B7A6B" }}
            >
              {clip.transcript_excerpt}
            </p>
          )}

          {/* Score bars */}
          <div className="space-y-1.5">
            <ScoreBar label="Retenção" value={clip.retention_score} color="#6FE08A" />
            <ScoreBar label="CTR" value={clip.ctr_score} color="#FFD43B" />
            <ScoreBar label="Viral" value={clip.viral_score} color="#C2FF45" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
