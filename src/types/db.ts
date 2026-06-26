// ============================================================================
// ArenaClips — Tipos TypeScript derivados do schema Supabase/Postgres
// ============================================================================

// ----------------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------------

export type VideoSourceType = "jogo" | "live" | "podcast";

export type VideoStatus =
  | "uploading"
  | "queued"
  | "processing"
  | "done"
  | "error";

export type JobStage =
  | "transcribing"
  | "detecting_moments"
  | "generating_clips"
  | "scoring_viral"
  | "copyright_check"
  | "done";

export type JobStatus = "pending" | "running" | "done" | "failed";

export type ClipStatus = "generated" | "published" | "archived";

export type MomentCategory =
  | "gol"
  | "lance_perigoso"
  | "discussao"
  | "polemica"
  | "entrevista_forte"
  | "frase_impactante";

export type RiskLevel = "ok" | "medium" | "high";

export type PublishPlatform = "youtube" | "tiktok" | "instagram";

export type PublishStatus =
  | "draft"
  | "publishing"
  | "published"
  | "failed";

// ----------------------------------------------------------------------------
// TABELAS
// ----------------------------------------------------------------------------

export interface Channel {
  id: string;
  user_id: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  channel_id: string | null;
  title: string;
  source_type: VideoSourceType;
  storage_path: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  status: VideoStatus;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  video_id: string;
  stage: JobStage;
  status: JobStatus;
  progress_pct: number;
  error_message: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Clip {
  id: string;
  video_id: string;
  length_seconds: 15 | 30 | 60;
  start_ms: number;
  end_ms: number;
  storage_path: string | null;
  vertical_storage_path: string | null;
  transcript_excerpt: string | null;
  moment_category: MomentCategory | null;
  viral_score: number | null;
  retention_score: number | null;
  ctr_score: number | null;
  status: ClipStatus;
  created_at: string;
  updated_at: string;
}

export interface ClipTitle {
  id: string;
  clip_id: string;
  text: string;
  selected: boolean;
  created_at: string;
}

export interface ClipThumbnail {
  id: string;
  clip_id: string;
  storage_path: string;
  tag: string | null;
  selected: boolean;
  created_at: string;
}

export interface ClipCaptionStyle {
  id: string;
  clip_id: string;
  style_key: string;
  created_at: string;
}

export interface CopyrightReport {
  id: string;
  clip_id: string;
  overall_risk: RiskLevel;
  audio_match_json: Record<string, unknown> | null;
  vision_match_json: Record<string, unknown> | null;
  summary_text: string | null;
  model_version: string;
  created_at: string;
}

export interface CopyrightReportItem {
  id: string;
  report_id: string;
  label: string;
  value_text: string;
  signal_status: "ok" | "warn";
  created_at: string;
}

export interface Publication {
  id: string;
  clip_id: string;
  platform: PublishPlatform;
  external_id: string | null;
  status: PublishStatus;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// JOINS / VIEWS (tipos expandidos para uso no frontend)
// ----------------------------------------------------------------------------

export interface VideoWithJob extends Video {
  processing_job?: ProcessingJob | null;
}

export interface ClipWithDetails extends Clip {
  titles?: ClipTitle[];
  thumbnails?: ClipThumbnail[];
  caption_style?: ClipCaptionStyle | null;
  copyright_report?: (CopyrightReport & { items: CopyrightReportItem[] }) | null;
  publications?: Publication[];
}

// ----------------------------------------------------------------------------
// DATABASE SCHEMA TYPE (para o cliente Supabase tipado)
// ----------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      channels: {
        Row: Channel;
        Insert: Omit<Channel, "id" | "created_at">;
        Update: Partial<Omit<Channel, "id">>;
      };
      videos: {
        Row: Video;
        Insert: Omit<Video, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Video, "id">>;
      };
      processing_jobs: {
        Row: ProcessingJob;
        Insert: Omit<ProcessingJob, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProcessingJob, "id">>;
      };
      clips: {
        Row: Clip;
        Insert: Omit<Clip, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Clip, "id">>;
      };
      clip_titles: {
        Row: ClipTitle;
        Insert: Omit<ClipTitle, "id" | "created_at">;
        Update: Partial<Omit<ClipTitle, "id">>;
      };
      clip_thumbnails: {
        Row: ClipThumbnail;
        Insert: Omit<ClipThumbnail, "id" | "created_at">;
        Update: Partial<Omit<ClipThumbnail, "id">>;
      };
      clip_caption_styles: {
        Row: ClipCaptionStyle;
        Insert: Omit<ClipCaptionStyle, "id" | "created_at">;
        Update: Partial<Omit<ClipCaptionStyle, "id">>;
      };
      copyright_reports: {
        Row: CopyrightReport;
        Insert: Omit<CopyrightReport, "id" | "created_at">;
        Update: Partial<Omit<CopyrightReport, "id">>;
      };
      copyright_report_items: {
        Row: CopyrightReportItem;
        Insert: Omit<CopyrightReportItem, "id" | "created_at">;
        Update: Partial<Omit<CopyrightReportItem, "id">>;
      };
      publications: {
        Row: Publication;
        Insert: Omit<Publication, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Publication, "id">>;
      };
    };
    Functions: {
      claim_next_job: {
        Args: { p_worker_id: string };
        Returns: ProcessingJob;
      };
    };
  };
}
