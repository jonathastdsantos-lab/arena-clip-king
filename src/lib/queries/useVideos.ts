import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import {
  mockVideos,
  mockJobs,
  MOCK_USER_ID,
} from "@/lib/mockData";
import type { Video } from "@/types/db";

// ----------------------------------------------------------------------------
// useVideos — lista todos os vídeos do usuário
// ----------------------------------------------------------------------------

export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async (): Promise<Video[]> => {
      if (isMockMode) return mockVideos;

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ----------------------------------------------------------------------------
// useVideo — detalhe de um vídeo com seu job de processamento
// ----------------------------------------------------------------------------

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ["videos", videoId],
    queryFn: async () => {
      if (isMockMode) {
        const video = mockVideos.find((v) => v.id === videoId) ?? null;
        const job = mockJobs.find((j) => j.video_id === videoId) ?? null;
        return video ? { ...video, processing_job: job } : null;
      }

      const { data: video, error: videoErr } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (videoErr) throw videoErr;

      const { data: job } = await supabase
        .from("processing_jobs")
        .select("*")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return { ...video, processing_job: job };
    },
    enabled: !!videoId,
  });
}

// ----------------------------------------------------------------------------
// useCreateVideo — cria um vídeo e o job inicial
// ----------------------------------------------------------------------------

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      source_type: Video["source_type"];
      storage_path: string;
      duration_seconds?: number;
      size_bytes?: number;
    }) => {
      if (isMockMode) {
        const newVideo: Video = {
          id: `vid-${Date.now()}`,
          user_id: MOCK_USER_ID,
          channel_id: "chan-001",
          status: "queued",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...payload,
          duration_seconds: payload.duration_seconds ?? null,
          size_bytes: payload.size_bytes ?? null,
        };
        mockVideos.unshift(newVideo);
        return newVideo;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: video, error: videoErr } = await supabase
        .from("videos")
        .insert({ ...payload, user_id: user.id, status: "queued" })
        .select()
        .single();

      if (videoErr) throw videoErr;

      // cria o job inicial
      await supabase.from("processing_jobs").insert({
        video_id: video.id,
        stage: "transcribing",
        status: "pending",
        progress_pct: 0,
      });

      return video;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
