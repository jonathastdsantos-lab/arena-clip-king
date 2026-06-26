import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Play,
  CheckCircle2,
  Loader2,
  Youtube,
  Send,
  Instagram,
  Type,
  Image,
  Subtitles,
  Shield,
} from "lucide-react";
import { useClip } from "@/lib/queries/useClips";
import { useSelectTitle, useSelectThumbnail } from "@/lib/queries/useClips";
import { useCreatePublication } from "@/lib/queries/usePublications";
import { ViralScoreBadge } from "@/components/clips/ViralScoreBadge";
import { CopyrightReportCard } from "@/components/clips/CopyrightReport";
import { PublishDialog } from "@/components/publish/PublishDialog";
import { MomentCategoryBadge } from "@/components/biblioteca/MomentCategoryChip";
import { msToTimestamp } from "@/lib/mockData";
import type { PublishPlatform } from "@/types/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/clips/$clipId/")({
  head: () => ({
    meta: [{ title: "Editor de Clip — ArenaClips" }],
  }),
  component: ClipEditorPage,
});

const captionStyles = [
  { key: "cazetv", label: "CazéTV", desc: "Amarelo + contorno preto" },
  { key: "flow", label: "Flow", desc: "Branco minimalista" },
  { key: "cortes", label: "Cortes", desc: "Gradiente vibrante" },
  { key: "clean", label: "Clean", desc: "Sem estilo extra" },
];

type Tab = "titulo" | "thumbnail" | "legenda" | "copyright";

const tabs: { key: Tab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { key: "titulo", icon: Type, label: "Título" },
  { key: "thumbnail", icon: Image, label: "Thumbnail" },
  { key: "legenda", icon: Subtitles, label: "Legenda" },
  { key: "copyright", icon: Shield, label: "Copyright" },
];

