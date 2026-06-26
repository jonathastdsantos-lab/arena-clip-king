-- ============================================================================
-- ArenaClips — Schema inicial (Migration 001)
-- ============================================================================

-- ENUMS
create type video_source_type as enum ('jogo', 'live', 'podcast');
create type video_status as enum ('uploading', 'queued', 'processing', 'done', 'error');
create type job_stage as enum (
  'transcribing', 'detecting_moments', 'generating_clips',
  'scoring_viral', 'copyright_check', 'done'
);
create type job_status as enum ('pending', 'running', 'done', 'failed');
create type clip_status as enum ('generated', 'published', 'archived');
create type moment_category as enum (
  'gol', 'lance_perigoso', 'discussao', 'polemica',
  'entrevista_forte', 'frase_impactante'
);
create type risk_level as enum ('ok', 'medium', 'high');
create type publish_platform as enum ('youtube', 'tiktok', 'instagram');
create type publish_status as enum ('draft', 'publishing', 'published', 'failed');

-- CHANNELS
create table channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  plan text not null default 'criador',
  created_at timestamptz not null default now()
);
create index idx_channels_user_id on channels(user_id);

-- VIDEOS
create table videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id uuid references channels(id) on delete set null,
  title text not null,
  source_type video_source_type not null,
  storage_path text not null,
  duration_seconds integer,
  size_bytes bigint,
  status video_status not null default 'uploading',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_videos_user_id on videos(user_id);
create index idx_videos_channel_id on videos(channel_id);
create index idx_videos_status on videos(status);

-- PROCESSING_JOBS
create table processing_jobs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  stage job_stage not null default 'transcribing',
  status job_status not null default 'pending',
  progress_pct numeric(5,2) not null default 0,
  error_message text,
  claimed_by text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_processing_jobs_video_id on processing_jobs(video_id);
create index idx_processing_jobs_status on processing_jobs(status);

create or replace function claim_next_job(p_worker_id text)
returns processing_jobs
language plpgsql
as $$
declare
  v_job processing_jobs;
begin
  select * into v_job
  from processing_jobs
  where status = 'pending'
  order by created_at asc
  for update skip locked
  limit 1;

  if v_job.id is not null then
    update processing_jobs
    set status = 'running', claimed_by = p_worker_id,
        claimed_at = now(), updated_at = now()
    where id = v_job.id
    returning * into v_job;
  end if;

  return v_job;
end;
$$;

-- CLIPS
create table clips (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  length_seconds integer not null check (length_seconds in (15, 30, 60)),
  start_ms integer not null,
  end_ms integer not null,
  storage_path text,
  vertical_storage_path text,
  transcript_excerpt text,
  moment_category moment_category,
  viral_score numeric(5,2),
  retention_score numeric(5,2),
  ctr_score numeric(5,2),
  status clip_status not null default 'generated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clips_video_id on clips(video_id);
create index idx_clips_status on clips(status);
create index idx_clips_viral_score on clips(viral_score desc);
create index idx_clips_moment_category on clips(moment_category);

-- CLIP_TITLES
create table clip_titles (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references clips(id) on delete cascade,
  text text not null,
  selected boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_clip_titles_clip_id on clip_titles(clip_id);
create unique index uq_clip_titles_selected on clip_titles(clip_id) where selected = true;

-- CLIP_THUMBNAILS
create table clip_thumbnails (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references clips(id) on delete cascade,
  storage_path text not null,
  tag text,
  selected boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_clip_thumbnails_clip_id on clip_thumbnails(clip_id);
create unique index uq_clip_thumbnails_selected on clip_thumbnails(clip_id) where selected = true;

-- CLIP_CAPTION_STYLES
create table clip_caption_styles (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null unique references clips(id) on delete cascade,
  style_key text not null,
  created_at timestamptz not null default now()
);

-- COPYRIGHT_REPORTS
create table copyright_reports (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null unique references clips(id) on delete cascade,
  overall_risk risk_level not null,
  audio_match_json jsonb,
  vision_match_json jsonb,
  summary_text text,
  model_version text not null,
  created_at timestamptz not null default now()
);
create index idx_copyright_reports_clip_id on copyright_reports(clip_id);
create index idx_copyright_reports_risk on copyright_reports(overall_risk);

create table copyright_report_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references copyright_reports(id) on delete cascade,
  label text not null,
  value_text text not null,
  signal_status text not null check (signal_status in ('ok', 'warn')),
  created_at timestamptz not null default now()
);
create index idx_copyright_report_items_report_id on copyright_report_items(report_id);

create table known_broadcast_audio_fingerprints (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  fingerprint text not null,
  source_name text,
  added_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- PUBLICATIONS
create table publications (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references clips(id) on delete cascade,
  platform publish_platform not null,
  external_id text,
  status publish_status not null default 'draft',
  published_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_publications_clip_id on publications(clip_id);
create index idx_publications_status on publications(status);

-- TRIGGERS updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_videos_updated_at before update on videos
  for each row execute function set_updated_at();
create trigger trg_processing_jobs_updated_at before update on processing_jobs
  for each row execute function set_updated_at();
create trigger trg_clips_updated_at before update on clips
  for each row execute function set_updated_at();
create trigger trg_publications_updated_at before update on publications
  for each row execute function set_updated_at();
