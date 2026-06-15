import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  AuthSession,
  loadSession,
  refreshAuthSession,
  saveSession,
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
} from "@/lib/supabaseAuth";

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initSession = async () => {
      const storedSession = loadSession();
      if (!storedSession) {
        if (active) setLoading(false);
        return;
      }

      try {
        const expiresSoon = storedSession.expires_at ? storedSession.expires_at - Math.floor(Date.now() / 1000) < 120 : false;
        const nextSession = expiresSoon ? await refreshAuthSession(storedSession.refresh_token) : storedSession;
        saveSession(nextSession);
        if (active) setSession(nextSession);
      } catch {
        saveSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void initSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signIn: async (email, password) => {
        const nextSession = await signInWithPassword(email, password);
        saveSession(nextSession);
        setSession(nextSession);
      },
      signUp: async (email, password, displayName) => {
        const nextSession = await signUpWithPassword(email, password, displayName);
        if (!nextSession) return "Bitte bestätige deine E-Mail-Adresse und melde dich danach an.";
        saveSession(nextSession);
        setSession(nextSession);
        return null;
      },
      signOut: async () => {
        await signOutSession(session?.access_token);
        setSession(null);
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
