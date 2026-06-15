import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HardHat,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Siren,
  TreePine,
  Truck,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const contacts = [
  {
    name: "Helge Schnirring",
    role: "Geschäftsführung / Einsatzleitung",
    phone: "+49 4100 000001",
    email: "helge.schnirring@firma.de",
    tags: ["Notfall", "Freigaben"],
  },
  {
    name: "Bauleitung Baumpflege",
    role: "Baustellenkoordination",
    phone: "+49 4100 000002",
    email: "bauleitung@firma.de",
    tags: ["Baustelle", "Kolonnen"],
  },
  {
    name: "Werkstatt & Geräte",
    role: "Hubsteiger, PSA, Maschinen",
    phone: "+49 4100 000003",
    email: "werkstatt@firma.de",
    tags: ["Technik", "Prüfung"],
  },
  {
    name: "Verkehrssicherung",
    role: "VAO, Halteverbotszonen, Beschilderung",
    phone: "+49 4100 000004",
    email: "verkehr@firma.de",
    tags: ["VAO", "Absperrung"],
  },
  {
    name: "Büro / Disposition",
    role: "Termine, Kunden, Unterlagen",
    phone: "+49 4100 000005",
    email: "buero@firma.de",
    tags: ["Planung", "Dokumente"],
  },
];

const wikiArticles = [
  {
    title: "Gefährdungsbeurteilung Baumpflege",
    category: "Arbeitsschutz",
    description: "Prüfpunkte für Verkehrsraum, Totholz, Wetter, PSA, Rettungsweg und Maschinenbetrieb.",
    updated: "Heute",
  },
  {
    title: "Betriebsanweisung Hubsteiger",
    category: "Betriebsanweisungen",
    description: "Sichtprüfung, Standplatz, Abstützung, Notablass, Korbbelastung und tägliche Dokumentation.",
    updated: "12.06.",
  },
  {
    title: "Habitatsbeurteilung vor Schnittarbeiten",
    category: "Naturschutz",
    description: "Kontrolle auf Höhlen, Nester, Spaltenquartiere, Fledermäuse und Schutzzeiten.",
    updated: "10.06.",
  },
  {
    title: "Verkehrsbehördliche Anordnung",
    category: "Verkehrssicherung",
    description: "Unterlagen, Pläne, Fristen, Halteverbot und Fotodokumentation für Baustellen im Verkehrsraum.",
    updated: "08.06.",
  },
  {
    title: "Arbeitshilfe Baumkontrolle",
    category: "Arbeitshilfen",
    description: "Baumnummer, Maßnahme, Kronenbereich, Zielzustand, Restgefährdung und Abschlusskontrolle.",
    updated: "04.06.",
  },
];

const workflowSections = [
  {
    id: "risk",
    title: "Gefährdungsbeurteilung",
    icon: ShieldCheck,
    items: ["Wetter, Wind und Licht geprüft", "Arbeitsbereich und Rettungsweg festgelegt", "PSA und Erste-Hilfe-Material vollständig", "Besondere Gefahren am Baum dokumentiert"],
  },
  {
    id: "traffic",
    title: "Verkehr & Halteverbot",
    icon: Siren,
    items: ["VAO liegt digital vor", "Beschilderungsplan geprüft", "Halteverbotszone eingerichtet", "Absperrung fotografisch dokumentiert"],
  },
  {
    id: "trees",
    title: "Baumliste & Abarbeitung",
    icon: TreePine,
    items: ["Baumnummern vor Ort abgeglichen", "Maßnahmen je Baum verständlich", "Schnitt-/Pflegearbeiten abgeschlossen", "Restholz und Verkehrsflächen kontrolliert"],
  },
  {
    id: "lift",
    title: "Hubsteigerkontrolle",
    icon: Truck,
    items: ["Sichtprüfung ohne Mängel", "Abstützung und Untergrund freigegeben", "Notablass getestet", "Korb, Anschlagpunkte und Bedienung geprüft"],
  },
  {
    id: "habitat",
    title: "Habitatsbeurteilung",
    icon: Leaf,
    items: ["Höhlen und Spalten kontrolliert", "Nester und Brutaktivität ausgeschlossen", "Fledermausquartiere bewertet", "Funde und Freigabe dokumentiert"],
  },
];

