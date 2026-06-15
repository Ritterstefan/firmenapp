import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  HardHat,
  Leaf,
  ListChecks,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Siren,
  TreePine,
  Truck,
  Upload,
  UserCog,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Measure = { id: string; title: string; assignedTo: string; note: string };
type Tree = { number: string; species: string; location: string; measures: Measure[] };
type NoParkingZone = { id: string; title: string; location: string; length: string };
type Site = {
  id: string;
  name: string;
  address: string;
  date: string;
  status: string;
  crew: string;
  noParkingZones: NoParkingZone[];
  trees: Tree[];
};

type PermissionKey = "baustelle" | "gefaehrdung" | "verkehr" | "massnahmen" | "import" | "telefon" | "wiki" | "team" | "aufgaben" | "uebersicht" | "rechte";
type ImportRow = Record<string, string>;

type Employee = { id: string; name: string; role: string };

const permissionAreas: { key: PermissionKey; label: string; description: string }[] = [
  { key: "baustelle", label: "Baustellen öffnen", description: "Grunddaten und Baustellenauswahl sehen" },
  { key: "gefaehrdung", label: "Gefährdung", description: "Gefährdungsbeurteilung abhaken" },
  { key: "verkehr", label: "Verkehr & HVZ", description: "Halteverbote dokumentieren" },
  { key: "massnahmen", label: "Baummaßnahmen", description: "Arbeiten je Baum abarbeiten" },
  { key: "import", label: "Excel-Import", description: "Baumarbeiten aus Dateien einspielen" },
  { key: "telefon", label: "Telefonliste", description: "Kontakte anzeigen" },
  { key: "wiki", label: "Wiki", description: "Arbeitshilfen lesen" },
  { key: "team", label: "Teamchat", description: "Nachrichten lesen und schreiben" },
  { key: "aufgaben", label: "Teamaufgaben", description: "Aufgaben anlegen und abhaken" },
  { key: "uebersicht", label: "Übersicht", description: "Baustellen-Kennzahlen sehen" },
  { key: "rechte", label: "Rechte verwalten", description: "Zugriffe je Mitarbeiter vergeben" },
];

const employees: Employee[] = [
  { id: "helge", name: "Helge Schnirring", role: "Geschäftsführung" },
  { id: "bauleitung", name: "Bauleitung", role: "Baustellenkoordination" },
  { id: "kolonne-1", name: "Kolonne 1", role: "Baumpflege-Team" },
  { id: "werkstatt", name: "Werkstatt", role: "Geräte & PSA" },
  { id: "buero", name: "Büro", role: "Disposition" },
];

const fullPermissions = permissionAreas.reduce(
  (permissions, area) => ({ ...permissions, [area.key]: true }),
  {} as Record<PermissionKey, boolean>,
);

const initialEmployeePermissions: Record<string, Record<PermissionKey, boolean>> = {
  helge: fullPermissions,
  bauleitung: { ...fullPermissions, rechte: false },
  "kolonne-1": {
    baustelle: true,
    gefaehrdung: true,
    verkehr: true,
    massnahmen: true,
    import: false,
    telefon: true,
    wiki: true,
    team: true,
    aufgaben: true,
    uebersicht: true,
    rechte: false,
  },
  werkstatt: {
    baustelle: true,
    gefaehrdung: false,
    verkehr: false,
    massnahmen: true,
    import: false,
    telefon: true,
    wiki: true,
    team: true,
    aufgaben: true,
    uebersicht: false,
    rechte: false,
  },
  buero: {
    baustelle: true,
    gefaehrdung: false,
    verkehr: true,
    massnahmen: false,
    import: true,
    telefon: true,
    wiki: true,
    team: true,
    aufgaben: true,
    uebersicht: true,
    rechte: false,
  },
};

const tabPermissions: Record<string, PermissionKey> = {
  baustelle: "baustelle",
  telefon: "telefon",
  wiki: "wiki",
  team: "team",
  uebersicht: "uebersicht",
  rechte: "rechte",
};

const tabItems = [
  { value: "baustelle", label: "Baustelle" },
  { value: "telefon", label: "Telefonliste" },
  { value: "wiki", label: "Wiki" },
  { value: "team", label: "Teamchat" },
  { value: "uebersicht", label: "Übersicht" },
  { value: "rechte", label: "Rechte" },
];

