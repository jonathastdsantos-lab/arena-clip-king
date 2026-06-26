import { AlertCircle, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import type { CopyrightReport, CopyrightReportItem, RiskLevel } from "@/types/db";
import { cn } from "@/lib/utils";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  ok: {
    label: "Baixo risco",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: CheckCircle2,
  },
  medium: {
    label: "Risco médio",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    icon: AlertTriangle,
  },
  high: {
    label: "Alto risco",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertCircle,
  },
};

interface CopyrightReportProps {
  report: CopyrightReport & { items: CopyrightReportItem[] };
}

export function CopyrightReportCard({ report }: CopyrightReportProps) {
  const config = riskConfig[report.overall_risk];
  const RiskIcon = config.icon;

  return (
    <div className={cn("rounded-2xl border p-5", config.border, config.bg)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", config.bg)}>
          <Shield className={cn("h-5 w-5", config.color)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Análise de direitos autorais</h3>
            <span className={cn("flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold", config.border, config.color)}>
              <RiskIcon className="h-3 w-3" />
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modelo: {report.model_version}
          </p>
        </div>
      </div>

      {/* Summary */}
      {report.summary_text && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {report.summary_text}
        </p>
      )}

      {/* Signal items */}
      <div className="space-y-2">
        {report.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl bg-background/40 p-3"
          >
            {item.signal_status === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.value_text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
