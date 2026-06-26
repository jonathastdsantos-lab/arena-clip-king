import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CloudUpload,
  Gamepad2,
  Mic2,
  Radio,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCreateVideo } from "@/lib/queries/useVideos";
import { useJob } from "@/lib/queries/useJobs";
import { useJobRealtime } from "@/hooks/useJobRealtime";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { supabase, isMockMode } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { formatBytes } from "@/lib/mockData";
import type { VideoSourceType } from "@/types/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({
    meta: [{ title: "Novo Upload — ArenaClips" }],
  }),
  component: UploadPage,
});

const SOURCE_TYPES: {
  key: VideoSourceType;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  desc: string;
}[] = [
  { key: "jogo", icon: Gamepad2, label: "Jogo completo", desc: "Transmissão ou gravação de partida" },
  { key: "live", icon: Radio, label: "Live-Entrevista", desc: "Live de reação, análise ou gameplay" },
  { key: "podcast", icon: Mic2, label: "Podcast esportivo", desc: "Episódio de podcast" },
];

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"];
const MAX_SIZE_BYTES = 5 * 1e9; // 5 GB

function UploadPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const createVideo = useCreateVideo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<VideoSourceType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  type Step = "form" | "uploading" | "processing" | "done";
  const [step, setStep] = useState<Step>("form");

  // Real-time subscription to the job when processing
  useJobRealtime(jobId);
  const { data: job } = useJob(videoId ?? "");

  // Auto-redirect when job is done
  useEffect(() => {
    if (job?.status === "done" || job?.stage === "done") {
      setStep("done");
      const timer = setTimeout(() => navigate({ to: "/biblioteca" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [job, navigate]);

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type)) return "Formato não suportado. Use MP4 ou MOV.";
    if (f.size > MAX_SIZE_BYTES) return `Arquivo muito grande. Máximo: 5 GB.`;
    return null;
  }

  function handleFileSelected(f: File) {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setFile(f);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelected(f);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !sourceType) return;

    setError(null);
    setStep("uploading");

    try {
      const userId = session?.user?.id ?? "demo";
      const fileName = `${userId}/${Date.now()}-${file.name}`;

      if (!isMockMode) {
        // Real upload to Supabase Storage with progress
        const { error: uploadError } = await supabase.storage
          .from("raw-videos")
          .upload(fileName, file, {
            onUploadProgress: (progress) => {
              setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
            },
          } as Parameters<typeof supabase.storage.from>["0"] extends never
            ? never
            : Parameters<typeof supabase.storage.from("x").upload>[2]);

        if (uploadError) throw uploadError;
      } else {
        // Simulate upload in mock mode
        for (let p = 0; p <= 100; p += 15) {
          await new Promise((r) => setTimeout(r, 120));
          setUploadProgress(p);
        }
        setUploadProgress(100);
      }

      // Create video record
      const newVideo = await createVideo.mutateAsync({
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        source_type: sourceType,
        storage_path: fileName,
        size_bytes: file.size,
      });

      setVideoId(newVideo.id);

      // Create processing job via Edge Function (or mock in demo mode)
      if (!isMockMode) {
        const { data: { session: s } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-upload-job`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${s?.access_token}`,
            },
            body: JSON.stringify({ video_id: newVideo.id }),
          }
        );
        const data = await res.json();
        if (data.job_id) setJobId(data.job_id);
      }

      setStep("processing");

    } catch (err) {
      console.error(err);
      setError("Falha no envio. Verifique sua conexão e tente novamente.");
      setStep("form");
      setUploadProgress(0);
    }
  }

  const canSubmit = !!file && !!sourceType;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/biblioteca"
          className="flex items-center gap-1 text-sm mb-3 transition-colors hover:opacity-80"
          style={{ color: "#4A5A4A" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Biblioteca
        </Link>
        <h1 className="font-display text-5xl" style={{ color: "#F0F5F0" }}>
          Novo Upload
        </h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── FORM ── */}
        {step === "form" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Dropzone */}
            {!file ? (
              <div
                id="dropzone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl py-20 text-center transition-all"
                style={{
                  border: `2px dashed ${dragOver ? "#C2FF45" : "rgba(194,255,69,0.15)"}`,
                  background: dragOver ? "rgba(194,255,69,0.06)" : "#141714",
                }}
              >
                <input
                  ref={fileInputRef}
                  id="input-file"
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelected(f);
                  }}
                />
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(194,255,69,0.10)" }}
                >
                  <CloudUpload
                    className="h-8 w-8"
                    style={{ color: dragOver ? "#C2FF45" : "rgba(194,255,69,0.5)" }}
                  />
                </div>
                <p className="font-display text-3xl mb-2" style={{ color: "#F0F5F0" }}>
                  {dragOver ? "Solte aqui!" : "Arraste o vídeo"}
                </p>
                <p className="text-sm mb-1" style={{ color: "#4A5A4A" }}>
                  ou clique para selecionar
                </p>
                <p className="text-xs font-mono" style={{ color: "#3A4A3A" }}>
                  MP4 ou MOV · até 5 GB
                </p>
              </div>
            ) : (
              <div
                className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: "#141714", border: "1px solid rgba(194,255,69,0.15)" }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(194,255,69,0.10)" }}
                >
                  <CheckCircle2 className="h-5 w-5" style={{ color: "#C2FF45" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#F0F5F0" }}>
                    {file.name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "#4A5A4A" }}>
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs underline transition-opacity hover:opacity-70"
                  style={{ color: "#4A5A4A" }}
                >
                  Trocar
                </button>
              </div>
            )}

            {/* Source type */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "#3A4A3A" }}
              >
                Tipo de conteúdo
              </p>
              <div className="grid grid-cols-3 gap-3">
                {SOURCE_TYPES.map(({ key, icon: Icon, label, desc }) => {
                  const active = sourceType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      id={`btn-source-${key}`}
                      onClick={() => setSourceType(key)}
                      className="flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5"
                      style={{
                        background: active ? "rgba(194,255,69,0.10)" : "#141714",
                        border: `1px solid ${active ? "rgba(194,255,69,0.35)" : "rgba(194,255,69,0.08)"}`,
                        boxShadow: active ? "0 0 20px -6px rgba(194,255,69,0.20)" : "none",
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: active ? "#C2FF45" : "#4A5A4A" }}
                      />
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: active ? "#C2FF45" : "#F0F5F0" }}
                        >
                          {label}
                        </p>
                        <p className="text-[10px] leading-tight mt-0.5" style={{ color: "#4A5A4A" }}>
                          {desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(255,122,107,0.08)",
                  border: "1px solid rgba(255,122,107,0.20)",
                  color: "#FF7A6B",
                }}
              >
                {error}
              </p>
            )}

            <button
              id="btn-gerar-cortes"
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl py-4 text-sm font-bold transition-all"
              style={{
                background: canSubmit ? "#C2FF45" : "rgba(194,255,69,0.15)",
                color: canSubmit ? "#0C0F0D" : "#3A4A3A",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 0 30px -8px rgba(194,255,69,0.4)" : "none",
              }}
            >
              Gerar cortes com IA →
            </button>
          </motion.form>
        )}

        {/* ── UPLOADING ── */}
        {step === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: "#141714", border: "1px solid rgba(194,255,69,0.10)" }}
          >
            <p className="font-display text-3xl mb-6" style={{ color: "#F0F5F0" }}>
              Enviando arquivo…
            </p>
            <div
              className="h-2 rounded-full overflow-hidden mb-3"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #C2FF45, #D4FF6B)" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="font-display text-2xl" style={{ color: "#C2FF45" }}>
              {uploadProgress}%
            </p>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {step === "processing" && job && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-8"
            style={{ background: "#141714", border: "1px solid rgba(194,255,69,0.10)" }}
          >
            <p
              className="font-display text-3xl mb-6"
              style={{ color: "#F0F5F0" }}
            >
              Processando com IA…
            </p>
            <UploadProgress job={job} />
          </motion.div>
        )}

        {/* ── PROCESSING (mock — no real job yet) ── */}
        {step === "processing" && !job && (
          <motion.div
            key="processing-mock"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: "#141714", border: "1px solid rgba(194,255,69,0.10)" }}
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(194,255,69,0.10)" }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: "#C2FF45" }} />
            </div>
            <p className="font-display text-3xl mb-2" style={{ color: "#F0F5F0" }}>
              Vídeo enviado!
            </p>
            <p className="text-sm" style={{ color: "#4A5A4A" }}>
              No modo demo, o processamento não é real. Veja os clips de exemplo na Biblioteca.
            </p>
            <Link
              to="/biblioteca"
              className="inline-block mt-5 rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: "#C2FF45", color: "#0C0F0D" }}
            >
              Ver Biblioteca →
            </Link>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-10 text-center"
            style={{
              background: "#141714",
              border: "1px solid rgba(111,224,138,0.25)",
              boxShadow: "0 0 40px -12px rgba(111,224,138,0.20)",
            }}
          >
            <CheckCircle2
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: "#6FE08A" }}
            />
            <p className="font-display text-3xl mb-2" style={{ color: "#6FE08A" }}>
              Processamento concluído!
            </p>
            <p className="text-sm" style={{ color: "#4A5A4A" }}>
              Redirecionando para a Biblioteca…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
