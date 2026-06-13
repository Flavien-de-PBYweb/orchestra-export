"use client";
import { usePathname } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";

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
  const meta = TITLES[pathname] ?? { title: "Orchestra Export", description: "" };
  const now = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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
            placeholder="Rechercher…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 w-52"
          />
        </div>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <RefreshCw size={13} />
          Synchroniser Coda
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#F47920" }}>
          SM
        </div>
      </div>
    </header>
  );
}
