import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import {
  mockClips,
  mockTitles,
  mockThumbnails,
  mockCopyrightReports,
  mockPublications,
} from "@/lib/mockData";
import type { Clip, ClipWithDetails } from "@/types/db";

// ----------------------------------------------------------------------------
// useClips — clips de um vídeo, ordenados por viral_score
// ----------------------------------------------------------------------------

export function useClips(videoId: string) {
  return useQuery({
    queryKey: ["clips", { videoId }],
    queryFn: async (): Promise<Clip[]> => {
      if (isMockMode)
        return mockClips
          .filter((c) => c.video_id === videoId)
          .sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0));

      const { data, error } = await supabase
        .from("clips")
        .select("*")
        .eq("video_id", videoId)
        .order("viral_score", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!videoId,
  });
}

// ----------------------------------------------------------------------------
// useClip — detalhe completo de um clip (com títulos, thumbnails, copyright)
// ----------------------------------------------------------------------------

export function useClip(clipId: string) {
  return useQuery({
    queryKey: ["clips", clipId],
    queryFn: async (): Promise<ClipWithDetails | null> => {
      if (isMockMode) {
        const clip = mockClips.find((c) => c.id === clipId) ?? null;
        if (!clip) return null;
        return {
          ...clip,
          titles: mockTitles[clipId] ?? [],
          thumbnails: mockThumbnails[clipId] ?? [],
          caption_style: null,
          copyright_report: mockCopyrightReports[clipId] ?? null,
          publications: mockPublications.filter((p) => p.clip_id === clipId),
        };
      }

      const { data: clip, error } = await supabase
        .from("clips")
        .select("*")
        .eq("id", clipId)
        .single();

      if (error) throw error;

      const [titles, thumbnails, captionStyle, copyrightReport, publications] =
        await Promise.all([
          supabase
            .from("clip_titles")
            .select("*")
            .eq("clip_id", clipId)
            .then(({ data }) => data ?? []),
          supabase
            .from("clip_thumbnails")
            .select("*")
            .eq("clip_id", clipId)
            .then(({ data }) => data ?? []),
          supabase
            .from("clip_caption_styles")
            .select("*")
            .eq("clip_id", clipId)
            .maybeSingle()
            .then(({ data }) => data),
          supabase
            .from("copyright_reports")
            .select("*, items:copyright_report_items(*)")
            .eq("clip_id", clipId)
            .maybeSingle()
            .then(({ data }) => data),
          supabase
            .from("publications")
            .select("*")
            .eq("clip_id", clipId)
            .then(({ data }) => data ?? []),
        ]);

      return {
        ...clip,
        titles,
        thumbnails,
        caption_style: captionStyle,
        copyright_report: copyrightReport as ClipWithDetails["copyright_report"],
        publications,
      };
    },
    enabled: !!clipId,
  });
}

// ----------------------------------------------------------------------------
// useSelectTitle — marca um título como selecionado
// ----------------------------------------------------------------------------

export function useSelectTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clipId,
      titleId,
    }: {
      clipId: string;
      titleId: string;
    }) => {
      if (isMockMode) {
        const titles = mockTitles[clipId];
        if (titles) {
          titles.forEach((t) => {
            t.selected = t.id === titleId;
          });
        }
        return;
      }

      // deseleciona todos primeiro, depois seleciona o escolhido
      await supabase
        .from("clip_titles")
        .update({ selected: false })
        .eq("clip_id", clipId);

      await supabase
        .from("clip_titles")
        .update({ selected: true })
        .eq("id", titleId);
    },
    onSuccess: (_data, { clipId }) => {
      queryClient.invalidateQueries({ queryKey: ["clips", clipId] });
    },
  });
}

// ----------------------------------------------------------------------------
// useSelectThumbnail — marca uma thumbnail como selecionada
// ----------------------------------------------------------------------------

export function useSelectThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clipId,
      thumbnailId,
    }: {
      clipId: string;
      thumbnailId: string;
    }) => {
      if (isMockMode) {
        const thumbs = mockThumbnails[clipId];
        if (thumbs) {
          thumbs.forEach((t) => {
            t.selected = t.id === thumbnailId;
          });
        }
        return;
      }

      await supabase
        .from("clip_thumbnails")
        .update({ selected: false })
        .eq("clip_id", clipId);

      await supabase
        .from("clip_thumbnails")
        .update({ selected: true })
        .eq("id", thumbnailId);
    },
    onSuccess: (_data, { clipId }) => {
      queryClient.invalidateQueries({ queryKey: ["clips", clipId] });
    },
  });
}
