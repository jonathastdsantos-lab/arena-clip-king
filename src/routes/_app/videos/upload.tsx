import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  CloudUpload,
  Video,
  Gamepad2,
  Mic2,
  Radio,
  ChevronLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCreateVideo } from "@/lib/queries/useVideos";
import type { VideoSourceType } from "@/types/db";
import { formatBytes } from "@/lib/mockData";

export const Route = createFileRoute("/_app/videos/upload")({
  head: () => ({
    meta: [{ title: "Novo Vídeo — ArenaClips" }],
  }),
  component: UploadPage,
});

const sourceTypes: { key: VideoSourceType; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }[] = [
  { key: "jogo", icon: Gamepad2, label: "Jogo", desc: "Transmissão ou gravação de partida" },
  { key: "live", icon: Radio, label: "Live", desc: "Live de reação, análise ou gameplay" },
  { key: "podcast", icon: Mic2, label: "Podcast", desc: "Episódio de podcast esportivo" },
];

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
const MAX_SIZE_GB = 10;

function UploadPage() {
  const navigate = useNavigate();
  const createVideo = useCreateVideo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<VideoSourceType>("jogo");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<"pick" | "details" | "uploading" | "done">("pick");
  const [error, setError] = useState<string | null>(null);

  function acceptFile(f: File) {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Formato não suportado. Use MP4, WebM, MOV ou AVI.");
      return;
    }
    if (f.size > MAX_SIZE_GB * 1e9) {
      setError(`Arquivo muito grande. Máximo: ${MAX_SIZE_GB} GB.`);
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    setStep("details");
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) acceptFile(f);
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setStep("uploading");

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);

    try {
      await createVideo.mutateAsync({
        title: title.trim(),
        source_type: sourceType,
        storage_path: `raw-videos/${Date.now()}-${file.name}`,
        size_bytes: file.size,
      });
      clearInterval(interval);
      setUploadProgress(100);
      setStep("done");
      setTimeout(() => navigate({ to: "/videos" }), 2000);
    } catch {
      clearInterval(interval);
      setError("Falha no envio. Tente novamente.");
      setStep("details");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link
          to="/videos"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div>
          <h1 className="font-display text-5xl">Novo Vídeo</h1>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: File picker */}
        {step === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div
              id="dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input
                ref={fileInputRef}
                id="input-file"
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
              />
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15">
                <CloudUpload className={`h-8 w-8 ${dragOver ? "text-primary" : "text-primary/70"}`} />
              </div>
              <p className="font-display text-3xl mb-2">
                {dragOver ? "Solte aqui!" : "Arraste o vídeo"}
              </p>
              <p className="text-muted-foreground text-sm mb-2">
                ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, WebM, MOV, AVI — até {MAX_SIZE_GB} GB
              </p>
            </div>
            {error && (
              <p className="mt-3 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
                {error}
              </p>
            )}
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === "details" && file && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            {/* File preview */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setStep("pick"); }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
              >
                Trocar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Título do vídeo
                </label>
                <input
                  id="input-video-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Flamengo x Palmeiras — Final Brasileirão"
                  className="w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Source type */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Tipo de conteúdo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {sourceTypes.map(({ key, icon: Icon, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      id={`btn-source-${key}`}
                      onClick={() => setSourceType(key)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                        sourceType === key
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${sourceType === key ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-sm font-bold ${sourceType === key ? "text-primary" : "text-foreground"}`}>
                          {label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <button
                id="btn-start-upload"
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-hero py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                <Upload className="h-4 w-4" />
                Enviar e processar com IA
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 3: Uploading */}
        {step === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border bg-card p-10 text-center"
          >
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h3 className="font-display text-3xl mb-2">Enviando…</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Aguarde enquanto fazemos o upload e enfileiramos o processamento.
            </p>
            <div className="h-3 rounded-full bg-surface overflow-hidden mx-8">
              <motion.div
                className="h-full rounded-full bg-gradient-hero"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-sm font-bold text-primary">{Math.round(uploadProgress)}%</p>
          </motion.div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/40 bg-card p-10 text-center shadow-glow"
          >
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/20">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-3xl mb-2 text-primary">Vídeo enviado!</h3>
            <p className="text-muted-foreground text-sm">
              A IA já está trabalhando nos seus clips. Redirecionando…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
