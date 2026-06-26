import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import type { ProcessingJob } from "@/types/db";

/**
 * Subscribes to Supabase Realtime updates for a specific processing_job.
 * Updates the TanStack Query cache when the job changes.
 * Falls back to polling (via refetchInterval in useJob) in mock mode.
 */
export function useJobRealtime(jobId: string | null | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!jobId || isMockMode) return;

    const channel = supabase
      .channel(`processing_job:${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "processing_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const updatedJob = payload.new as ProcessingJob;
          // Update the specific job in the cache
          queryClient.setQueryData<ProcessingJob>(
            ["job", updatedJob.video_id],
            updatedJob
          );
          // Invalidate video query to refresh its status
          queryClient.invalidateQueries({ queryKey: ["video", updatedJob.video_id] });
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [jobId, queryClient]);
}
