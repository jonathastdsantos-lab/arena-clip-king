import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import { mockPublications } from "@/lib/mockData";
import type { Publication, PublishPlatform } from "@/types/db";

// ----------------------------------------------------------------------------
// usePublications — todas as publicações do usuário
// ----------------------------------------------------------------------------

export function usePublications() {
  return useQuery({
    queryKey: ["publications"],
    queryFn: async (): Promise<Publication[]> => {
      if (isMockMode) return mockPublications;

      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ----------------------------------------------------------------------------
// usePublicationsForClip — publicações de um clip específico
// ----------------------------------------------------------------------------

export function usePublicationsForClip(clipId: string) {
  return useQuery({
    queryKey: ["publications", { clipId }],
    queryFn: async (): Promise<Publication[]> => {
      if (isMockMode)
        return mockPublications.filter((p) => p.clip_id === clipId);

      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("clip_id", clipId);

      if (error) throw error;
      return data;
    },
    enabled: !!clipId,
  });
}

// ----------------------------------------------------------------------------
// useCreatePublication — agenda uma publicação
// ----------------------------------------------------------------------------

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clipId,
      platform,
    }: {
      clipId: string;
      platform: PublishPlatform;
    }) => {
      if (isMockMode) {
        const pub: Publication = {
          id: `pub-${Date.now()}`,
          clip_id: clipId,
          platform,
          external_id: null,
          status: "draft",
          published_at: null,
          error_message: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockPublications.unshift(pub);
        return pub;
      }

      const { data, error } = await supabase
        .from("publications")
        .insert({ clip_id: clipId, platform, status: "draft" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
