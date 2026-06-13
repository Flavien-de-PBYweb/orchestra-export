"use client";
import { useState } from "react";
import { TICKETS, COUNTRIES, type Ticket, type TicketStatus, type TicketPriority } from "@/lib/data";
import { Plus, Search, ExternalLink, AlertCircle, Circle, CheckCircle2, Clock } from "lucide-react";

const STATUS_ICONS: Record<TicketStatus, React.ReactNode> = {
  ouvert: <Circle size={14} className="text-gray-400" />,
  en_cours: <Clock size={14} className="text-blue-500" />,
  résolu: <CheckCircle2 size={14} className="text-green-500" />,
  fermé: <CheckCircle2 size={14} className="text-gray-300" />,
};
const STATUS_COLORS: Record<TicketStatus, string> = {
  ouvert: "bg-gray-100 text-gray-600",
  en_cours: "bg-blue-100 text-blue-700",
  résolu: "bg-green-100 text-green-700",
  fermé: "bg-gray-50 text-gray-400",
};
const PRIORITY_STYLES: Record<TicketPriority, string> = {
  critique: "bg-red-100 text-red-700",
  haute: "bg-orange-100 text-orange-700",
  moyenne: "bg-yellow-100 text-yellow-700",
  basse: "bg-gray-100 text-gray-500",
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");

  const filtered = TICKETS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.jiraKey ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Jira integration banner */}
      <div className="rounded-2xl p-4 border flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #0052CC08, #0052CC04)", borderColor: "#0052CC30" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "#0052CC" }}>
          <span className="text-white font-black text-sm">J</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">Connexion JIRA</h3>
          <p className="text-xs text-gray-500">Projet : <strong>EXP</strong> · Synchronisation automatique activée · Dernière sync : il y a 5 min</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-600 font-medium">Connecté</span>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Configurer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(["ouvert", "en_cours", "résolu", "fermé"] as TicketStatus[]).map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`bg-white rounded-xl p-4 border text-left transition-all ${filterStatus === s ? "border-blue-300" : "border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-2">{STATUS_ICONS[s]}<span className="text-xs text-gray-500 capitalize">{s}</span></div>
            <div className="text-2xl font-bold text-gray-800">{TICKETS.filter((t) => t.status === s).length}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un ticket (titre, clé JIRA…)"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium"
          style={{ background: "#0052CC" }}>
          <Plus size={15} /> Créer un ticket JIRA
        </button>
      </div>

      {/* Tickets table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Tickets — Projet EXP</h2>
          <span className="text-xs text-gray-400">{filtered.length} tickets</span>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((t) => {
            const country = t.countryId ? COUNTRIES.find((c) => c.id === t.countryId) : null;
            return (
              <div key={t.id} className="px-5 py-4 hover:bg-gray-50/50 flex items-center gap-4">
                <div className="w-5 shrink-0">{STATUS_ICONS[t.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {t.jiraKey && (
                      <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{t.jiraKey}</span>
                    )}
                    <h3 className="text-sm font-medium text-gray-800 truncate">{t.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{t.reporter}</span>
                    <span>·</span>
                    <span>Assigné : {t.assignee}</span>
                    <span>·</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString("fr-FR")}</span>
                    {country && <span className="flex items-center gap-1">{country.flag} {country.name}</span>}
                    {t.labels?.map((l) => (
                      <span key={l} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[t.priority]}`}>
                    {t.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status]}`}>
                    {t.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 ml-1"><ExternalLink size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
