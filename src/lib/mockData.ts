// ============================================================================
// ArenaClips — Dados mock para desenvolvimento sem Supabase configurado
// ============================================================================

import type {
  Video,
  ProcessingJob,
  Clip,
  ClipTitle,
  ClipThumbnail,
  CopyrightReport,
  CopyrightReportItem,
  Publication,
  Channel,
  MomentCategory,
} from "@/types/db";

export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

export const mockChannel: Channel = {
  id: "chan-001",
  user_id: MOCK_USER_ID,
  name: "Cortes do Rei",
  plan: "pro",
  created_at: "2024-01-15T10:00:00Z",
};

export const mockVideos: Video[] = [
  {
    id: "vid-001",
    user_id: MOCK_USER_ID,
    channel_id: "chan-001",
    title: "Jogo decisivo — Flamengo x Palmeiras",
    source_type: "jogo",
    storage_path: "raw-videos/vid-001.mp4",
    duration_seconds: 5400,
    size_bytes: 2_800_000_000,
    status: "done",
    created_at: "2024-06-20T08:00:00Z",
    updated_at: "2024-06-20T10:30:00Z",
  },
  {
    id: "vid-002",
    user_id: MOCK_USER_ID,
    channel_id: "chan-001",
    title: "Live Pós-Jogo — Análise tática completa",
    source_type: "live",
    storage_path: "raw-videos/vid-002.mp4",
    duration_seconds: 3600,
    size_bytes: 1_900_000_000,
    status: "processing",
    created_at: "2024-06-22T14:00:00Z",
    updated_at: "2024-06-22T14:45:00Z",
  },
  {
    id: "vid-003",
    user_id: MOCK_USER_ID,
    channel_id: "chan-001",
    title: "Podcast Arena — Episódio 42",
    source_type: "podcast",
    storage_path: "raw-videos/vid-003.mp4",
    duration_seconds: 7200,
    size_bytes: 1_200_000_000,
    status: "queued",
    created_at: "2024-06-25T09:00:00Z",
    updated_at: "2024-06-25T09:00:00Z",
  },
];

export const mockJobs: ProcessingJob[] = [
  {
    id: "job-001",
    video_id: "vid-001",
    stage: "done",
    status: "done",
    progress_pct: 100,
    error_message: null,
    claimed_by: "worker-a1",
    claimed_at: "2024-06-20T08:05:00Z",
    created_at: "2024-06-20T08:01:00Z",
    updated_at: "2024-06-20T10:30:00Z",
  },
  {
    id: "job-002",
    video_id: "vid-002",
    stage: "scoring_viral",
    status: "running",
    progress_pct: 72,
    error_message: null,
    claimed_by: "worker-b2",
    claimed_at: "2024-06-22T14:10:00Z",
    created_at: "2024-06-22T14:05:00Z",
    updated_at: "2024-06-22T14:45:00Z",
  },
  {
    id: "job-003",
    video_id: "vid-003",
    stage: "transcribing",
    status: "pending",
    progress_pct: 0,
    error_message: null,
    claimed_by: null,
    claimed_at: null,
    created_at: "2024-06-25T09:01:00Z",
    updated_at: "2024-06-25T09:01:00Z",
  },
];

