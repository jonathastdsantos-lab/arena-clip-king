import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Guard: if env vars are missing, warn in dev and use a no-op client
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn(
      "[ArenaClips] Supabase env vars not set. " +
        "Copy .env.example to .env and fill in your credentials. " +
        "The app will run with mock data in the meantime."
    );
  }
}

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
);

export const isMockMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "https://placeholder.supabase.co";
