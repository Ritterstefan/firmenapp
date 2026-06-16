import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { session, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const info = await signUp(email.trim(), password, displayName.trim());
        setMessage(info ?? "Konto erstellt.");
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auto-theme flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] bg-card p-3 shadow-xl shadow-primary/10 sm:h-44 sm:w-44">
            <img src="/helge-schnirring-logo.svg" alt="Helge Schnirring Baumpflege Garten- und Landschaftsbau" className="h-full w-full object-contain" draggable="false" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.24em] text-primary">Firmenapp</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Willkommen</h1>
        </div>

        <Card className="rounded-[2rem] border-border/80 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 grid grid-cols-2 rounded-full bg-secondary p-1">
              <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground" : "rounded-full px-4 py-2 text-sm font-black text-muted-foreground"}>Login</button>
              <button type="button" onClick={() => setMode("signup")} className={mode === "signup" ? "rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground" : "rounded-full px-4 py-2 text-sm font-black text-muted-foreground"}>Neu</button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3">
              {mode === "signup" && <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-12 rounded-2xl bg-background text-base" placeholder="Name" />}
              <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-2xl bg-background text-base" placeholder="E-Mail" />
              <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-2xl bg-background text-base" placeholder="Passwort" />
              {message && <p className="rounded-2xl bg-accent p-3 text-sm font-bold text-accent-foreground">{message}</p>}
              <Button disabled={submitting || loading} className="mt-2 h-12 rounded-2xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90">
                <LockKeyhole className="mr-2 h-5 w-5" />
                {submitting ? "..." : mode === "login" ? "Einloggen" : "Registrieren"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Login;
