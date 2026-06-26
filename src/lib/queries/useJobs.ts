import { useQuery } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import { mockJobs } from "@/lib/mockData";
import type { ProcessingJob } from "@/types/db";

// ----------------------------------------------------------------------------
// useJobs — jobs em andamento
// ----------------------------------------------------------------------------

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async (): Promise<ProcessingJob[]> => {
      if (isMockMode) return mockJobs;

      const { data, error } = await supabase
        .from("processing_jobs")
        .select("*")
        .in("status", ["pending", "running"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // polling a cada 5s como fallback
  });
}

// ----------------------------------------------------------------------------
// useJob — job de um vídeo específico
// ----------------------------------------------------------------------------

export function useJob(videoId: string) {
  return useQuery({
    queryKey: ["jobs", videoId],
    queryFn: async (): Promise<ProcessingJob | null> => {
      if (isMockMode)
        return mockJobs.find((j) => j.video_id === videoId) ?? null;

      const { data, error } = await supabase
        .from("processing_jobs")
        .select("*")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!videoId,
    refetchInterval: 3000,
  });
}