function ClipEditorPage() {
  const { clipId } = Route.useParams();
  const { data: clip, isLoading } = useClip(clipId);
  const selectTitle = useSelectTitle();
  const selectThumbnail = useSelectThumbnail();
  const createPublication = useCreatePublication();

  const [activeTab, setActiveTab] = useState<Tab>("titulo");
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState("cazetv");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  async function handlePublish(platform: PublishPlatform) {
    await createPublication.mutateAsync({ clipId, platform });
    setPublishDialogOpen(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Clip não encontrado.</p>
        <Link to="/videos" className="text-primary hover:underline mt-2 block">Voltar</Link>
      </div>
    );
  }

  const selectedTitle = clip.titles?.find((t) => t.selected) ?? clip.titles?.[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/biblioteca"
          className="flex items-center gap-1 text-sm hover:opacity-80 mb-3"
          style={{ color: "#4A5A4A" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Biblioteca
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl md:text-5xl" style={{ color: "#F0F5F0" }}>
              Editor de Corte
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {clip.moment_category && (
                <MomentCategoryBadge category={clip.moment_category} />
              )}
              <span className="text-sm font-mono" style={{ color: "#4A5A4A" }}>
                {clip.length_seconds}s · {msToTimestamp(clip.start_ms)} → {msToTimestamp(clip.end_ms)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ViralScoreBadge score={clip.viral_score} size="lg" />
            <button
              id="btn-publish"
              onClick={() => setPublishDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-hero px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              <Send className="h-4 w-4" />
              Publicar
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: video player + editor tabs */}
        <div className="space-y-4">
          {/* Video player placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="aspect-video rounded-2xl border border-border bg-surface flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 grid-noise opacity-20" />
            <div className="relative text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-primary/30 transition-colors">
                <Play className="h-8 w-8 text-primary fill-current ml-1" />
              </div>
              <p className="text-sm text-muted-foreground">Preview do clip</p>
              <p className="text-xs text-muted-foreground/60">
                {clip.length_seconds}s · {msToTimestamp(clip.start_ms)}
              </p>
            </div>
          </motion.div>

          {/* Scores row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "Viral Score", value: clip.viral_score },
              { label: "Retenção", value: clip.retention_score },
              { label: "CTR Previsto", value: clip.ctr_score },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="font-display text-3xl text-primary">{value?.toFixed(0) ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-1 rounded-xl border border-border bg-card p-1 mb-4">
              {tabs.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  id={`tab-${key}`}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
                    activeTab === key
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Título tab */}
              {activeTab === "titulo" && (
                <motion.div
                  key="titulo"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-muted-foreground">
                    Selecione o título gerado pela IA ou escreva o seu:
                  </p>
                  {clip.titles?.map((title) => (
                    <button
                      key={title.id}
                      id={`btn-title-${title.id}`}
                      onClick={() => selectTitle.mutate({ clipId, titleId: title.id })}
                      className={cn(
                        "w-full text-left rounded-xl border p-4 text-sm transition-all",
                        title.selected
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center",
                            title.selected ? "border-primary" : "border-border"
                          )}
                        >
                          {title.selected && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <span className="leading-snug">{title.text}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Thumbnail tab */}
              {activeTab === "thumbnail" && (
                <motion.div
                  key="thumbnail"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {clip.thumbnails && clip.thumbnails.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {clip.thumbnails.map((thumb) => (
                        <button
                          key={thumb.id}
                          id={`btn-thumb-${thumb.id}`}
                          onClick={() => selectThumbnail.mutate({ clipId, thumbnailId: thumb.id })}
                          className={cn(
                            "relative aspect-video rounded-xl border overflow-hidden transition-all",
                            thumb.selected
                              ? "border-primary shadow-glow"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <div className="h-full w-full bg-surface flex items-center justify-center">
                            <Play className="h-6 w-6 text-primary/40" />
                          </div>
                          {thumb.tag && (
                            <div className="absolute bottom-0 inset-x-0 bg-background/80 px-2 py-1">
                              <p className="text-[10px] text-foreground truncate">{thumb.tag}</p>
                            </div>
                          )}
                          {thumb.selected && (
                            <div className="absolute top-1.5 right-1.5">
                              <CheckCircle2 className="h-5 w-5 text-primary fill-background" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground text-sm">
                      Thumbnails não geradas ainda.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Legenda tab */}
              {activeTab === "legenda" && (
                <motion.div
                  key="legenda"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {captionStyles.map((style) => (
                    <button
                      key={style.key}
                      id={`btn-caption-${style.key}`}
                      onClick={() => setSelectedCaptionStyle(style.key)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                        selectedCaptionStyle === style.key
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <div className="w-full aspect-video rounded-lg bg-surface mb-3 flex items-center justify-center">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            style.key === "cazetv" && "text-yellow-400",
                            style.key === "flow" && "text-white",
                            style.key === "cortes" && "bg-gradient-hero bg-clip-text text-transparent",
                            style.key === "clean" && "text-muted-foreground"
                          )}
                        >
                          Abc 123
                        </span>
                      </div>
                      <p className={cn("text-sm font-bold", selectedCaptionStyle === style.key ? "text-primary" : "text-foreground")}>
                        {style.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{style.desc}</p>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Copyright tab */}
              {activeTab === "copyright" && (
                <motion.div
                  key="copyright"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {clip.copyright_report ? (
                    <CopyrightReportCard report={clip.copyright_report} />
                  ) : (
                    <div
                      className="rounded-2xl p-10 text-center"
                      style={{ border: "1px dashed rgba(194,255,69,0.12)", background: "#141714" }}
                    >
                      <Shield className="h-10 w-10 mx-auto mb-3" style={{ color: "rgba(194,255,69,0.2)" }} />
                      <p className="text-sm" style={{ color: "#4A5A4A" }}>
                        Análise de copyright não disponível ainda.
                      </p>
                    </div>
                  )}
                  {/* Legal disclaimer — MANTER ESTE TEXTO EXATAMENTE */}
                  <div
                    className="rounded-xl p-4 text-xs leading-relaxed"
                    style={{
                      background: "rgba(194,255,69,0.04)",
                      border: "1px solid rgba(194,255,69,0.10)",
                      color: "#4A5A4A",
                    }}
                  >
                    <Shield className="h-3.5 w-3.5 inline-block mr-1.5 align-text-bottom" style={{ color: "#C2FF45" }} />
                    A ArenaClips ajuda você a publicar com segurança — sinalizamos riscos e sugerimos ajustes. A decisão final de publicação é sempre sua.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right: summary + transcript */}
        <div className="space-y-4">
          {/* Transcript */}
          {clip.transcript_excerpt && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Transcrição do trecho
              </h3>
              <blockquote className="border-l-2 border-primary pl-3 text-sm italic text-muted-foreground leading-relaxed">
                "{clip.transcript_excerpt}"
              </blockquote>
            </motion.div>
          )}

          {/* Selected title preview */}
          {selectedTitle && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Título selecionado
              </h3>
              <p className="text-sm font-semibold leading-snug">{selectedTitle.text}</p>
            </motion.div>
          )}

          {/* Publications */}
          {clip.publications && clip.publications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Publicações
              </h3>
              <div className="space-y-2">
                {clip.publications.map((pub) => {
                  const PlatformIcon = { youtube: Youtube, tiktok: Send, instagram: Instagram }[pub.platform] ?? Send;
                  return (
                    <div key={pub.id} className="flex items-center gap-3">
                      <PlatformIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize flex-1">{pub.platform}</span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          pub.status === "published" && "text-primary",
                          pub.status === "draft" && "text-muted-foreground",
                          pub.status === "failed" && "text-destructive"
                        )}
                      >
                        {pub.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onPublish={handlePublish}
        loading={createPublication.isPending}
        existingPublications={clip.publications ?? []}
      />
    </div>
  );
}