const trees = [
  { number: "B-014", location: "Zufahrt Nord", task: "Kronenpflege, Totholz entfernen", status: "in Arbeit" },
  { number: "B-015", location: "Parkstreifen", task: "Lichtraumprofil herstellen", status: "offen" },
  { number: "B-016", location: "Innenhof", task: "Habitat prüfen, Pflegeschnitt", status: "erledigt" },
];

const stats = [
  { label: "aktive Baustellen", value: "7", icon: HardHat },
  { label: "Wiki-Dokumente", value: "48", icon: BookOpen },
  { label: "Kontakte", value: "25", icon: UsersRound },
  { label: "offene Prüfungen", value: "11", icon: ClipboardCheck },
];

const Index = () => {
  const [contactQuery, setContactQuery] = useState("");
  const [wikiQuery, setWikiQuery] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({
    "risk-0": true,
    "traffic-0": true,
    "trees-0": true,
  });

  const filteredContacts = useMemo(() => {
    const query = contactQuery.toLowerCase();
    return contacts.filter((contact) =>
      [contact.name, contact.role, contact.email, ...contact.tags].some((value) => value.toLowerCase().includes(query)),
    );
  }, [contactQuery]);

  const filteredArticles = useMemo(() => {
    const query = wikiQuery.toLowerCase();
    return wikiArticles.filter((article) =>
      [article.title, article.category, article.description].some((value) => value.toLowerCase().includes(query)),
    );
  }, [wikiQuery]);

  const totalChecks = workflowSections.reduce((sum, section) => sum + section.items.length, 0);
  const completedChecks = Object.values(checks).filter(Boolean).length;
  const progress = Math.round((completedChecks / totalChecks) * 100);

  return (
    <main className="min-h-screen bg-[#F5F2EE] text-[#1E1E1F]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.28] [background-image:radial-gradient(circle_at_15%_20%,rgba(139,37,43,.16),transparent_30%),linear-gradient(120deg,rgba(189,189,194,.35)_1px,transparent_1px)] [background-size:100%_100%,38px_38px]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/85 px-4 py-3 shadow-lg shadow-[#3B1115]/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src="/helge-schnirring-logo.svg" alt="Helge Schnirring Logo" className="h-14 w-14 rounded-2xl object-cover shadow-sm" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8B252B]">Firmenapp</p>
              <h1 className="text-base font-black leading-tight sm:text-xl">Helge Schnirring</h1>
              <p className="hidden text-sm font-semibold text-[#6F7178] sm:block">Baumpflege · Garten- und Landschaftsbau</p>
            </div>
          </div>
          <Button className="rounded-full bg-[#8B252B] px-4 text-white shadow-md shadow-[#8B252B]/20 hover:bg-[#741E24]">
            <Phone className="mr-2 h-4 w-4" /> Notfall
          </Button>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <Card className="overflow-hidden rounded-[2.25rem] border-0 bg-[#151515] text-white shadow-2xl shadow-[#3B1115]/20">
            <CardContent className="relative p-6 sm:p-8">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-[#8B252B]/45" />
              <div className="absolute bottom-6 right-8 hidden h-44 w-44 rounded-[3rem] border border-white/10 bg-white/5 p-5 md:block">
                <div className="h-full rounded-[2rem] bg-[#8B252B]/25 p-4">
                  <TreePine className="h-14 w-14 text-[#BDBDC2]" />
                  <div className="mt-5 space-y-2">
                    <div className="h-2 rounded-full bg-white/70" />
                    <div className="h-2 w-2/3 rounded-full bg-[#8B252B]" />
                    <div className="h-2 w-4/5 rounded-full bg-white/30" />
                  </div>
                </div>
              </div>
              <div className="relative max-w-2xl">
                <Badge className="rounded-full bg-[#8B252B] px-4 py-1 text-white hover:bg-[#8B252B]">baum gut · garten gut · einfach gute gärten</Badge>
                <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Baustellen sicher planen, prüfen und abarbeiten.</h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-[#D7D7DA]">
                  Zentrale Arbeitsplattform für Telefonliste, Wiki, Betriebsanweisungen und den kompletten Baumpflege-Ablauf von der Gefährdungsbeurteilung bis zur Habitatsfreigabe.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button className="h-12 rounded-full bg-[#8B252B] px-6 text-white hover:bg-[#741E24]">Baustelle öffnen</Button>
                  <Button variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white hover:bg-white hover:text-[#1E1E1F]">
                    Wiki durchsuchen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="rounded-[1.75rem] border-white/70 bg-white/90 shadow-lg shadow-[#3B1115]/10">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B252B]/10 text-[#8B252B]">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-black text-[#1E1E1F]">{stat.value}</p>
                  <p className="mt-1 text-sm font-semibold text-[#6F7178]">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Tabs defaultValue="baustelle" className="relative">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-[1.75rem] bg-[#E8E5E1] p-2 md:grid-cols-4">
            <TabsTrigger value="baustelle" className="rounded-2xl py-3 font-bold data-[state=active]:bg-[#8B252B] data-[state=active]:text-white">Baustelle</TabsTrigger>
            <TabsTrigger value="telefon" className="rounded-2xl py-3 font-bold data-[state=active]:bg-[#8B252B] data-[state=active]:text-white">Telefonliste</TabsTrigger>
            <TabsTrigger value="wiki" className="rounded-2xl py-3 font-bold data-[state=active]:bg-[#8B252B] data-[state=active]:text-white">Wiki</TabsTrigger>
            <TabsTrigger value="uebersicht" className="rounded-2xl py-3 font-bold data-[state=active]:bg-[#8B252B] data-[state=active]:text-white">Übersicht</TabsTrigger>
          </TabsList>

          <TabsContent value="baustelle" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
              <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl font-black">Baustelle Musterallee</CardTitle>
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#6F7178]"><MapPin className="h-4 w-4" /> Musterallee 12, Hamburg</p>
                    </div>
                    <Badge className="rounded-full bg-[#E9F4ED] px-3 py-1 text-[#28643E] hover:bg-[#E9F4ED]">laufend</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-[1.5rem] bg-[#F5F2EE] p-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span>Arbeitsfortschritt</span>
                      <span className="text-[#8B252B]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 rounded-full" />
                    <p className="mt-3 text-sm font-medium text-[#6F7178]">{completedChecks} von {totalChecks} Prüfpunkten abgeschlossen</p>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 rounded-[1.35rem] border border-[#E4DEDA] p-4">
                      <CalendarDays className="h-5 w-5 text-[#8B252B]" />
                      <div><p className="font-bold">Einsatzdatum</p><p className="text-sm text-[#6F7178]">Heute · 07:30–16:00 Uhr</p></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[1.35rem] border border-[#E4DEDA] p-4">
                      <CarFront className="h-5 w-5 text-[#8B252B]" />
                      <div><p className="font-bold">Halteverbotszone</p><p className="text-sm text-[#6F7178]">24 m eingerichtet · Fotobeleg vorhanden</p></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {workflowSections.map((section) => (
                  <Card key={section.id} className="rounded-[1.75rem] border-white/70 bg-white/95 shadow-lg shadow-[#3B1115]/10">
                    <CardContent className="p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B252B]/10 text-[#8B252B]">
                          <section.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black">{section.title}</h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {section.items.map((item, index) => {
                          const id = `${section.id}-${index}`;
                          return (
                            <label key={id} className="flex cursor-pointer items-start gap-3 rounded-[1.15rem] bg-[#F8F6F3] p-3 text-sm font-semibold leading-5 text-[#303033] transition hover:bg-[#F1ECE8]">
                              <Checkbox checked={Boolean(checks[id])} onCheckedChange={(checked) => setChecks((current) => ({ ...current, [id]: checked === true }))} className="mt-0.5 h-5 w-5 rounded-md border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="telefon" className="mt-5">
            <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black"><Phone className="h-6 w-6 text-[#8B252B]" /> Telefonliste</CardTitle>
                <div className="relative pt-2">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 translate-y-[-20%] text-[#8B252B]" />
                  <Input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Kontakt, Funktion oder Stichwort suchen..." className="h-12 rounded-2xl border-[#E2DAD5] bg-[#F8F6F3] pl-12 text-base" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {filteredContacts.map((contact) => (
                  <article key={contact.email} className="rounded-[1.5rem] border border-[#E7E0DC] bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{contact.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-[#6F7178]">{contact.role}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B252B]/10 text-[#8B252B]"><UsersRound className="h-5 w-5" /></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {contact.tags.map((tag) => <Badge key={tag} variant="secondary" className="rounded-full bg-[#F0ECE8] text-[#5A1B20]">{tag}</Badge>)}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button asChild className="flex-1 rounded-full bg-[#8B252B] text-white hover:bg-[#741E24]"><a href={`tel:${contact.phone.replaceAll(" ", "")}`}><Phone className="mr-2 h-4 w-4" />Anrufen</a></Button>
                      <Button asChild variant="outline" className="flex-1 rounded-full border-[#8B252B]/25"><a href={`mailto:${contact.email}`}><Mail className="mr-2 h-4 w-4" />Mail</a></Button>
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wiki" className="mt-5">
            <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black"><BookOpen className="h-6 w-6 text-[#8B252B]" /> Wiki & Arbeitshilfen</CardTitle>
                <div className="relative pt-2">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 translate-y-[-20%] text-[#8B252B]" />
                  <Input value={wikiQuery} onChange={(event) => setWikiQuery(event.target.value)} placeholder="Betriebsanweisung, Anleitung oder Arbeitshilfe suchen..." className="h-12 rounded-2xl border-[#E2DAD5] bg-[#F8F6F3] pl-12 text-base" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {filteredArticles.map((article) => (
                  <article key={article.title} className="group flex items-start gap-4 rounded-[1.5rem] border border-[#E7E0DC] bg-white p-4 transition hover:border-[#8B252B]/30 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8B252B]/10 text-[#8B252B]"><FileText className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{article.title}</h3>
                        <Badge className="rounded-full bg-[#F0ECE8] text-[#5A1B20] hover:bg-[#F0ECE8]">{article.category}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#6F7178]">{article.description}</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8B252B]">aktualisiert {article.updated}</p>
                    </div>
                    <ChevronRight className="mt-3 h-5 w-5 text-[#BDBDC2] transition group-hover:translate-x-1 group-hover:text-[#8B252B]" />
                  </article>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uebersicht" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><TreePine className="h-6 w-6 text-[#8B252B]" /> Zu bearbeitende Bäume</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {trees.map((tree) => (
                    <div key={tree.number} className="grid gap-3 rounded-[1.5rem] border border-[#E7E0DC] bg-white p-4 sm:grid-cols-[.7fr_1fr_auto] sm:items-center">
                      <div><p className="text-xl font-black text-[#8B252B]">{tree.number}</p><p className="text-sm font-semibold text-[#6F7178]">{tree.location}</p></div>
                      <p className="font-semibold">{tree.task}</p>
                      <Badge className={tree.status === "erledigt" ? "rounded-full bg-[#E9F4ED] text-[#28643E] hover:bg-[#E9F4ED]" : tree.status === "in Arbeit" ? "rounded-full bg-[#FFF2D9] text-[#7A4F00] hover:bg-[#FFF2D9]" : "rounded-full bg-[#F0ECE8] text-[#5A1B20] hover:bg-[#F0ECE8]"}>{tree.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-0 bg-[#8B252B] text-white shadow-xl shadow-[#8B252B]/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Tagesfokus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[1.5rem] bg-white/10 p-4">
                    <AlertTriangle className="mb-3 h-7 w-7 text-[#F3D7D9]" />
                    <p className="font-bold">Vor jedem Schnitt: Habitat- und Verkehrsfreigabe prüfen.</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/10 p-4">
                    <Building2 className="mb-3 h-7 w-7 text-[#F3D7D9]" />
                    <p className="font-bold">Büro erhält Abschlussfotos und unterschriebene Prüflisten.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-sm font-bold text-[#F3D7D9]"><CheckCircle2 className="h-5 w-5" /> Offline-taugliche Checklisten als nächste Ausbaustufe</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Index;
