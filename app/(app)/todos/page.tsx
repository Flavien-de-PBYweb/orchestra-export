"use client";
import { useState } from "react";
import { TODOS, COUNTRIES, type Todo, type TodoStatus, type TodoPriority } from "@/lib/data";
import { Plus, Search, Calendar, User, Flag } from "lucide-react";

const STATUS_LABELS: Record<TodoStatus, string> = {
  à_faire: "À faire", en_cours: "En cours", terminé: "Terminé", bloqué: "Bloqué",
};
const STATUS_COLORS: Record<TodoStatus, string> = {
  à_faire: "bg-gray-100 text-gray-600",
  en_cours: "bg-blue-100 text-blue-700",
  terminé: "bg-green-100 text-green-700",
  bloqué: "bg-red-100 text-red-600",
};
const PRIORITY_COLORS: Record<TodoPriority, string> = {
  haute: "text-red-500", moyenne: "text-orange-400", basse: "text-gray-400",
};

function TodoCard({ t }: { t: Todo }) {
  const country = COUNTRIES.find((c) => c.id === t.countryId);
  const isOverdue = t.dueDate && t.status !== "terminé" && new Date(t.dueDate) < new Date();
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={t.status === "terminé"} readOnly className="rounded mt-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {country && <span className="text-base">{country.flag}</span>}
              <h3 className={`text-sm font-medium ${t.status === "terminé" ? "line-through text-gray-400" : "text-gray-800"}`}>
                {t.title}
              </h3>
            </div>
            {t.description && <p className="text-xs text-gray-500 mb-2">{t.description}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <User size={11} />
                {t.assignee}
              </div>
              {t.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                  <Calendar size={11} />
                  {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                  {isOverdue && " (en retard)"}
                </div>
              )}
              {t.tags?.map((tag) => (
                <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status]}`}>
            {STATUS_LABELS[t.status]}
          </span>
          <Flag size={13} className={PRIORITY_COLORS[t.priority]} />
        </div>
      </div>
    </div>
  );
}

export default function TodosPage() {
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "all">("all");
  const [groupBy, setGroupBy] = useState<"country" | "status" | "priority">("country");

  const filtered = TODOS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "all" || t.countryId === filterCountry;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchCountry && matchStatus;
  });

  const grouped: Record<string, Todo[]> = {};
  if (groupBy === "country") {
    COUNTRIES.forEach((c) => {
      const items = filtered.filter((t) => t.countryId === c.id);
      if (items.length) grouped[c.id] = items;
    });
  } else if (groupBy === "status") {
    (["en_cours", "à_faire", "bloqué", "terminé"] as TodoStatus[]).forEach((s) => {
      const items = filtered.filter((t) => t.status === s);
      if (items.length) grouped[s] = items;
    });
  } else {
    (["haute", "moyenne", "basse"] as const).forEach((p) => {
      const items = filtered.filter((t) => t.priority === p);
      if (items.length) grouped[p] = items;
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(["à_faire", "en_cours", "bloqué", "terminé"] as TodoStatus[]).map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`bg-white rounded-xl p-4 border text-left transition-all ${filterStatus === s ? "border-blue-300 shadow-sm" : "border-gray-100"}`}>
            <div className={`text-xs inline-block px-2 py-0.5 rounded-full mb-1.5 font-medium ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</div>
            <div className="text-2xl font-bold text-gray-800">{TODOS.filter((t) => t.status === s).length}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une action…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none" />
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
          <option value="all">Tous les pays</option>
          {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
        </select>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
          {(["country", "status", "priority"] as const).map((g) => (
            <button key={g} onClick={() => setGroupBy(g)}
              className={`px-3 py-2 ${groupBy === g ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"} ${g !== "country" ? "border-l border-gray-200" : ""}`}>
              Par {g === "country" ? "pays" : g === "status" ? "statut" : "priorité"}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium"
          style={{ background: "#F47920" }}>
          <Plus size={15} /> Nouvelle action
        </button>
      </div>

      {/* Grouped todos */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([key, items]) => {
          const country = groupBy === "country" ? COUNTRIES.find((c) => c.id === key) : null;
          const groupLabel = country
            ? `${country.flag} ${country.name}`
            : groupBy === "status" ? STATUS_LABELS[key as TodoStatus]
            : key;
          return (
            <div key={key}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-semibold text-gray-700 text-sm">{groupLabel}</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-2">
                {items.map((t) => <TodoCard key={t.id} t={t} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
