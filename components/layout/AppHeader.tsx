"use client";
import { usePathname, useRouter } from "next/navigation";
import { Search, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useSearchStore, useCodaSyncStore } from "@/lib/store";

const TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Tableau de bord", description: "Vue d'ensemble de l'activité export" },
  "/countries": { title: "Pays & Marchés", description: "Pilotage des ouvertures et partenariats" },
  "/todos": { title: "Plan d'actions", description: "Suivi des tâches par pays" },
  "/tickets": { title: "Tickets JIRA", description: "Suivi technique et développement" },
  "/stats": { title: "Statistiques", description: "Analyse de la performance export" },
  "/reporting": { title: "Reporting E-commerce", description: "Performance des boutiques en ligne" },
  "/meetings": { title: "Réunions & CR", description: "Transcriptions et comptes-rendus Fireflies" },
  "/notes": { title: "Notes", description: "Espace de travail personnel" },
  "/team": { title: "Équipe", description: "Gestion des collaborateurs" },
  "/admin": { title: "Administration", description: "Paramètres et accès utilisateurs" },
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery } = useSearchStore();
  const { isSyncing, lastSync, error, syncFromCoda } = useCodaSyncStore();

  const meta = TITLES[Object.keys(TITLES).find((k) => pathname === k || (k !== "/dashboard" && pathname.startsWith(k))) ?? ""] ?? { title: "Orchestra Export", description: "" };
  const now = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value && !pathname.includes("/countries") && !pathname.includes("/todos") && !pathname.includes("/notes")) {
      router.push("/countries");
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return null;
    const d = new Date(lastSync);
    const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{meta.title}</h1>
        <p className="text-xs text-gray-500 capitalize">{now} · {meta.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 w-52"
          />
        </div>

        {/* Sync button with status */}
        <div className="flex items-center gap-2">
          <button
            onClick={syncFromCoda}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 border rounded-lg transition-all ${
              error ? "border-red-200 text-red-500 bg-red-50 hover:bg-red-100" :
              lastSync ? "border-green-200 text-green-600 bg-green-50 hover:bg-green-100" :
              "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Sync…" : "Synchroniser Coda"}
          </button>
          {error && (
            <div className="flex items-center gap-1 text-xs text-red-500" title={error}>
              <AlertCircle size={13} />
              <span className="hidden lg:inline">Erreur</span>
            </div>
          )}
          {!error && lastSync && (
            <div className="flex items-center gap-1 text-xs text-green-600" title={`Dernière sync : ${new Date(lastSync).toLocaleString("fr-FR")}`}>
              <CheckCircle size={13} />
              <span className="hidden lg:inline">{formatLastSync()}</span>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200" />
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#E40E20" }}>
          LF
        </div>
      </div>
    </header>
  );
}
