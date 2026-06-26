// supabase/functions/worker-callback/index.ts
// Edge Function: called by the EXTERNAL WORKER (running on a VPS, not Supabase).
// Authenticated via a shared secret (WORKER_SHARED_SECRET env var), NOT via user JWT.
// Uses the service role key to write to processing_jobs, clips, copyright_reports, etc.
//
// Expected payload (JSON body):
// {
//   job_id: string,
//   stage: "transcribing" | "detecting_moments" | "generating_clips" | "scoring_viral" | "copyright_check" | "done",
//   progress_pct: number,          // 0–100
//   status: "running" | "done" | "failed",
//   error_message?: string,         // only when status = "failed"
//   results?: {                      // only when status = "done"
//     clips: ClipResult[],
//     copyright_reports: CopyrightReportResult[]
//   }
// }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-worker-secret",
};

// ─── Type definitions ──────────────────────────────────────────────────────

interface ClipTitleInput {
  text: string;
  selected?: boolean;
}

interface ClipThumbnailInput {
  storage_path: string;
  tag?: string;
  selected?: boolean;
}

interface CopyrightReportItemInput {
  label: string;
  value_text: string;
  signal_status: "ok" | "warn";
}

interface CopyrightReportInput {
  clip_id: string;
  overall_risk: "ok" | "medium" | "high";
  audio_match_json?: Record<string, unknown>;
  vision_match_json?: Record<string, unknown>;
  summary_text?: string;
  model_version: string;
  items?: CopyrightReportItemInput[];
}

interface ClipResult {
  length_seconds: 15 | 30 | 60;
  start_ms: number;
  end_ms: number;
  storage_path?: string;
  vertical_storage_path?: string;
  transcript_excerpt?: string;
  moment_category?: string;
  viral_score?: number;
  retention_score?: number;
  ctr_score?: number;
  titles?: ClipTitleInput[];
  thumbnails?: ClipThumbnailInput[];
  copyright_report?: Omit<CopyrightReportInput, "clip_id">;
}

interface WorkerPayload {
  job_id: string;
  stage: string;
  progress_pct: number;
  status: "running" | "done" | "failed";
  error_message?: string;
  video_id?: string;
  results?: {
    clips?: ClipResult[];
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ─── Auth: validate the shared worker secret ──────────────────────────────
    const workerSecret = req.headers.get("x-worker-secret");
    const expectedSecret = Deno.env.get("WORKER_SHARED_SECRET");

    if (!expectedSecret) {
      console.error("WORKER_SHARED_SECRET env var is not set");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!workerSecret || workerSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Parse and validate payload ───────────────────────────────────────────
    const payload: WorkerPayload = await req.json();

    const { job_id, stage, progress_pct, status, error_message, results } = payload;

    if (!job_id || typeof job_id !== "string") {
      return new Response(JSON.stringify({ error: "job_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof progress_pct !== "number" || progress_pct < 0 || progress_pct > 100) {
      return new Response(JSON.stringify({ error: "progress_pct must be a number between 0 and 100" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["running", "done", "failed"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Use service role key (bypasses RLS) ──────────────────────────────────
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ─── Fetch the job to get video_id ────────────────────────────────────────
    const { data: job, error: jobFetchError } = await adminClient
      .from("processing_jobs")
      .select("id, video_id, status")
      .eq("id", job_id)
      .single();

    if (jobFetchError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Update job progress ──────────────────────────────────────────────────
    const jobUpdate: Record<string, unknown> = {
      stage,
      progress_pct,
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "failed" && error_message) {
      jobUpdate.error_message = error_message;
    }

    const { error: jobUpdateError } = await adminClient
      .from("processing_jobs")
      .update(jobUpdate)
      .eq("id", job_id);

    if (jobUpdateError) {
      console.error("Failed to update job:", jobUpdateError);
      return new Response(JSON.stringify({ error: "Failed to update job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Update video status ──────────────────────────────────────────────────
    let videoStatus: string | null = null;
    if (status === "running") videoStatus = "processing";
    if (status === "done") videoStatus = "done";
    if (status === "failed") videoStatus = "error";

    if (videoStatus) {
      await adminClient
        .from("videos")
        .update({ status: videoStatus })
        .eq("id", job.video_id);
    }

    // ─── If done, insert results ──────────────────────────────────────────────
    if (status === "done" && results?.clips?.length) {
      for (const clipData of results.clips) {
        const { titles, thumbnails, copyright_report, ...clipFields } = clipData;

        // Insert clip
        const { data: clip, error: clipError } = await adminClient
          .from("clips")
          .insert({
            video_id: job.video_id,
            ...clipFields,
          })
          .select("id")
          .single();

        if (clipError || !clip) {
          console.error("Failed to insert clip:", clipError);
          continue;
        }

        // Insert titles
        if (titles?.length) {
          await adminClient.from("clip_titles").insert(
            titles.map((t, i) => ({
              clip_id: clip.id,
              text: t.text,
              selected: i === 0, // first title selected by default
            }))
          );
        }

        // Insert thumbnails
        if (thumbnails?.length) {
          await adminClient.from("clip_thumbnails").insert(
            thumbnails.map((t, i) => ({
              clip_id: clip.id,
              storage_path: t.storage_path,
              tag: t.tag ?? null,
              selected: i === 0,
            }))
          );
        }

        // Insert copyright report
        if (copyright_report) {
          const { items, ...reportFields } = copyright_report as Omit<CopyrightReportInput, "clip_id"> & { items?: CopyrightReportItemInput[] };
          const { data: report, error: reportError } = await adminClient
            .from("copyright_reports")
            .insert({
              clip_id: clip.id,
              ...reportFields,
            })
            .select("id")
            .single();

          if (!reportError && report && items?.length) {
            await adminClient.from("copyright_report_items").insert(
              items.map((item) => ({
                report_id: report.id,
                label: item.label,
                value_text: item.value_text,
                signal_status: item.signal_status,
              }))
            );
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unhandled error in worker-callback:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
