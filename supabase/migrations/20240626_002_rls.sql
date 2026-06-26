-- ============================================================================
-- ArenaClips — Row Level Security (Migration 002)
-- ============================================================================

alter table channels enable row level security;
create policy "channels_select_own" on channels for select using (auth.uid() = user_id);
create policy "channels_insert_own" on channels for insert with check (auth.uid() = user_id);
create policy "channels_update_own" on channels for update using (auth.uid() = user_id);
create policy "channels_delete_own" on channels for delete using (auth.uid() = user_id);

alter table videos enable row level security;
create policy "videos_select_own" on videos for select using (auth.uid() = user_id);
create policy "videos_insert_own" on videos for insert with check (auth.uid() = user_id);
create policy "videos_update_own" on videos for update using (auth.uid() = user_id);
create policy "videos_delete_own" on videos for delete using (auth.uid() = user_id);

-- processing_jobs: RLS habilitada, SEM policies — só service role acessa.
alter table processing_jobs enable row level security;

alter table clips enable row level security;
create policy "clips_select_own" on clips for select using (
  exists (select 1 from videos v where v.id = clips.video_id and v.user_id = auth.uid())
);
create policy "clips_update_own" on clips for update using (
  exists (select 1 from videos v where v.id = clips.video_id and v.user_id = auth.uid())
);

alter table clip_titles enable row level security;
create policy "clip_titles_select_own" on clip_titles for select using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_titles.clip_id and v.user_id = auth.uid())
);
create policy "clip_titles_update_own" on clip_titles for update using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_titles.clip_id and v.user_id = auth.uid())
);

alter table clip_thumbnails enable row level security;
create policy "clip_thumbnails_select_own" on clip_thumbnails for select using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_thumbnails.clip_id and v.user_id = auth.uid())
);
create policy "clip_thumbnails_update_own" on clip_thumbnails for update using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_thumbnails.clip_id and v.user_id = auth.uid())
);

alter table clip_caption_styles enable row level security;
create policy "clip_caption_styles_select_own" on clip_caption_styles for select using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_caption_styles.clip_id and v.user_id = auth.uid())
);
create policy "clip_caption_styles_upsert_own" on clip_caption_styles for insert with check (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_caption_styles.clip_id and v.user_id = auth.uid())
);
create policy "clip_caption_styles_update_own" on clip_caption_styles for update using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = clip_caption_styles.clip_id and v.user_id = auth.uid())
);

alter table copyright_reports enable row level security;
create policy "copyright_reports_select_own" on copyright_reports for select using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = copyright_reports.clip_id and v.user_id = auth.uid())
);

alter table copyright_report_items enable row level security;
create policy "copyright_report_items_select_own" on copyright_report_items for select using (
  exists (select 1 from copyright_reports r join clips c on c.id = r.clip_id
          join videos v on v.id = c.video_id
          where r.id = copyright_report_items.report_id and v.user_id = auth.uid())
);

alter table known_broadcast_audio_fingerprints enable row level security;
create policy "known_fingerprints_select_authenticated" on known_broadcast_audio_fingerprints
  for select using (auth.role() = 'authenticated');

alter table publications enable row level security;
create policy "publications_select_own" on publications for select using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = publications.clip_id and v.user_id = auth.uid())
);
create policy "publications_insert_own" on publications for insert with check (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = publications.clip_id and v.user_id = auth.uid())
);
create policy "publications_update_own" on publications for update using (
  exists (select 1 from clips c join videos v on v.id = c.video_id
          where c.id = publications.clip_id and v.user_id = auth.uid())
);
