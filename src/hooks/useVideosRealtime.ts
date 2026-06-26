import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import type { Video } from "@/types/db";

/**
 * Subscribes to Supabase Realtime for ALL videos belonging to the current user.
 * Updates the TanStack Query videos cache when any video status changes.
 * Used in the Biblioteca screen to reflect worker progress without page reload.
 */
export function useVideosRealtime(userId: string | null | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId || isMockMode) return;

    const channel = supabase
      .channel(`videos:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedVideo = payload.new as Video;
          // Update the specific video in the list cache
          queryClient.setQueryData<Video[]>(["videos"], (old) => {
            if (!old) return [updatedVideo];
            return old.map((v) => (v.id === updatedVideo.id ? updatedVideo : v));
          });
          // Invalidate individual video query
          queryClient.invalidateQueries({ queryKey: ["video", updatedVideo.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "videos",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch the full list on new video
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
  }, [userId, queryClient]);
}
