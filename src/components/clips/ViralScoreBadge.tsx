import { cn } from "@/lib/utils";

interface ViralScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreConfig(score: number) {
  if (score >= 90) return { label: "Viral", color: "text-primary bg-primary/15 border-primary/40", glow: true, emoji: "🔥" };
  if (score >= 75) return { label: "Alto", color: "text-accent bg-accent/15 border-accent/40", glow: false, emoji: "⚡" };
  if (score >= 55) return { label: "Médio", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", glow: false, emoji: "✨" };
  return { label: "Baixo", color: "text-muted-foreground bg-surface border-border", glow: false, emoji: "·" };
}

export function ViralScoreBadge({ score, size = "md", showLabel = true }: ViralScoreBadgeProps) {
  if (score === null) {
    return (
      <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-xs text-muted-foreground">
        —
      </span>
    );
  }

  const config = getScoreConfig(score);
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-bold",
        config.color,
        config.glow && "shadow-glow",
        sizeClasses
      )}
    >
      <span>{config.emoji}</span>
      <span>{score.toFixed(0)}</span>
      {showLabel && <span className="opacity-70">{config.label}</span>}
    </span>
  );
}

// Mini circular progress version for cards
export function ViralScoreRing({ score }: { score: number | null }) {
  if (score === null) return null;
  const config = getScoreConfig(score);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strokeColor = score >= 90 ? "oklch(0.8 0.14 172)" : score >= 75 ? "oklch(0.9 0.16 158)" : "oklch(0.8 0.15 85)";

  return (
    <div className="relative h-12 w-12">
      <svg className="absolute inset-0 -rotate-90" width={48} height={48} viewBox="0 0 48 48">
        <circle cx={24} cy={24} r={radius} fill="none" stroke="oklch(0.3 0.04 220)" strokeWidth={4} />
        <circle
          cx={24}
          cy={24}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">{score.toFixed(0)}</span>
      </div>
    </div>
  );
}