const LockedPanel = ({ title, description }: { title: string; description: string }) => (
  <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
    <CardContent className="flex items-start gap-4 p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8B252B]/10 text-[#8B252B]">
        <LockKeyhole className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-xl font-black text-[#1E1E1F]">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#6F7178]">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const contacts = [
  { name: "Helge Schnirring", role: "Geschäftsführung / Einsatzleitung", phone: "+49 4100 000001", email: "helge.schnirring@firma.de", tags: ["Notfall", "Freigaben"] },
  { name: "Bauleitung Baumpflege", role: "Baustellenkoordination", phone: "+49 4100 000002", email: "bauleitung@firma.de", tags: ["Baustelle", "Kolonnen"] },
  { name: "Werkstatt & Geräte", role: "Hubsteiger, PSA, Maschinen", phone: "+49 4100 000003", email: "werkstatt@firma.de", tags: ["Technik", "Prüfung"] },
  { name: "Verkehrssicherung", role: "VAO, Halteverbotszonen, Beschilderung", phone: "+49 4100 000004", email: "verkehr@firma.de", tags: ["VAO", "Absperrung"] },
  { name: "Büro / Disposition", role: "Termine, Kunden, Unterlagen", phone: "+49 4100 000005", email: "buero@firma.de", tags: ["Planung", "Dokumente"] },
];

const wikiArticles = [
  { title: "Gefährdungsbeurteilung Baumpflege", category: "Arbeitsschutz", description: "Prüfpunkte für Verkehrsraum, Totholz, Wetter, PSA, Rettungsweg und Maschinenbetrieb.", updated: "Heute" },
  { title: "Betriebsanweisung Hubsteiger", category: "Betriebsanweisungen", description: "Sichtprüfung, Standplatz, Abstützung, Notablass, Korbbelastung und tägliche Dokumentation.", updated: "12.06." },
  { title: "Habitatsbeurteilung vor Schnittarbeiten", category: "Naturschutz", description: "Kontrolle auf Höhlen, Nester, Spaltenquartiere, Fledermäuse und Schutzzeiten.", updated: "10.06." },
  { title: "Verkehrsbehördliche Anordnung", category: "Verkehrssicherung", description: "Unterlagen, Pläne, Fristen, Halteverbot und Fotodokumentation für Baustellen im Verkehrsraum.", updated: "08.06." },
  { title: "Arbeitshilfe Baumkontrolle", category: "Arbeitshilfen", description: "Baumnummer, Maßnahme, Kronenbereich, Zielzustand, Restgefährdung und Abschlusskontrolle.", updated: "04.06." },
];

const riskItems = [
  "Wetter, Wind und Licht geprüft",
  "Arbeitsbereich und Rettungsweg festgelegt",
  "PSA und Erste-Hilfe-Material vollständig",
  "Besondere Gefahren am Baum / Umfeld dokumentiert",
  "Unterweisung der Kolonne erfolgt",
];

const treeInspectionSections = [
  {
    id: "lift",
    title: "Hubsteigerkontrolle",
    icon: Truck,
    items: ["Standplatz am Baum geeignet", "Abstützung und Untergrund geprüft", "Arbeitsbereich im Korb erreichbar", "Notablass und Rettungsweg bekannt"],
  },
  {
    id: "habitat",
    title: "Habitatskontrolle",
    icon: Leaf,
    items: ["Höhlen, Spalten und Rindenabplatzungen kontrolliert", "Nester und Brutaktivität ausgeschlossen", "Fledermaus- oder Tierhinweise bewertet", "Freigabe vor Schnitt dokumentiert"],
  },
];

const initialSites: Site[] = [
  {
    id: "site-musterallee",
    name: "Baustelle Musterallee",
    address: "Musterallee 12, Hamburg",
    date: "Heute · 07:30–16:00 Uhr",
    status: "laufend",
    crew: "Kolonne 1 + Hubsteigerteam",
    noParkingZones: [
      { id: "hvz-1", title: "Halteverbot Zufahrt Nord", location: "Musterallee 12–18", length: "24 m" },
      { id: "hvz-2", title: "Halteverbot Parkstreifen", location: "gegenüber Musterallee 20", length: "18 m" },
      { id: "hvz-3", title: "Halteverbot Ladezone", location: "Innenhof-Einfahrt", length: "12 m" },
    ],
    trees: [
      {
        number: "B-014",
        species: "Linde",
        location: "Zufahrt Nord",
        measures: [
          { id: "b014-1", title: "Totholz ab 3 cm entfernen", assignedTo: "Kolonne 1", note: "Kronenbereich über Gehweg zuerst bearbeiten." },
          { id: "b014-2", title: "Kronenpflege nach ZTV-Baumpflege", assignedTo: "Schnittteam", note: "Keine Starkastschnitte ohne Rücksprache." },
          { id: "b014-3", title: "Lichtraumprofil zur Zufahrt herstellen", assignedTo: "Hubsteigerteam", note: "Mindesthöhe 4,50 m beachten." },
        ],
      },
      {
        number: "B-015",
        species: "Ahorn",
        location: "Parkstreifen",
        measures: [
          { id: "b015-1", title: "Habitat-Check an Stammhöhlen durchführen", assignedTo: "Baumkontrolle", note: "Vor Schnittbeginn fotografisch dokumentieren." },
          { id: "b015-2", title: "Lichtraumprofil Gehweg herstellen", assignedTo: "Kolonne 2", note: "Absperrung zur Straße aufrechterhalten." },
          { id: "b015-3", title: "Schnittgut aufnehmen und Fahrbahn reinigen", assignedTo: "Bodenmannschaft", note: "Abschlussfoto für Büro erstellen." },
        ],
      },
    ],
  },
  {
    id: "site-innenhof",
    name: "Baustelle Innenhofanlage",
    address: "Gartenhof 4, Norderstedt",
    date: "Morgen · 08:00–14:30 Uhr",
    status: "vorbereitet",
    crew: "Kolonne 2",
    noParkingZones: [
      { id: "hvz-4", title: "Halteverbot Hofzufahrt", location: "Gartenhof 4", length: "10 m" },
    ],
    trees: [
      {
        number: "B-021",
        species: "Eiche",
        location: "Innenhof",
        measures: [
          { id: "b021-1", title: "Habitatsfreigabe bestätigen", assignedTo: "Baumkontrolle", note: "Spalten und Höhlen kontrollieren." },
          { id: "b021-2", title: "Pflegeschnitt im unteren Kronendrittel", assignedTo: "Schnittteam", note: "Schonend schneiden, Zielzustand dokumentieren." },
        ],
      },
    ],
  },
];

const stats = [
  { label: "aktive Baustellen", value: "7", icon: HardHat },
  { label: "Wiki-Dokumente", value: "48", icon: BookOpen },
  { label: "Kontakte", value: "25", icon: UsersRound },
  { label: "offene Prüfungen", value: "11", icon: ClipboardCheck },
];

const initialMessages = [
  { id: "msg-1", scope: "site-musterallee", author: "Bauleitung", time: "07:18", text: "Musterallee: VAO liegt vor, bitte Halteverbote vor Arbeitsbeginn fotografieren." },
  { id: "msg-2", scope: "site-musterallee", author: "Kolonne 1", time: "07:42", text: "B-014 ist abgesperrt. Wir starten mit Totholz über dem Gehweg." },
  { id: "msg-3", scope: "team", author: "Werkstatt", time: "08:05", text: "Hubsteiger 2 ist einsatzbereit, Schlüssel liegt im Gerätefach." },
];

const initialTeamTasks = [
  { id: "task-1", title: "Fotos Halteverbot Musterallee hochladen", owner: "Kolonne 1", scope: "Baustelle Musterallee", priority: "hoch" },
  { id: "task-2", title: "Rückfrage Kunde Innenhofanlage beantworten", owner: "Büro", scope: "Baustelle Innenhofanlage", priority: "mittel" },
  { id: "task-3", title: "PSA-Set Hubsteigerteam prüfen", owner: "Werkstatt", scope: "Team", priority: "normal" },
];

const normalizeColumnName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");

const getImportValue = (row: ImportRow, keys: string[]) => {
  for (const key of keys) {
    const value = row[normalizeColumnName(key)];
    if (value) return value;
  }
  return "";
};

const createSlug = (value: string) =>
  normalizeColumnName(value)
    .slice(0, 36)
    .replace(/^$/, `import${Date.now()}`);

const splitDelimitedLine = (line: string, separator: string) => {
  const cells: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];
    if (char === '"' && nextChar === '"' && inQuotes) {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
};

const parseRowsFromTable = (tableRows: string[][]) => {
  const filledRows = tableRows.filter((row) => row.some((cell) => cell.trim()));
  const headers = filledRows[0]?.map(normalizeColumnName) ?? [];
  return filledRows.slice(1).map((row) =>
    headers.reduce((entry, header, index) => ({ ...entry, [header]: row[index]?.trim() ?? "" }), {} as ImportRow),
  );
};

const parseDelimitedText = (text: string) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const separators = [";", "\t", ","];
  const separator = separators.reduce((best, candidate) =>
    splitDelimitedLine(lines[0] ?? "", candidate).length > splitDelimitedLine(lines[0] ?? "", best).length ? candidate : best,
  );
  return parseRowsFromTable(lines.map((line) => splitDelimitedLine(line, separator)));
};

