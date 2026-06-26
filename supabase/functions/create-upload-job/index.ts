// supabase/functions/create-upload-job/index.ts
// Edge Function: called by the frontend AFTER the file has been uploaded to Storage.
// Validates JWT, verifies video ownership, creates a processing_jobs record.
// Returns: { job_id: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ─── Auth: validate the user JWT ─────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a Supabase client that inherits the user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the token is valid and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Parse request body ──────────────────────────────────────────────────
    const body = await req.json();
    const { video_id } = body;

    if (!video_id || typeof video_id !== "string") {
      return new Response(JSON.stringify({ error: "video_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Verify video belongs to this user ───────────────────────────────────
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, user_id, status")
      .eq("id", video_id)
      .single();

    if (videoError || !video) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (video.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Create processing job using service role (bypasses RLS on jobs table)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Update video status to 'queued'
    await adminClient
      .from("videos")
      .update({ status: "queued" })
      .eq("id", video_id);

    // Create the processing job
    const { data: job, error: jobError } = await adminClient
      .from("processing_jobs")
      .insert({
        video_id,
        stage: "transcribing",
        status: "pending",
        progress_pct: 0,
      })
      .select("id")
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Failed to create job", details: jobError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ job_id: job.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
