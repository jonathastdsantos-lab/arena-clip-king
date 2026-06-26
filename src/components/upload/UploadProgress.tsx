import { motion } from "motion/react";
import { Check, Loader2, Circle, AlertCircle } from "lucide-react";
import type { ProcessingJob, JobStage } from "@/types/db";

const STAGES: { key: JobStage; label: string }[] = [
  { key: "transcribing", label: "Transcrevendo áudio" },
  { key: "detecting_moments", label: "Detectando momentos épicos" },
  { key: "generating_clips", label: "Gerando cortes" },
  { key: "scoring_viral", label: "Calculando score viral" },
  { key: "copyright_check", label: "Análise de copyright" },
  { key: "done", label: "Concluído!" },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

interface UploadProgressProps {
  job: ProcessingJob;
}

export function UploadProgress({ job }: UploadProgressProps) {
  const currentIdx = STAGE_ORDER.indexOf(job.stage);
  const isDone = job.stage === "done" || job.status === "done";
  const isFailed = job.status === "failed";

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "#F0F5F0" }}>
            {isFailed ? "Processamento falhou" : isDone ? "Pronto! 🎉" : STAGES[Math.max(0, currentIdx)]?.label}
          </span>
          <span
            className="font-display text-2xl"
            style={{ color: isFailed ? "#FF7A6B" : "#C2FF45" }}
          >
            {Math.round(job.progress_pct)}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isFailed
                ? "#FF7A6B"
                : "linear-gradient(90deg, #C2FF45, #D4FF6B)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${job.progress_pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stage list */}
      <div className="space-y-3">
        {STAGES.slice(0, 5).map((stage, i) => {
          const isPast = i < currentIdx || isDone;
          const isCurrent = i === currentIdx && !isDone && !isFailed;
          const isUpcoming = i > currentIdx && !isDone;

          return (
            <div key={stage.key} className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center"
                style={{
                  background: isPast
                    ? "rgba(111,224,138,0.15)"
                    : isCurrent
                    ? "rgba(194,255,69,0.12)"
                    : "rgba(255,255,255,0.04)",
                  border: isPast
                    ? "1px solid rgba(111,224,138,0.30)"
                    : isCurrent
                    ? "1px solid rgba(194,255,69,0.30)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {isPast ? (
                  <Check className="h-3 w-3" style={{ color: "#6FE08A" }} />
                ) : isCurrent ? (
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    style={{ color: "#C2FF45" }}
                  />
                ) : isFailed && i === currentIdx ? (
                  <AlertCircle className="h-3 w-3" style={{ color: "#FF7A6B" }} />
                ) : (
                  <Circle className="h-3 w-3" style={{ color: "rgba(255,255,255,0.10)" }} />
                )}
              </div>

              {/* Label */}
              <span
                className="text-sm"
                style={{
                  color: isPast
                    ? "#6FE08A"
                    : isCurrent
                    ? "#F0F5F0"
                    : isUpcoming
                    ? "#3A4A3A"
                    : "#4A5A4A",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {stage.label}
              </span>

              {/* Worker tag */}
              {isCurrent && job.claimed_by && (
                <span
                  className="ml-auto text-[10px] font-mono"
                  style={{ color: "#3A4A3A" }}
                >
                  {job.claimed_by}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && job.error_message && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: "rgba(255,122,107,0.08)",
            border: "1px solid rgba(255,122,107,0.20)",
            color: "#FF7A6B",
          }}
        >
          {job.error_message}
        </div>
      )}
    </div>
  );
}
