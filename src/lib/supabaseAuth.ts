const SUPABASE_URL = "https://pmfazwutitljrzzyfsmh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZmF6d3V0aXRsanJ6enlmc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDcwNDgsImV4cCI6MjA5NzA4MzA0OH0.Dsi0_wekSRM2XqmyyR5bwvoqdGhK_Ena3hfVe6cdE88";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
};

const storageKey = "helge-schnirring-auth-session";

const authHeaders = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  "Content-Type": "application/json",
};

const parseAuthResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.message || "Anmeldung fehlgeschlagen.");
  }
  return data;
};

const toSession = (data: Record<string, unknown>): AuthSession => {
  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
  return {
    access_token: String(data.access_token ?? ""),
    refresh_token: String(data.refresh_token ?? ""),
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    user: data.user as AuthUser,
  };
};

export const saveSession = (session: AuthSession | null) => {
  if (!session) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(session));
};

export const loadSession = () => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const signInWithPassword = async (email: string, password: string) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ email, password }),
  });
  const data = await parseAuthResponse(response);
  return toSession(data);
};

export const signUpWithPassword = async (email: string, password: string, displayName: string) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      email,
      password,
      data: { display_name: displayName || email },
    }),
  });
  const data = await parseAuthResponse(response);
  return data.access_token ? toSession(data) : null;
};

export const refreshAuthSession = async (refreshToken: string) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await parseAuthResponse(response);
  return toSession(data);
};

export const signOutSession = async (accessToken?: string) => {
  if (accessToken) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        ...authHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch(() => undefined);
  }
  saveSession(null);
};

export const restRequest = async <T>(session: AuthSession, path: string, options: RequestInit = {}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Daten konnten nicht geladen werden.");
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
};