export const mockClips: Clip[] = [
  {
    id: "clip-001",
    video_id: "vid-001",
    length_seconds: 60,
    start_ms: 3_420_000,
    end_ms: 3_480_000,
    storage_path: "clips/clip-001.mp4",
    vertical_storage_path: "clips/clip-001-vertical.mp4",
    transcript_excerpt: "E É GOL! Que golaço do Gabigol! A torcida explode no Maracanã!",
    moment_category: "gol",
    viral_score: 94.2,
    retention_score: 87.5,
    ctr_score: 91.0,
    status: "generated",
    created_at: "2024-06-20T11:00:00Z",
    updated_at: "2024-06-20T11:00:00Z",
  },
  {
    id: "clip-002",
    video_id: "vid-001",
    length_seconds: 30,
    start_ms: 2_100_000,
    end_ms: 2_130_000,
    storage_path: "clips/clip-002.mp4",
    vertical_storage_path: "clips/clip-002-vertical.mp4",
    transcript_excerpt: "Defesa incrível do goleiro! Salvou o time na hora mais difícil.",
    moment_category: "lance_perigoso",
    viral_score: 81.7,
    retention_score: 79.2,
    ctr_score: 83.4,
    status: "published",
    created_at: "2024-06-20T11:05:00Z",
    updated_at: "2024-06-21T09:00:00Z",
  },
  {
    id: "clip-003",
    video_id: "vid-001",
    length_seconds: 15,
    start_ms: 4_800_000,
    end_ms: 4_815_000,
    storage_path: "clips/clip-003.mp4",
    vertical_storage_path: "clips/clip-003-vertical.mp4",
    transcript_excerpt: "Olha a comemoração! A torcida toda junto!",
    moment_category: "polemica",
    viral_score: 76.3,
    retention_score: 72.8,
    ctr_score: 74.1,
    status: "generated",
    created_at: "2024-06-20T11:10:00Z",
    updated_at: "2024-06-20T11:10:00Z",
  },
  {
    id: "clip-004",
    video_id: "vid-001",
    length_seconds: 60,
    start_ms: 1_200_000,
    end_ms: 1_260_000,
    storage_path: "clips/clip-004.mp4",
    vertical_storage_path: null,
    transcript_excerpt: "A jogada que mudou tudo no primeiro tempo. Assistência perfeita.",
    moment_category: "entrevista_forte",
    viral_score: 68.9,
    retention_score: 65.4,
    ctr_score: 70.2,
    status: "archived",
    created_at: "2024-06-20T11:15:00Z",
    updated_at: "2024-06-20T12:00:00Z",
  },
];

export const mockTitles: Record<string, ClipTitle[]> = {
  "clip-001": [
    { id: "t-001a", clip_id: "clip-001", text: "Gabigol EXPLODIU o Maracanã! 🔥 Gol histórico que a torcida nunca vai esquecer", selected: true, created_at: "2024-06-20T11:01:00Z" },
    { id: "t-001b", clip_id: "clip-001", text: "O GOL QUE TODOS ESTÃO FALANDO — Flamengo destrói a defesa e marca o gol da classificação", selected: false, created_at: "2024-06-20T11:01:00Z" },
    { id: "t-001c", clip_id: "clip-001", text: "Que GOLAÇO absurdo! Já é o melhor gol do Brasileirão 2024? 👀⚽", selected: false, created_at: "2024-06-20T11:01:00Z" },
  ],
  "clip-002": [
    { id: "t-002a", clip_id: "clip-002", text: "IMPOSSÍVEL! Como esse goleiro defendeu?! Milagre dentro das quatro traves 🧤", selected: true, created_at: "2024-06-20T11:06:00Z" },
    { id: "t-002b", clip_id: "clip-002", text: "A defesa do século no Brasileirão — ninguém acreditou quando viu ao vivo!", selected: false, created_at: "2024-06-20T11:06:00Z" },
  ],
};

export const mockThumbnails: Record<string, ClipThumbnail[]> = {
  "clip-001": [
    { id: "th-001a", clip_id: "clip-001", storage_path: "thumbnails/clip-001-a.jpg", tag: "Expressão + escudo", selected: true, created_at: "2024-06-20T11:02:00Z" },
    { id: "th-001b", clip_id: "clip-001", storage_path: "thumbnails/clip-001-b.jpg", tag: "Texto impactante", selected: false, created_at: "2024-06-20T11:02:00Z" },
    { id: "th-001c", clip_id: "clip-001", storage_path: "thumbnails/clip-001-c.jpg", tag: "Torcida ao fundo", selected: false, created_at: "2024-06-20T11:02:00Z" },
  ],
};

