import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck, TreePine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
        setMessage(info ?? "Konto wurde erstellt. Du bist jetzt angemeldet.");
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
    <main className="min-h-screen bg-[#F5F2EE] px-4 py-6 text-[#1E1E1F]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.28] [background-image:radial-gradient(circle_at_15%_20%,rgba(139,37,43,.16),transparent_30%),linear-gradient(120deg,rgba(189,189,194,.35)_1px,transparent_1px)] [background-size:100%_100%,38px_38px]" />
      <section className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <Card className="overflow-hidden rounded-[2.25rem] border-0 bg-[#151515] text-white shadow-2xl shadow-[#3B1115]/20">
          <CardContent className="relative p-7 sm:p-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-[#8B252B]/45" />
            <div className="relative max-w-xl">
              <Badge className="rounded-full bg-[#8B252B] px-4 py-1 text-white hover:bg-[#8B252B]">geschützte Firmenapp</Badge>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Nur angemeldete Mitarbeiter erhalten Zugriff.</h1>
              <p className="mt-5 text-base leading-8 text-[#D7D7DA]">
                Nach dem Login werden Bereiche, Baustellen und einzelne Chats anhand der vergebenen Rechte freigeschaltet.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: LockKeyhole, title: "Loginpflicht" },
                  { icon: ShieldCheck, title: "Rechte je Bereich" },
                  { icon: TreePine, title: "Baustellenzugriff" },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                    <item.icon className="h-6 w-6 text-[#BDBDC2]" />
                    <p className="mt-3 text-sm font-black">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.25rem] border-white/70 bg-white/95 shadow-2xl shadow-[#3B1115]/10">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <img src="/helge-schnirring-logo.svg" alt="Helge Schnirring Logo" className="h-14 w-14 rounded-2xl object-contain shadow-sm" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8B252B]">Firmenapp</p>
                <h2 className="text-2xl font-black">{mode === "login" ? "Anmelden" : "Konto erstellen"}</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              {mode === "signup" && (
                <label className="text-sm font-black text-[#6F7178]">
                  Name
                  <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 h-12 rounded-2xl bg-[#F8F6F3]" placeholder="z. B. Kolonne 1" />
                </label>
              )}
              <label className="text-sm font-black text-[#6F7178]">
                E-Mail
                <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 rounded-2xl bg-[#F8F6F3]" placeholder="name@firma.de" />
              </label>
              <label className="text-sm font-black text-[#6F7178]">
                Passwort
                <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 rounded-2xl bg-[#F8F6F3]" placeholder="Mindestens 6 Zeichen" />
              </label>
              {message && <p className="rounded-2xl bg-[#FFF7F6] p-3 text-sm font-bold text-[#8B252B]">{message}</p>}
              <Button disabled={submitting || loading} className="h-12 rounded-full bg-[#8B252B] text-white hover:bg-[#741E24]">
                {submitting ? "Bitte warten..." : mode === "login" ? "Einloggen" : "Registrieren"}
              </Button>
            </form>

            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-5 text-sm font-black text-[#8B252B] hover:underline">
              {mode === "login" ? "Noch kein Konto? Mitarbeiterkonto erstellen" : "Bereits Konto vorhanden? Einloggen"}
            </button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Login;
