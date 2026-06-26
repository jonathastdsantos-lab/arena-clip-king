-- ============================================================================
-- ArenaClips — Storage Buckets + Policies (Migration 003)
-- Run in SQL Editor AFTER creating the buckets via Dashboard or CLI.
-- ============================================================================

-- Create buckets via Supabase Dashboard → Storage → New Bucket:
--   - raw-videos  (private, max 5 GB per file)
--   - clips       (private, max 1 GB per file)
--   - thumbnails  (private, max 10 MB per file)
--
-- Or via CLI:
--   supabase storage create raw-videos --no-public
--   supabase storage create clips --no-public
--   supabase storage create thumbnails --no-public

-- ─── raw-videos ──────────────────────────────────────────────────────────────
create policy "raw_videos_select_own"
on storage.objects for select
using (
  bucket_id = 'raw-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "raw_videos_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'raw-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "raw_videos_update_own"
on storage.objects for update
using (
  bucket_id = 'raw-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "raw_videos_delete_own"
on storage.objects for delete
using (
  bucket_id = 'raw-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ─── clips ───────────────────────────────────────────────────────────────────
create policy "clips_select_own"
on storage.objects for select
using (
  bucket_id = 'clips'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "clips_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'clips'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "clips_update_own"
on storage.objects for update
using (
  bucket_id = 'clips'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "clips_delete_own"
on storage.objects for delete
using (
  bucket_id = 'clips'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ─── thumbnails ──────────────────────────────────────────────────────────────
create policy "thumbnails_select_own"
on storage.objects for select
using (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "thumbnails_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "thumbnails_update_own"
on storage.objects for update
using (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "thumbnails_delete_own"
on storage.objects for delete
using (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: The external worker uses the SERVICE ROLE KEY — it bypasses RLS entirely.
-- No additional policies are needed for worker writes to these buckets.
