import { AnimatePresence, motion } from "motion/react";
import { X, Youtube, Send, Instagram, Loader2, CheckCircle2 } from "lucide-react";
import type { Publication, PublishPlatform } from "@/types/db";
import { cn } from "@/lib/utils";

const platforms: { key: PublishPlatform; icon: React.ComponentType<{ className?: string }>; label: string; color: string }[] = [
  { key: "youtube", icon: Youtube, label: "YouTube Shorts", color: "text-red-500" },
  { key: "tiktok", icon: Send, label: "TikTok", color: "text-foreground" },
  { key: "instagram", icon: Instagram, label: "Instagram Reels", color: "text-pink-400" },
];

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  onPublish: (platform: PublishPlatform) => Promise<void>;
  loading: boolean;
  existingPublications: Publication[];
}

export function PublishDialog({
  open,
  onClose,
  onPublish,
  loading,
  existingPublications,
}: PublishDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-3xl">Publicar clip</h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-5">
                Escolha a plataforma onde deseja publicar este clip:
              </p>

              <div className="space-y-2">
                {platforms.map(({ key, icon: Icon, label, color }) => {
                  const existing = existingPublications.find((p) => p.platform === key);
                  const isPublished = existing?.status === "published";
                  const isDraft = existing?.status === "draft";

                  return (
                    <button
                      key={key}
                      id={`btn-publish-${key}`}
                      onClick={() => !isPublished && !loading && onPublish(key)}
                      disabled={loading || isPublished}
                      className={cn(
                        "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                        isPublished
                          ? "border-primary/30 bg-primary/5 cursor-default"
                          : "border-border bg-surface/50 hover:border-primary/40 hover:bg-surface cursor-pointer"
                      )}
                    >
                      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                        <Icon className={cn("h-5 w-5", color)} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{label}</p>
                        {isDraft && (
                          <p className="text-xs text-muted-foreground">Rascunho salvo</p>
                        )}
                      </div>
                      {loading ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : isPublished ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground text-center">
                A publicação será agendada e processada pelo worker.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
