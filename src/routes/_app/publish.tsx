import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Youtube,
  Send,
  Instagram,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  Scissors,
} from "lucide-react";
import { usePublications } from "@/lib/queries/usePublications";
import { mockClips } from "@/lib/mockData";
import type { Publication, PublishPlatform, PublishStatus } from "@/types/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/publish")({
  head: () => ({
    meta: [{ title: "Publicações — ArenaClips" }],
  }),
  component: PublishPage,
});

const platformConfig: Record<PublishPlatform, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  youtube: { icon: Youtube, label: "YouTube", color: "text-red-500" },
  tiktok: { icon: Send, label: "TikTok", color: "text-foreground" },
  instagram: { icon: Instagram, label: "Instagram", color: "text-pink-400" },
};

const statusConfig: Record<PublishStatus, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; spin?: boolean }> = {
  draft: { icon: Clock, label: "Rascunho", color: "text-muted-foreground" },
  publishing: { icon: Loader2, label: "Publicando…", color: "text-accent", spin: true },
  published: { icon: CheckCircle2, label: "Publicado", color: "text-primary" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-destructive" },
};

function PublicationRow({ pub, index }: { pub: Publication; index: number }) {
  const platform = platformConfig[pub.platform];
  const status = statusConfig[pub.status];
  const PlatformIcon = platform.icon;
  const StatusIcon = status.icon;

  const relatedClip = mockClips.find((c) => c.id === pub.clip_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
    >
      {/* Platform icon */}
      <div className="h-10 w-10 shrink-0 rounded-xl bg-surface flex items-center justify-center">
        <PlatformIcon className={cn("h-5 w-5", platform.color)} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm">{platform.label}</span>
          {pub.external_id && (
            <a
              href={`https://${pub.platform}.com/watch?v=${pub.external_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {relatedClip ? (
          <Link
            to="/clips/$clipId"
            params={{ clipId: relatedClip.id }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Scissors className="h-3 w-3" />
            {relatedClip.length_seconds}s · {relatedClip.transcript_excerpt?.slice(0, 50)}…
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">{pub.clip_id}</p>
        )}
      </div>

      {/* Date */}
      {pub.published_at && (
        <p className="text-xs text-muted-foreground hidden sm:block">
          {new Date(pub.published_at).toLocaleDateString("pt-BR")}
        </p>
      )}

      {/* Status */}
      <div className={cn("flex items-center gap-1.5 text-xs font-semibold shrink-0", status.color)}>
        <StatusIcon className={cn("h-3.5 w-3.5", status.spin && "animate-spin")} />
        {status.label}
      </div>
    </motion.div>
  );
}

function PublishPage() {
  const { data: publications = [], isLoading } = usePublications();

  const published = publications.filter((p) => p.status === "published");
  const pending = publications.filter((p) => p.status === "draft" || p.status === "publishing");
  const failed = publications.filter((p) => p.status === "failed");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-5xl">Publicações</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o status das suas publicações em cada plataforma.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Publicados", value: published.length, color: "text-primary" },
          { label: "Pendentes", value: pending.length, color: "text-accent" },
          { label: "Com falha", value: failed.length, color: "text-destructive" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={cn("font-display text-4xl", color)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Lists */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : publications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border bg-card py-20 text-center"
        >
          <Send className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-display text-3xl mb-2">Nenhuma publicação ainda</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Abra um clip e clique em "Publicar" para começar.
          </p>
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <Scissors className="h-4 w-4" />
            Ver clips
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-accent animate-spin" />
                Pendentes / Em andamento
              </h2>
              <div className="space-y-3">
                {pending.map((p, i) => <PublicationRow key={p.id} pub={p} index={i} />)}
              </div>
            </section>
          )}

          {published.length > 0 && (
            <section>
              <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Publicados
              </h2>
              <div className="space-y-3">
                {published.map((p, i) => <PublicationRow key={p.id} pub={p} index={i} />)}
              </div>
            </section>
          )}

          {failed.length > 0 && (
            <section>
              <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Com falha
              </h2>
              <div className="space-y-3">
                {failed.map((p, i) => <PublicationRow key={p.id} pub={p} index={i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
