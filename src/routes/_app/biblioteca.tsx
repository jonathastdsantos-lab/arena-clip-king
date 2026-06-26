import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Plus, Upload, Loader2, Library } from "lucide-react";
import { useVideos } from "@/lib/queries/useVideos";
import { useClips } from "@/lib/queries/useClips";
import { useAuth } from "@/hooks/useAuth";
import { useVideosRealtime } from "@/hooks/useVideosRealtime";
import { VideoRow } from "@/components/biblioteca/VideoRow";
import { ClipGridCard } from "@/components/biblioteca/ClipGridCard";
import { CategoryFilterBar } from "@/components/biblioteca/MomentCategoryChip";
import { mockClips, mockCopyrightReports } from "@/lib/mockData";
import type { MomentCategory } from "@/types/db";

export const Route = createFileRoute("/_app/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — ArenaClips" },
      { name: "description", content: "Seus vídeos e cortes gerados com IA." },
    ],
  }),
  component: BibliotecaPage,
});

type Tab = "tudo" | "videos" | "cortes";

function BibliotecaPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  // Enable Realtime for live status updates
  useVideosRealtime(userId);

  const { data: videos = [], isLoading: videosLoading } = useVideos();
  // For clips listing we use all clips from all videos
  const allClips = useMemo(() => {
    // In mock mode / real mode: join copyright reports for display
    return mockClips.map((clip) => ({
      ...clip,
      copyright_report: mockCopyrightReports.find((r) => r.clip_id === clip.id) ?? null,
    }));
  }, []);

  const [tab, setTab] = useState<Tab>("tudo");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<MomentCategory[]>([]);

  function toggleCategory(cat: MomentCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  // Filter clips by search + category
  const filteredClips = useMemo(() => {
    let result = allClips;
    if (selectedCategories.length > 0) {
      result = result.filter(
        (c) => c.moment_category && selectedCategories.includes(c.moment_category)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.transcript_excerpt?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0));
  }, [allClips, selectedCategories, search]);

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, search]);

  const showVideos = tab === "tudo" || tab === "videos";
  const showClips = tab === "tudo" || tab === "cortes";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="font-display text-5xl leading-none"
            style={{ color: "#F0F5F0" }}
          >
            Biblioteca
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#4A5A4A" }}>
            {videos.length} vídeo{videos.length !== 1 ? "s" : ""} ·{" "}
            {allClips.length} corte{allClips.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          to="/upload"
          id="btn-novo-upload"
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.03]"
          style={{ background: "#C2FF45", color: "#0C0F0D" }}
        >
          <Plus className="h-4 w-4" />
          Novo upload
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "#4A5A4A" }}
          />
          <input
            id="input-search"
            type="text"
            placeholder="Buscar vídeos e cortes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
            style={{
              background: "#141714",
              border: "1px solid rgba(194,255,69,0.10)",
              color: "#F0F5F0",
            }}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(194,255,69,0.30)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(194,255,69,0.10)"; }}
          />
        </div>
      </motion.div>

      {/* Tabs + Category filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Tabs */}
        <div
          className="flex gap-1 rounded-xl p-1 w-fit"
          style={{ background: "#141714", border: "1px solid rgba(194,255,69,0.08)" }}
        >
          {(["tudo", "videos", "cortes"] as Tab[]).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
              style={{
                background: tab === t ? "rgba(194,255,69,0.12)" : "transparent",
                color: tab === t ? "#C2FF45" : "#4A5A4A",
              }}
            >
              {t === "videos" ? "Vídeos" : t === "cortes" ? "Cortes" : "Tudo"}
            </button>
          ))}
        </div>

        {/* Category filter (only on cortes/tudo tabs) */}
        {showClips && (
          <CategoryFilterBar
            selected={selectedCategories}
            onToggle={toggleCategory}
            onClear={() => setSelectedCategories([])}
          />
        )}
      </motion.div>

      {/* VÍDEOS section */}
      {showVideos && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2
            className="font-display text-2xl mb-3 flex items-center gap-2"
            style={{ color: "#F0F5F0" }}
          >
            <Library className="h-5 w-5" style={{ color: "#C2FF45" }} />
            Vídeos enviados
          </h2>

          {videosLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#C2FF45" }} />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div
              className="rounded-xl py-14 text-center"
              style={{
                border: "1px dashed rgba(194,255,69,0.12)",
                background: "#141714",
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-3" style={{ color: "rgba(194,255,69,0.3)" }} />
              <p className="text-sm" style={{ color: "#4A5A4A" }}>
                {search ? "Nenhum vídeo encontrado." : "Nenhum vídeo enviado ainda."}
              </p>
              {!search && (
                <Link
                  to="/upload"
                  className="inline-block mt-4 text-xs font-bold"
                  style={{ color: "#C2FF45" }}
                >
                  Enviar primeiro vídeo →
                </Link>
              )}
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#141714",
                border: "1px solid rgba(194,255,69,0.08)",
              }}
            >
              {filteredVideos.map((video, i) => (
                <VideoRow
                  key={video.id}
                  video={video}
                  clipCount={allClips.filter((c) => c.video_id === video.id).length}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* CORTES section */}
      {showClips && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showVideos ? 0.25 : 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-display text-2xl flex items-center gap-2"
              style={{ color: "#F0F5F0" }}
            >
              ✂ Cortes recentes
            </h2>
            {filteredClips.length > 0 && (
              <p className="text-xs font-mono" style={{ color: "#3A4A3A" }}>
                Ordenado por viral score
              </p>
            )}
          </div>

          {filteredClips.length === 0 ? (
            <div
              className="rounded-xl py-14 text-center"
              style={{
                border: "1px dashed rgba(194,255,69,0.12)",
                background: "#141714",
              }}
            >
              <p className="text-sm" style={{ color: "#4A5A4A" }}>
                {selectedCategories.length > 0 || search
                  ? "Nenhum corte encontrado com esses filtros."
                  : "Nenhum corte gerado ainda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClips.map((clip, i) => (
                <ClipGridCard key={clip.id} clip={clip} index={i} />
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
}