const parseExcelXmlText = (text: string) => {
  const document = new DOMParser().parseFromString(text, "text/xml");
  const rows = Array.from(document.getElementsByTagName("Row")).map((row) =>
    Array.from(row.getElementsByTagName("Data")).map((cell) => cell.textContent?.trim() ?? ""),
  );
  return parseRowsFromTable(rows);
};

const inflateRawText = async (data: Uint8Array) => {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Der Browser kann XLSX-Dateien nicht direkt entpacken. Bitte als CSV exportieren.");
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
};

const unzipXmlFiles = async (buffer: ArrayBuffer) => {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder();
  const files: Record<string, string> = {};

  for (let offset = 0; offset < bytes.length - 46; offset += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) continue;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const fileName = decoder.decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));

    if (fileName.endsWith(".xml") && view.getUint32(localHeaderOffset, true) === 0x04034b50) {
      const localNameLength = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressedData = bytes.slice(dataStart, dataStart + compressedSize);
      files[fileName] = method === 0 ? decoder.decode(compressedData) : await inflateRawText(compressedData);
    }

    offset += 45 + fileNameLength + extraLength + commentLength;
  }

  return files;
};

const parseXlsxBuffer = async (buffer: ArrayBuffer) => {
  const files = await unzipXmlFiles(buffer);
  const sheetXml = files["xl/worksheets/sheet1.xml"] ?? Object.entries(files).find(([name]) => name.startsWith("xl/worksheets/sheet"))?.[1];
  if (!sheetXml) throw new Error("Im XLSX wurde kein Tabellenblatt gefunden.");

  const sharedDocument = files["xl/sharedStrings.xml"] ? new DOMParser().parseFromString(files["xl/sharedStrings.xml"], "text/xml") : null;
  const sharedStrings = sharedDocument
    ? Array.from(sharedDocument.getElementsByTagName("si")).map((item) => Array.from(item.getElementsByTagName("t")).map((textNode) => textNode.textContent ?? "").join(""))
    : [];

  const sheetDocument = new DOMParser().parseFromString(sheetXml, "text/xml");
  const rows = Array.from(sheetDocument.getElementsByTagName("row")).map((row) => {
    const cells: string[] = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      const reference = cell.getAttribute("r") ?? "A1";
      const letters = reference.replace(/[0-9]/g, "");
      const columnIndex = letters.split("").reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
      const type = cell.getAttribute("t");
      const rawValue = cell.getElementsByTagName("v")[0]?.textContent ?? "";
      const inlineValue = cell.getElementsByTagName("t")[0]?.textContent ?? "";
      cells[columnIndex] = type === "s" ? sharedStrings[Number(rawValue)] ?? "" : type === "inlineStr" ? inlineValue : rawValue;
    });
    return cells;
  });

  return parseRowsFromTable(rows);
};

const readTextFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsText(file, "utf-8");
  });

const readBufferFile = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsArrayBuffer(file);
  });

