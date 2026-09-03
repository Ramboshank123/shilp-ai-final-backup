import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const DEMO_EMAIL = "demo.artisan@shilp.ai";
export const DEMO_PASSWORD = "shilp-demo-2026";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
      void supabase.auth
        .getSession()
        .then(({ data }) => {
          setSession(data.session);
          setLoading(false);
        })
        .catch((error) => {
          console.warn("Supabase auth is unavailable; demo mode remains available.", error);
          setLoading(false);
        });
    } catch (error) {
      console.warn("Supabase auth is unavailable; demo mode remains available.", error);
      setLoading(false);
    }
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, loading }),
    [session, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Signs into the shared demo artisan account, creating it on first use. */
export async function signInAsDemo(): Promise<{ error: string | null }> {
  try {
    const first = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    if (!first.error) return { error: null };

    const created = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: { data: { full_name: "Demo Artisan" } },
    });
    if (created.error && !created.error.message.toLowerCase().includes("already registered")) {
      return { error: created.error.message };
    }

    if (!created.data?.session) {
      const retry = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (retry.error) return { error: retry.error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Demo sign in unavailable" };
  }
}