export const mockCopyrightReports: Record<string, CopyrightReport & { items: CopyrightReportItem[] }> = {
  "clip-001": {
    id: "cr-001",
    clip_id: "clip-001",
    overall_risk: "medium",
    audio_match_json: { confidence: 0.42, matched_track: "Vinheta SporTV" },
    vision_match_json: { logos_detected: ["GloboEsporte"], confidence: 0.38 },
    summary_text:
      "Detectamos trecho musical de transmissão esportiva no fundo do áudio (confiança moderada). Imagem contém logo da emissora por ~3s. Risco médio — recomendamos remover ou substituir a trilha de fundo antes de publicar.",
    model_version: "gemini-1.5-pro-v2",
    created_at: "2024-06-20T11:30:00Z",
    items: [
      { id: "cri-001a", report_id: "cr-001", label: "Trilha / música", value_text: "Trecho de vinheta de transmissão detectado (confiança 42%)", signal_status: "warn", created_at: "2024-06-20T11:30:00Z" },
      { id: "cri-001b", report_id: "cr-001", label: "Imagem de transmissão", value_text: "Logo da emissora visível por 3s no canto inferior", signal_status: "warn", created_at: "2024-06-20T11:30:00Z" },
      { id: "cri-001c", report_id: "cr-001", label: "Escudos dos times", value_text: "Escudos detectados — uso editorial normalmente aceito", signal_status: "ok", created_at: "2024-06-20T11:30:00Z" },
      { id: "cri-001d", report_id: "cr-001", label: "Narração/voz", value_text: "Voz de narrador presente — uso curto (<60s) geralmente aceito", signal_status: "ok", created_at: "2024-06-20T11:30:00Z" },
    ],
  },
  "clip-002": {
    id: "cr-002",
    clip_id: "clip-002",
    overall_risk: "ok",
    audio_match_json: null,
    vision_match_json: null,
    summary_text: "Nenhum sinal significativo de direitos autorais detectado. Clip seguro para publicação.",
    model_version: "gemini-1.5-pro-v2",
    created_at: "2024-06-20T11:32:00Z",
    items: [
      { id: "cri-002a", report_id: "cr-002", label: "Trilha / música", value_text: "Nenhuma trilha com fingerprint identificada", signal_status: "ok", created_at: "2024-06-20T11:32:00Z" },
      { id: "cri-002b", report_id: "cr-002", label: "Imagem de transmissão", value_text: "Nenhum logo de emissora detectado", signal_status: "ok", created_at: "2024-06-20T11:32:00Z" },
      { id: "cri-002c", report_id: "cr-002", label: "Escudos dos times", value_text: "Uso editorial aceito", signal_status: "ok", created_at: "2024-06-20T11:32:00Z" },
    ],
  },
};

export const mockPublications: Publication[] = [
  {
    id: "pub-001",
    clip_id: "clip-002",
    platform: "youtube",
    external_id: "dQw4w9WgXcQ",
    status: "published",
    published_at: "2024-06-21T09:30:00Z",
    error_message: null,
    created_at: "2024-06-21T09:00:00Z",
    updated_at: "2024-06-21T09:30:00Z",
  },
  {
    id: "pub-002",
    clip_id: "clip-002",
    platform: "tiktok",
    external_id: "7123456789",
    status: "published",
    published_at: "2024-06-21T10:00:00Z",
    error_message: null,
    created_at: "2024-06-21T09:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
  },
  {
    id: "pub-003",
    clip_id: "clip-001",
    platform: "instagram",
    external_id: null,
    status: "draft",
    published_at: null,
    error_message: null,
    created_at: "2024-06-22T08:00:00Z",
    updated_at: "2024-06-22T08:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

export function msToTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ----------------------------------------------------------------------------
// Moment Category helpers
// ----------------------------------------------------------------------------

export const momentCategoryConfig: Record<MomentCategory, { label: string; color: string; bg: string; border: string }> = {
  gol: {
    label: "Gol",
    color: "text-[#6FE08A]",
    bg: "bg-[#6FE08A]/15",
    border: "border-[#6FE08A]/30",
  },
  lance_perigoso: {
    label: "Lance perigoso",
    color: "text-[#FFD43B]",
    bg: "bg-[#FFD43B]/15",
    border: "border-[#FFD43B]/30",
  },
  discussao: {
    label: "Discussão",
    color: "text-[#FF9F40]",
    bg: "bg-[#FF9F40]/15",
    border: "border-[#FF9F40]/30",
  },
  polemica: {
    label: "Polêmica",
    color: "text-[#FF7A6B]",
    bg: "bg-[#FF7A6B]/15",
    border: "border-[#FF7A6B]/30",
  },
  entrevista_forte: {
    label: "Entrevista forte",
    color: "text-[#C2FF45]",
    bg: "bg-[#C2FF45]/15",
    border: "border-[#C2FF45]/30",
  },
  frase_impactante: {
    label: "Frase impactante",
    color: "text-[#A78BFA]",
    bg: "bg-[#A78BFA]/15",
    border: "border-[#A78BFA]/30",
  },
};

export const ALL_MOMENT_CATEGORIES: MomentCategory[] = [
  "gol",
  "lance_perigoso",
  "discussao",
  "polemica",
  "entrevista_forte",
  "frase_impactante",
];