const Index = () => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [activeTab, setActiveTab] = useState("baustelle");
  const [activeSiteId, setActiveSiteId] = useState(initialSites[0].id);
  const [openTreeKey, setOpenTreeKey] = useState(`${initialSites[0].id}-${initialSites[0].trees[0].number}`);
  const [openTreeToolKey, setOpenTreeToolKey] = useState(`${initialSites[0].id}-${initialSites[0].trees[0].number}-lift`);
  const [activeEmployeeId, setActiveEmployeeId] = useState(employees[0].id);
  const [employeePermissions, setEmployeePermissions] = useState(initialEmployeePermissions);
  const [importFeedback, setImportFeedback] = useState("Noch keine Datei importiert.");
  const [contactQuery, setContactQuery] = useState("");
  const [wikiQuery, setWikiQuery] = useState("");
  const [chatScope, setChatScope] = useState("site-musterallee");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [teamTaskItems, setTeamTaskItems] = useState(initialTeamTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({
    "task-2": true,
  });
  const [treeMeasureChecks, setTreeMeasureChecks] = useState<Record<string, boolean>>({
    "b021-1": true,
  });
  const [treeInspectionChecks, setTreeInspectionChecks] = useState<Record<string, boolean>>({
    "site-innenhof-B-021-habitat-0": true,
  });
  const [riskChecks, setRiskChecks] = useState<Record<string, boolean>>({
    "site-musterallee-risk-0": true,
    "site-musterallee-risk-1": true,
  });
  const [noParkingDocs, setNoParkingDocs] = useState<Record<string, { start: string; end: string; installed: boolean; removed: boolean }>>({
    "hvz-1": { start: "06:30", end: "16:30", installed: true, removed: false },
    "hvz-2": { start: "07:00", end: "15:30", installed: false, removed: false },
    "hvz-3": { start: "07:15", end: "14:00", installed: false, removed: false },
    "hvz-4": { start: "07:00", end: "15:00", installed: false, removed: false },
  });

  const activeEmployee = employees.find((employee) => employee.id === activeEmployeeId) ?? employees[0];
  const canAccess = (permission: PermissionKey) => employeePermissions[activeEmployeeId]?.[permission] ?? false;
  const activeSite = sites.find((site) => site.id === activeSiteId) ?? sites[0];

  const dashboardStats = [
    { label: "Baustellen", value: String(sites.length), icon: HardHat },
    { label: "Bäume", value: String(sites.reduce((sum, site) => sum + site.trees.length, 0)), icon: TreePine },
    { label: "Kontakte", value: String(contacts.length), icon: UsersRound },
    { label: "offene Prüfungen", value: "11", icon: ClipboardCheck },
  ];

  useEffect(() => {
    if (!canAccess(tabPermissions[activeTab])) {
      const firstAllowedTab = tabItems.find((tab) => canAccess(tabPermissions[tab.value]));
      setActiveTab(firstAllowedTab?.value ?? "baustelle");
    }
  }, [activeEmployeeId, employeePermissions, activeTab]);

  const selectTab = (tab: string) => {
    if (canAccess(tabPermissions[tab])) setActiveTab(tab);
  };

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

  const getSiteMeasureStats = (site: (typeof sites)[number]) => {
    const total = site.trees.reduce((sum, tree) => sum + tree.measures.length, 0);
    const done = site.trees.reduce((sum, tree) => sum + tree.measures.filter((measure) => treeMeasureChecks[measure.id]).length, 0);
    return { total, done, progress: total ? Math.round((done / total) * 100) : 0 };
  };

  const activeMeasureStats = getSiteMeasureStats(activeSite);
  const activeRiskDone = riskItems.filter((_, index) => riskChecks[`${activeSite.id}-risk-${index}`]).length;
  const activeNoParkingDone = activeSite.noParkingZones.filter((zone) => noParkingDocs[zone.id]?.installed && noParkingDocs[zone.id]?.removed).length;
  const inspectionsPerSite = activeSite.trees.length * treeInspectionSections.reduce((sum, section) => sum + section.items.length, 0);
  const activeInspectionDone = activeSite.trees.reduce(
    (treeSum, tree) =>
      treeSum +
      treeInspectionSections.reduce(
        (sectionSum, section) => sectionSum + section.items.filter((_, index) => treeInspectionChecks[`${activeSite.id}-${tree.number}-${section.id}-${index}`]).length,
        0,
      ),
    0,
  );
  const siteProgress = Math.round(((activeRiskDone + activeNoParkingDone + activeMeasureStats.done + activeInspectionDone) / (riskItems.length + activeSite.noParkingZones.length + activeMeasureStats.total + inspectionsPerSite)) * 100);

  const openSite = (siteId: string) => {
    const site = sites.find((item) => item.id === siteId) ?? sites[0];
    setActiveSiteId(site.id);
    setChatScope(site.id);
    setOpenTreeKey(`${site.id}-${site.trees[0].number}`);
    setOpenTreeToolKey(`${site.id}-${site.trees[0].number}-lift`);
    setActiveTab("baustelle");
  };

  const visibleMessages = messages.filter((message) => message.scope === chatScope || message.scope === "team");

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { id: `msg-${Date.now()}`, scope: chatScope, author: activeEmployee.name, time: "jetzt", text },
    ]);
    setNewMessage("");
  };

  const createTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const scope = chatScope === "team" ? "Team" : sites.find((site) => site.id === chatScope)?.name ?? "Team";
    setTeamTaskItems((current) => [
      { id: `task-${Date.now()}`, title, owner: activeEmployee.name, scope, priority: "normal" },
      ...current,
    ]);
    setNewTaskTitle("");
  };

  const importRowsIntoSites = (rows: ImportRow[]) => {
    let importedTrees = 0;
    let importedMeasures = 0;
    let firstImportedSiteId = "";
    let firstImportedTreeNumber = "";
    const importedParkingDocs: Record<string, { start: string; end: string; installed: boolean; removed: boolean }> = {};

    setSites((currentSites) => {
      const nextSites: Site[] = currentSites.map((site) => ({
        ...site,
        noParkingZones: site.noParkingZones.map((zone) => ({ ...zone })),
        trees: site.trees.map((tree) => ({ ...tree, measures: tree.measures.map((measure) => ({ ...measure })) })),
      }));

      rows.forEach((row, rowIndex) => {
        const siteName = getImportValue(row, ["Baustelle", "Baustellenname", "Projekt"]) || activeSite.name;
        const siteAddress = getImportValue(row, ["Adresse", "Anschrift"]) || activeSite.address;
        const siteId = nextSites.find((site) => site.name === siteName || site.address === siteAddress)?.id ?? `site-${createSlug(`${siteName}-${siteAddress}`)}`;
        let site = nextSites.find((item) => item.id === siteId);

        if (!site) {
          site = {
            id: siteId,
            name: siteName.startsWith("Baustelle") ? siteName : `Baustelle ${siteName}`,
            address: siteAddress,
            date: getImportValue(row, ["Termin", "Datum", "Zeit"]) || "Importiert · Termin offen",
            status: getImportValue(row, ["Status"]) || "importiert",
            crew: getImportValue(row, ["Kolonne", "Team", "Crew"]) || "noch zuweisen",
            noParkingZones: [],
            trees: [],
          };
          nextSites.push(site);
        }

        firstImportedSiteId ||= site.id;

        const noParkingTitle = getImportValue(row, ["Halteverbot", "HVZ", "Halteverbot Titel"]);
        if (noParkingTitle && !site.noParkingZones.some((zone) => zone.title === noParkingTitle)) {
          const zoneId = `hvz-${Date.now()}-${rowIndex}`;
          site.noParkingZones.push({
            id: zoneId,
            title: noParkingTitle,
            location: getImportValue(row, ["HVZ Standort", "Halteverbot Standort", "HVZ Lage"]) || site.address,
            length: getImportValue(row, ["HVZ Länge", "Laenge", "Länge"]) || "offen",
          });
          importedParkingDocs[zoneId] = { start: "", end: "", installed: false, removed: false };
        }

        const treeNumber = getImportValue(row, ["Baumnummer", "Baum Nr", "Baum", "Nr"]) || `B-IMP-${rowIndex + 1}`;
        let tree = site.trees.find((item) => item.number === treeNumber);
        if (!tree) {
          tree = {
            number: treeNumber,
            species: getImportValue(row, ["Baumart", "Art", "Species"]) || "Baumart offen",
            location: getImportValue(row, ["Standort", "Baumstandort", "Lage"]) || site.address,
            measures: [],
          };
          site.trees.push(tree);
          importedTrees += 1;
        }
        firstImportedTreeNumber ||= tree.number;

        const measureTitle = getImportValue(row, ["Maßnahme", "Massnahme", "Arbeit", "Arbeiten", "Aufgabe"]);
        if (measureTitle) {
          tree.measures.push({
            id: `imp-${Date.now()}-${rowIndex}-${tree.measures.length}`,
            title: measureTitle,
            assignedTo: getImportValue(row, ["Zuständig", "Zustaendig", "Mitarbeiter", "Team", "Kolonne"]) || "noch zuweisen",
            note: getImportValue(row, ["Notiz", "Hinweis", "Bemerkung"]) || "Aus Excel importiert.",
          });
          importedMeasures += 1;
        }
      });

      return nextSites;
    });

    if (Object.keys(importedParkingDocs).length) {
      setNoParkingDocs((current) => ({ ...current, ...importedParkingDocs }));
    }

    if (firstImportedSiteId) {
      setActiveSiteId(firstImportedSiteId);
      setChatScope(firstImportedSiteId);
      setOpenTreeKey(`${firstImportedSiteId}-${firstImportedTreeNumber}`);
      setOpenTreeToolKey(`${firstImportedSiteId}-${firstImportedTreeNumber}-lift`);
      setActiveTab("baustelle");
    }

    return { importedTrees, importedMeasures };
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file || !canAccess("import")) return;

    try {
      const fileName = file.name.toLowerCase();
      const rows = fileName.endsWith(".xlsx")
        ? await parseXlsxBuffer(await readBufferFile(file))
        : fileName.endsWith(".xml") || fileName.endsWith(".xls")
          ? parseExcelXmlText(await readTextFile(file))
          : parseDelimitedText(await readTextFile(file));

      const usableRows = rows.filter((row) => Object.values(row).some(Boolean));
      if (!usableRows.length) throw new Error("Keine auswertbaren Zeilen gefunden.");
      const result = importRowsIntoSites(usableRows);
      setImportFeedback(`${usableRows.length} Zeilen verarbeitet · ${result.importedTrees} neue Bäume · ${result.importedMeasures} Maßnahmen importiert.`);
    } catch (error) {
      setImportFeedback(error instanceof Error ? error.message : "Der Import konnte nicht verarbeitet werden.");
    }
  };

  const togglePermission = (employeeId: string, permission: PermissionKey, checked: boolean) => {
    setEmployeePermissions((current) => ({
      ...current,
      [employeeId]: {
        ...current[employeeId],
        [permission]: checked,
      },
    }));
  };

  return (
    <main className="min-h-screen bg-[#F5F2EE] text-[#1E1E1F]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.28] [background-image:radial-gradient(circle_at_15%_20%,rgba(139,37,43,.16),transparent_30%),linear-gradient(120deg,rgba(189,189,194,.35)_1px,transparent_1px)] [background-size:100%_100%,38px_38px]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/85 px-4 py-3 shadow-lg shadow-[#3B1115]/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src="/helge-schnirring-logo.svg" alt="Helge Schnirring Logo" className="h-14 w-14 rounded-2xl object-contain shadow-sm" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8B252B]">Firmenapp</p>
              <h1 className="text-base font-black leading-tight sm:text-xl">Helge Schnirring</h1>
              <p className="hidden text-sm font-semibold text-[#6F7178] sm:block">Baumpflege · Garten- und Landschaftsbau</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#8B252B] md:block">Zugriff</label>
            <select
              value={activeEmployeeId}
              onChange={(event) => setActiveEmployeeId(event.target.value)}
              className="h-11 rounded-full border border-[#E2DAD5] bg-[#F8F6F3] px-3 text-sm font-bold text-[#1E1E1F] outline-none focus:border-[#8B252B]"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
            <Button className="rounded-full bg-[#8B252B] px-4 text-white shadow-md shadow-[#8B252B]/20 hover:bg-[#741E24]">
              <Phone className="mr-2 h-4 w-4" /> Notfall
            </Button>
          </div>
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
                <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Baustellen sicher planen, prüfen und per Excel befüllen.</h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-[#D7D7DA]">
                  Baumarbeiten können je Baustelle aus Excel importiert werden. Zusätzlich steuert die Rechtematrix, welche Mitarbeiter Gefährdung, Verkehr, Maßnahmen, Chat oder Verwaltung sehen und bearbeiten dürfen.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => selectTab("baustelle")} className="h-12 rounded-full bg-[#8B252B] px-6 text-white hover:bg-[#741E24]">Baustelle öffnen</Button>
                  <Button onClick={() => selectTab("uebersicht")} variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white hover:bg-white hover:text-[#1E1E1F]">
                    Baustellenübersicht
                  </Button>
                  <Button onClick={() => selectTab("rechte")} variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white hover:bg-white hover:text-[#1E1E1F]">
                    Rechte verwalten
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {dashboardStats.map((stat) => (
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

        <Tabs value={activeTab} onValueChange={selectTab} className="relative">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-[1.75rem] bg-[#E8E5E1] p-2 md:grid-cols-6">
            {tabItems.map((tab) => {
              const allowed = canAccess(tabPermissions[tab.value]);
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={!allowed}
                  className="rounded-2xl py-3 font-bold data-[state=active]:bg-[#8B252B] data-[state=active]:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="baustelle" className="mt-5">
            <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
              <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Baustellen</CardTitle>
                  <p className="text-sm font-semibold text-[#6F7178]">Wähle eine Baustelle aus oder importiere Baumarbeiten aus Excel. Unterstützt werden .xlsx, .csv und Excel-XML mit Spalten wie Baustelle, Adresse, Baumnummer, Baumart, Standort, Maßnahme, Zuständig und Notiz.</p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="rounded-[1.5rem] border border-dashed border-[#8B252B]/35 bg-[#FFF7F6] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8B252B] text-white">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-[#1E1E1F]">Excel-Import für Baumarbeiten</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[#6F7178]">{importFeedback}</p>
                        {canAccess("import") ? (
                          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#8B252B] px-4 py-2 text-sm font-black text-white shadow-md shadow-[#8B252B]/20 hover:bg-[#741E24]">
                            <Upload className="h-4 w-4" /> Datei auswählen
                            <input
                              type="file"
                              accept=".xlsx,.xls,.xml,.csv,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              className="sr-only"
                              onChange={(event) => {
                                void handleImportFile(event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                        ) : (
                          <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-bold text-[#8B252B]">Für diesen Mitarbeiter ist der Excel-Import gesperrt.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {sites.map((site) => {
                    const statsForSite = getSiteMeasureStats(site);
                    const isActive = activeSite.id === site.id;
                    return (
                      <button key={site.id} type="button" onClick={() => openSite(site.id)} className={isActive ? "rounded-[1.5rem] border border-[#8B252B]/40 bg-[#FFF7F6] p-4 text-left shadow-md shadow-[#8B252B]/10" : "rounded-[1.5rem] border border-[#E7E0DC] bg-white p-4 text-left transition hover:border-[#8B252B]/30 hover:shadow-md"}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-black text-[#1E1E1F]">{site.name}</p>
                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#6F7178]"><MapPin className="h-4 w-4" /> {site.address}</p>
                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#6F7178]"><CalendarDays className="h-4 w-4" /> {site.date}</p>
                          </div>
                          <ChevronRight className={isActive ? "h-5 w-5 rotate-90 text-[#8B252B]" : "h-5 w-5 text-[#BDBDC2]"} />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge className="rounded-full bg-[#F0ECE8] text-[#5A1B20] hover:bg-[#F0ECE8]">{site.trees.length} Bäume</Badge>
                          <Badge className="rounded-full bg-[#F0ECE8] text-[#5A1B20] hover:bg-[#F0ECE8]">{statsForSite.done}/{statsForSite.total} Maßnahmen</Badge>
                          <Badge className="rounded-full bg-[#E9F4ED] text-[#28643E] hover:bg-[#E9F4ED]">{site.status}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="grid gap-5">
                <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-2xl font-black">{activeSite.name}</CardTitle>
                        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#6F7178]"><MapPin className="h-4 w-4" /> {activeSite.address}</p>
                        <p className="mt-1 text-sm font-semibold text-[#6F7178]">{activeSite.date} · {activeSite.crew}</p>
                      </div>
                      <Badge className="w-fit rounded-full bg-[#E9F4ED] px-3 py-1 text-[#28643E] hover:bg-[#E9F4ED]">{siteProgress}% Baustellenfortschritt</Badge>
                    </div>
                    <div className="mt-4 rounded-[1.5rem] bg-[#F5F2EE] p-4">
                      <div className="mb-2 flex items-center justify-between text-sm font-bold">
                        <span>Baustellenfortschritt</span>
                        <span className="text-[#8B252B]">{siteProgress}%</span>
                      </div>
                      <Progress value={siteProgress} className="h-3 rounded-full" />
                    </div>
                  </CardHeader>
                </Card>

                {canAccess("gefaehrdung") ? (
                  <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-black"><ShieldCheck className="h-6 w-6 text-[#8B252B]" /> Gefährdungsbeurteilung</CardTitle>
                      <p className="text-sm font-semibold text-[#6F7178]">Diese Gefährdungsbeurteilung gehört einmal zu dieser Baustelle.</p>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      {riskItems.map((item, index) => {
                        const id = `${activeSite.id}-risk-${index}`;
                        return (
                          <label key={id} className="flex cursor-pointer items-start gap-3 rounded-[1.15rem] bg-[#F8F6F3] p-3 text-sm font-semibold leading-5 text-[#303033] transition hover:bg-[#F1ECE8]">
                            <Checkbox checked={Boolean(riskChecks[id])} onCheckedChange={(checked) => setRiskChecks((current) => ({ ...current, [id]: checked === true }))} className="mt-0.5 h-5 w-5 rounded-md border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </CardContent>
                  </Card>
                ) : <LockedPanel title="Gefährdungsbeurteilung gesperrt" description="Der ausgewählte Mitarbeiter darf diesen Bereich nicht sehen oder bearbeiten." />}

                {canAccess("verkehr") ? (
                <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black"><Siren className="h-6 w-6 text-[#8B252B]" /> Verkehr & Halteverbote</CardTitle>
                    <p className="text-sm font-semibold text-[#6F7178]">Dieser Punkt gehört einmal zur Baustelle. Jedes Halteverbot wird einzeln mit Anfang und Ende dokumentiert.</p>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {activeSite.noParkingZones.map((zone) => {
                      const doc = noParkingDocs[zone.id];
                      return (
                        <div key={zone.id} className="rounded-[1.35rem] border border-[#E7E0DC] bg-[#F8F6F3] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-black text-[#1E1E1F]">{zone.title}</p>
                              <p className="text-sm font-semibold text-[#6F7178]">{zone.location} · {zone.length}</p>
                            </div>
                            <Badge className={doc?.installed && doc?.removed ? "rounded-full bg-[#E9F4ED] text-[#28643E] hover:bg-[#E9F4ED]" : "rounded-full bg-[#FFF2D9] text-[#7A4F00] hover:bg-[#FFF2D9]"}>
                              {doc?.installed && doc?.removed ? "fertig dokumentiert" : "Dokumentation offen"}
                            </Badge>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <label className="text-sm font-bold text-[#6F7178]">
                              Anfang
                              <Input value={doc?.start ?? ""} onChange={(event) => setNoParkingDocs((current) => ({ ...current, [zone.id]: { ...current[zone.id], start: event.target.value } }))} className="mt-1 h-10 rounded-xl bg-white" placeholder="z. B. 06:30" />
                            </label>
                            <label className="text-sm font-bold text-[#6F7178]">
                              Ende
                              <Input value={doc?.end ?? ""} onChange={(event) => setNoParkingDocs((current) => ({ ...current, [zone.id]: { ...current[zone.id], end: event.target.value } }))} className="mt-1 h-10 rounded-xl bg-white" placeholder="z. B. 16:30" />
                            </label>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm font-bold">
                              <Checkbox checked={Boolean(doc?.installed)} onCheckedChange={(checked) => setNoParkingDocs((current) => ({ ...current, [zone.id]: { ...current[zone.id], installed: checked === true } }))} className="h-5 w-5 rounded-md border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                              Aufgestellt dokumentiert
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm font-bold">
                              <Checkbox checked={Boolean(doc?.removed)} onCheckedChange={(checked) => setNoParkingDocs((current) => ({ ...current, [zone.id]: { ...current[zone.id], removed: checked === true } }))} className="h-5 w-5 rounded-md border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                              Abgebaut dokumentiert
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                ) : <LockedPanel title="Verkehr & Halteverbote gesperrt" description="Der ausgewählte Mitarbeiter hat keinen Zugriff auf die Verkehrsdokumentation dieser Baustelle." />}

                {canAccess("massnahmen") ? (
                <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black"><TreePine className="h-6 w-6 text-[#8B252B]" /> Maßnahmen je Baum</CardTitle>
                    <p className="text-sm font-semibold text-[#6F7178]">Die Baummaßnahmen gehören zu dieser Baustelle. Baum öffnen, Maßnahmen abhaken und daraus Hubsteiger- oder Habitatskontrolle öffnen.</p>
                    <div className="mt-4 rounded-[1.5rem] bg-[#F5F2EE] p-4">
                      <div className="mb-2 flex items-center justify-between text-sm font-bold">
                        <span>Mitarbeiter-Abarbeitung</span>
                        <span className="text-[#8B252B]">{activeMeasureStats.done}/{activeMeasureStats.total} Maßnahmen erledigt</span>
                      </div>
                      <Progress value={activeMeasureStats.progress} className="h-3 rounded-full" />
                      <p className="mt-3 text-sm font-semibold text-[#6F7178]">Hubsteiger- und Habitatskontrollen: {activeInspectionDone}/{inspectionsPerSite} Prüfpunkte erledigt</p>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {activeSite.trees.map((tree) => {
                      const treeKey = `${activeSite.id}-${tree.number}`;
                      const completedMeasures = tree.measures.filter((measure) => treeMeasureChecks[measure.id]).length;
                      const isTreeDone = completedMeasures === tree.measures.length;
                      const isOpen = openTreeKey === treeKey;
                      return (
                        <article key={treeKey} className={isOpen ? "rounded-[1.75rem] border border-[#8B252B]/40 bg-white p-4 shadow-md shadow-[#8B252B]/10" : "rounded-[1.75rem] border border-[#E7E0DC] bg-white p-4 shadow-sm transition hover:border-[#8B252B]/30 hover:shadow-md"}>
                          <button type="button" onClick={() => setOpenTreeKey(isOpen ? "" : treeKey)} className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-start sm:justify-between">
                            <span>
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-2xl font-black text-[#8B252B]">{tree.number}</span>
                                <Badge className="rounded-full bg-[#F0ECE8] text-[#5A1B20] hover:bg-[#F0ECE8]">{tree.species}</Badge>
                                <Badge className={isTreeDone ? "rounded-full bg-[#E9F4ED] text-[#28643E] hover:bg-[#E9F4ED]" : "rounded-full bg-[#FFF2D9] text-[#7A4F00] hover:bg-[#FFF2D9]"}>
                                  {isTreeDone ? "Baummaßnahmen erledigt" : "offene Maßnahmen"}
                                </Badge>
                              </span>
                              <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#6F7178]"><MapPin className="h-4 w-4" /> {tree.location}</span>
                            </span>
                            <span className="flex items-center gap-3">
                              <span className="rounded-2xl bg-[#F8F6F3] px-4 py-3 text-sm font-black text-[#1E1E1F]">
                                {completedMeasures} von {tree.measures.length}
                              </span>
                              <span className={isOpen ? "flex h-10 w-10 rotate-90 items-center justify-center rounded-full bg-[#8B252B] text-white transition" : "flex h-10 w-10 items-center justify-center rounded-full bg-[#F0ECE8] text-[#8B252B] transition"}>
                                <ChevronRight className="h-5 w-5" />
                              </span>
                            </span>
                          </button>

                          {isOpen && (
                            <div className="mt-4 grid gap-4">
                              <div className="grid gap-3">
                                {tree.measures.map((measure) => {
                                  const isDone = Boolean(treeMeasureChecks[measure.id]);
                                  return (
                                    <label key={measure.id} className={isDone ? "flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-[#CFE6D6] bg-[#F0FAF3] p-4" : "flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-[#E7E0DC] bg-[#F8F6F3] p-4 transition hover:border-[#8B252B]/30"}>
                                      <Checkbox checked={isDone} onCheckedChange={(checked) => setTreeMeasureChecks((current) => ({ ...current, [measure.id]: checked === true }))} className="mt-1 h-6 w-6 rounded-lg border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                                      <span className="min-w-0 flex-1">
                                        <span className={isDone ? "block font-black text-[#28643E] line-through decoration-2" : "block font-black text-[#1E1E1F]"}>{measure.title}</span>
                                        <span className="mt-2 block text-sm font-semibold text-[#6F7178]">Zuständig: {measure.assignedTo}</span>
                                        <span className="mt-1 block text-sm leading-6 text-[#6F7178]">{measure.note}</span>
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>

                              <div className="grid gap-3 xl:grid-cols-2">
                                {treeInspectionSections.map((section) => {
                                  const toolKey = `${activeSite.id}-${tree.number}-${section.id}`;
                                  const isToolOpen = openTreeToolKey === toolKey;
                                  const sectionDone = section.items.filter((_, index) => treeInspectionChecks[`${activeSite.id}-${tree.number}-${section.id}-${index}`]).length;
                                  const Icon = section.icon;
                                  return (
                                    <div key={section.id} className="rounded-[1.35rem] border border-[#E7E0DC] bg-[#F8F6F3] p-4">
                                      <button type="button" onClick={() => setOpenTreeToolKey(isToolOpen ? "" : toolKey)} className="flex w-full items-start justify-between gap-3 text-left">
                                        <span className="flex items-center gap-3">
                                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8B252B]/10 text-[#8B252B]">
                                            <Icon className="h-5 w-5" />
                                          </span>
                                          <span>
                                            <span className="block font-black text-[#1E1E1F]">{section.title} öffnen</span>
                                            <span className="text-sm font-semibold text-[#6F7178]">{sectionDone}/{section.items.length} bei {tree.number}</span>
                                          </span>
                                        </span>
                                        <Badge className={sectionDone === section.items.length ? "rounded-full bg-[#E9F4ED] text-[#28643E] hover:bg-[#E9F4ED]" : "rounded-full bg-[#FFF2D9] text-[#7A4F00] hover:bg-[#FFF2D9]"}>
                                          {sectionDone === section.items.length ? "erledigt" : "offen"}
                                        </Badge>
                                      </button>
                                      {isToolOpen && (
                                        <div className="mt-3 grid gap-2">
                                          {section.items.map((item, index) => {
                                            const id = `${activeSite.id}-${tree.number}-${section.id}-${index}`;
                                            const isDone = Boolean(treeInspectionChecks[id]);
                                            return (
                                              <label key={id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3 text-sm font-bold leading-5 text-[#303033]">
                                                <Checkbox checked={isDone} onCheckedChange={(checked) => setTreeInspectionChecks((current) => ({ ...current, [id]: checked === true }))} className="mt-0.5 h-5 w-5 rounded-md border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                                                <span>{item}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </CardContent>
                </Card>
                ) : <LockedPanel title="Maßnahmen je Baum gesperrt" description="Der ausgewählte Mitarbeiter darf Baumarbeiten und Prüfpunkte nicht bearbeiten." />}
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
                      <Button asChild className="flex-1 rounded-full bg-[#8B252B] text-white hover:bg-[#741E24]"><a href={`tel:${contact.phone.replace(/\s/g, "")}`}><Phone className="mr-2 h-4 w-4" />Anrufen</a></Button>
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

          <TabsContent value="team" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><MessageSquare className="h-6 w-6 text-[#8B252B]" /> Teamchat</CardTitle>
                  <p className="text-sm font-semibold text-[#6F7178]">Nachrichten für alle Mitarbeiter oder direkt zur ausgewählten Baustelle.</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={() => setChatScope("team")} variant={chatScope === "team" ? "default" : "outline"} className={chatScope === "team" ? "rounded-full bg-[#8B252B] text-white hover:bg-[#741E24]" : "rounded-full border-[#8B252B]/25"}>Alle Mitarbeiter</Button>
                    {sites.map((site) => (
                      <Button key={site.id} onClick={() => setChatScope(site.id)} variant={chatScope === site.id ? "default" : "outline"} className={chatScope === site.id ? "rounded-full bg-[#8B252B] text-white hover:bg-[#741E24]" : "rounded-full border-[#8B252B]/25"}>{site.name.replace("Baustelle ", "")}</Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-[460px] space-y-3 overflow-y-auto rounded-[1.5rem] bg-[#F8F6F3] p-3">
                    {visibleMessages.map((message) => (
                      <article key={message.id} className={message.author === activeEmployee.name ? "ml-auto max-w-[88%] rounded-[1.25rem] bg-[#8B252B] p-4 text-white" : "max-w-[88%] rounded-[1.25rem] bg-white p-4 shadow-sm"}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.14em] opacity-80">
                          <span>{message.author}</span>
                          <span>{message.time}</span>
                        </div>
                        <p className="text-sm font-semibold leading-6">{message.text}</p>
                      </article>
                    ))}
                  </div>
                  <div className="flex gap-2 rounded-[1.5rem] bg-[#F8F6F3] p-2">
                    <Input value={newMessage} onChange={(event) => setNewMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} placeholder="Nachricht an Team oder Baustelle schreiben..." className="h-12 rounded-2xl border-0 bg-white text-base" />
                    <Button onClick={sendMessage} className="h-12 rounded-2xl bg-[#8B252B] px-4 text-white hover:bg-[#741E24]"><Send className="h-5 w-5" /></Button>
                  </div>
                </CardContent>
              </Card>

              {canAccess("aufgaben") ? (
              <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><ListChecks className="h-6 w-6 text-[#8B252B]" /> Teamaufgaben</CardTitle>
                  <p className="text-sm font-semibold text-[#6F7178]">Aufgaben für Büro, Kolonnen und Werkstatt schnell verteilen und abhaken.</p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex gap-2 rounded-[1.35rem] bg-[#F8F6F3] p-2">
                    <Input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createTask(); }} placeholder="Neue Aufgabe schreiben..." className="h-12 rounded-2xl border-0 bg-white text-base" />
                    <Button onClick={createTask} className="h-12 rounded-2xl bg-[#8B252B] px-4 text-white hover:bg-[#741E24]">Anlegen</Button>
                  </div>
                  {teamTaskItems.map((task) => {
                    const done = Boolean(taskChecks[task.id]);
                    return (
                      <label key={task.id} className={done ? "flex cursor-pointer items-start gap-3 rounded-[1.35rem] border border-[#CFE6D6] bg-[#F0FAF3] p-4" : "flex cursor-pointer items-start gap-3 rounded-[1.35rem] border border-[#E7E0DC] bg-[#F8F6F3] p-4 transition hover:border-[#8B252B]/30"}>
                        <Checkbox checked={done} onCheckedChange={(checked) => setTaskChecks((current) => ({ ...current, [task.id]: checked === true }))} className="mt-1 h-6 w-6 rounded-lg border-[#8B252B] data-[state=checked]:bg-[#8B252B]" />
                        <span className="min-w-0 flex-1">
                          <span className={done ? "block font-black text-[#28643E] line-through decoration-2" : "block font-black text-[#1E1E1F]"}>{task.title}</span>
                          <span className="mt-2 flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-white text-[#5A1B20] hover:bg-white">{task.owner}</Badge>
                            <Badge className="rounded-full bg-white text-[#5A1B20] hover:bg-white">{task.scope}</Badge>
                            <Badge className={task.priority === "hoch" ? "rounded-full bg-[#8B252B] text-white hover:bg-[#8B252B]" : "rounded-full bg-white text-[#5A1B20] hover:bg-white"}>{task.priority}</Badge>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
              ) : <LockedPanel title="Teamaufgaben gesperrt" description="Dieser Mitarbeiter darf Aufgaben nicht anlegen oder abhaken." />}
            </div>
          </TabsContent>

          <TabsContent value="rechte" className="mt-5">
            {canAccess("rechte") ? (
              <Card className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><UserCog className="h-6 w-6 text-[#8B252B]" /> Zugriffsrechte je Mitarbeiter</CardTitle>
                  <p className="text-sm font-semibold text-[#6F7178]">Lege fest, welche Bereiche einzelne Mitarbeiter sehen oder bearbeiten dürfen. Die Auswahl oben simuliert den aktuell angemeldeten Mitarbeiter.</p>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {employees.map((employee) => (
                    <article key={employee.id} className="rounded-[1.75rem] border border-[#E7E0DC] bg-[#F8F6F3] p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-black text-[#1E1E1F]">{employee.name}</h3>
                          <p className="text-sm font-semibold text-[#6F7178]">{employee.role}</p>
                        </div>
                        <Badge className="rounded-full bg-white text-[#5A1B20] hover:bg-white">{permissionAreas.filter((area) => employeePermissions[employee.id]?.[area.key]).length}/{permissionAreas.length} Rechte</Badge>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {permissionAreas.map((area) => {
                          const isProtectedSelfLock = employee.id === activeEmployeeId && area.key === "rechte";
                          return (
                            <label key={area.key} className="flex cursor-pointer items-start gap-3 rounded-[1.15rem] bg-white p-3 text-sm font-semibold leading-5 text-[#303033] shadow-sm">
                              <Checkbox
                                checked={Boolean(employeePermissions[employee.id]?.[area.key])}
                                disabled={isProtectedSelfLock}
                                onCheckedChange={(checked) => togglePermission(employee.id, area.key, checked === true)}
                                className="mt-0.5 h-5 w-5 rounded-md border-[#8B252B] data-[state=checked]:bg-[#8B252B] disabled:opacity-40"
                              />
                              <span>
                                <span className="block font-black">{area.label}</span>
                                <span className="mt-1 block text-xs font-semibold text-[#6F7178]">{area.description}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>
            ) : <LockedPanel title="Rechteverwaltung gesperrt" description="Dieser Bereich kann nur von Mitarbeitern mit dem Recht „Rechte verwalten“ geöffnet werden." />}
          </TabsContent>

          <TabsContent value="uebersicht" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {sites.map((site) => {
                const statsForSite = getSiteMeasureStats(site);
                const riskDone = riskItems.filter((_, index) => riskChecks[`${site.id}-risk-${index}`]).length;
                const noParkingDone = site.noParkingZones.filter((zone) => noParkingDocs[zone.id]?.installed && noParkingDocs[zone.id]?.removed).length;
                return (
                  <Card key={site.id} className="rounded-[2rem] border-white/70 bg-white/95 shadow-xl shadow-[#3B1115]/10">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-2xl font-black">{site.name}</CardTitle>
                          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#6F7178]"><MapPin className="h-4 w-4" /> {site.address}</p>
                        </div>
                        <Badge className="rounded-full bg-[#E9F4ED] text-[#28643E] hover:bg-[#E9F4ED]">{site.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.25rem] bg-[#F8F6F3] p-3"><p className="text-sm font-bold text-[#6F7178]">Gefährdung</p><p className="text-xl font-black text-[#8B252B]">{riskDone}/{riskItems.length}</p></div>
                        <div className="rounded-[1.25rem] bg-[#F8F6F3] p-3"><p className="text-sm font-bold text-[#6F7178]">Halteverbote</p><p className="text-xl font-black text-[#8B252B]">{noParkingDone}/{site.noParkingZones.length}</p></div>
                        <div className="rounded-[1.25rem] bg-[#F8F6F3] p-3"><p className="text-sm font-bold text-[#6F7178]">Maßnahmen</p><p className="text-xl font-black text-[#8B252B]">{statsForSite.done}/{statsForSite.total}</p></div>
                      </div>
                      <Button onClick={() => openSite(site.id)} className="h-12 w-full rounded-full bg-[#8B252B] text-white hover:bg-[#741E24]">
                        Baustelle öffnen und bearbeiten
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Index;
