import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { ProcessingJob, JobStage } from "@/types/db";

const stageLabels: Record<JobStage, string> = {
  transcribing: "Transcrevendo áudio…",
  detecting_moments: "Detectando momentos épicos…",
  generating_clips: "Gerando clipes…",
  scoring_viral: "Calculando viral score…",
  copyright_check: "Verificando direitos autorais…",
  done: "Processamento concluído!",
};

const stageOrder: JobStage[] = [
  "transcribing",
  "detecting_moments",
  "generating_clips",
  "scoring_viral",
  "copyright_check",
  "done",
];

interface ProcessingStatusProps {
  job: ProcessingJob;
}

export function ProcessingStatus({ job }: ProcessingStatusProps) {
  const currentStageIdx = stageOrder.indexOf(job.stage);
  const isDone = job.stage === "done" || job.status === "done";
  const isFailed = job.status === "failed";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">
            {isFailed ? "Processamento falhou" : stageLabels[job.stage]}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isFailed ? job.error_message ?? "Erro desconhecido" : `Worker: ${job.claimed_by ?? "aguardando"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isDone && !isFailed && (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          )}
          <span
            className={`text-xl font-bold ${
              isDone ? "text-primary" : isFailed ? "text-destructive" : "text-foreground"
            }`}
          >
            {Math.round(job.progress_pct)}%
          </span>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="h-3 rounded-full bg-surface overflow-hidden mb-5">
        <motion.div
          className={`h-full rounded-full ${isFailed ? "bg-destructive" : "bg-gradient-hero"}`}
          initial={{ width: 0 }}
          animate={{ width: `${job.progress_pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Stage steps */}
      <div className="grid grid-cols-5 gap-2">
        {stageOrder.slice(0, 5).map((stage, i) => {
          const isPast = i < currentStageIdx;
          const isCurrent = i === currentStageIdx && !isDone;
          const isUpcoming = i > currentStageIdx;
          return (
            <div key={stage} className="text-center">
              <div
                className={`h-1 rounded-full mb-1.5 ${
                  isPast || isDone
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary/60"
                    : "bg-surface"
                }`}
              />
              <p
                className={`text-[10px] leading-tight ${
                  isCurrent ? "text-primary font-semibold" : isUpcoming ? "text-muted-foreground/50" : "text-muted-foreground"
                }`}
              >
                {stageLabels[stage].split("…")[0].split("!")[0]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
