import { useState, useEffect } from "react";
import { supabase, isMockMode } from "@/lib/supabase";
export { isMockMode } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "demo@arenaclips.com.br",
  user_metadata: { full_name: "Demo User" },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-15T10:00:00Z",
} as unknown as User;

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(isMockMode ? MOCK_USER : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!isMockMode);

  useEffect(() => {
    if (isMockMode) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

// ----------------------------------------------------------------------------
// Sign in / sign up helpers
// ----------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string) {
  if (isMockMode) return { user: MOCK_USER, error: null };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  if (isMockMode) return { user: MOCK_USER, error: null };
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGoogle() {
  if (isMockMode) return { data: null, error: null };
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
}

export async function signOut() {
  if (isMockMode) return;
  await supabase.auth.signOut();
}
