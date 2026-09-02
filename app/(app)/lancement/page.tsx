"use client";
import { useState, useEffect, useCallback } from "react";
import { useCodaSyncStore } from "@/lib/store";
import { COUNTRIES, STORES } from "@/lib/data";
import { RefreshCw, Check, ChevronDown, ChevronUp } from "lucide-react";

interface ChecklistTask {
  id: string;
  title: string;
  done: boolean;
  dueDate: string;
  notes: string;
}

interface Checklist {
  label: string;
  tableId: string;
  colDone: string;
  tasks: ChecklistTask[];
}

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Juridique: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  Travaux:   { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  Marketing: { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200" },
};

export default function LancementPage() {
  const { stores: syncedStores } = useCodaSyncStore();
  const stores = syncedStores ?? STORES;

  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<string | null>(null);

  const enCoursStores = stores.filter(s => s.status === "🚧 En cours");
  const enCoursCountries = Array.from(new Set(enCoursStores.map(s => s.country)));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coda/launch");
      if (res.ok) {
        const data = await res.json();
        setChecklists(data.checklists ?? []);
        const initExpanded: Record<string, boolean> = {};
        (data.checklists ?? []).forEach((c: Checklist) => { initExpanded[c.label] = true; });
        setExpanded(initExpanded);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleTask = async (checklist: Checklist, task: ChecklistTask) => {
    const key = `${checklist.label}-${task.id}`;
    setToggling(key);
    const newDone = !task.done;
    setChecklists(prev => prev.map(c =>
      c.label === checklist.label
        ? { ...c, tasks: c.tasks.map(t => t.id === task.id ? { ...t, done: newDone } : t) }
        : c
    ));
    await fetch("/api/coda/launch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: checklist.tableId, rowId: task.id, colDone: checklist.colDone, done: newDone }),
    });
    setToggling(null);
  };

  const totalTasks = checklists.reduce((s, c) => s + c.tasks.length, 0);
  const doneTasks  = checklists.reduce((s, c) => s + c.tasks.filter(t => t.done).length, 0);
  const globalProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🚀</span> Lancement
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Suivi des ouvertures de marchés · synchronisé avec Coda</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-60 shadow-sm">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Chargement…" : "Actualiser"}
        </button>
      </div>

      {/* Active launches */}
      {enCoursCountries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Pays en cours d'ouverture</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">{enCoursCountries.length} pays · {enCoursStores.length} magasin{enCoursStores.length > 1 ? "s" : ""}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {enCoursCountries.map(countryKey => {
              const meta = COUNTRIES.find(c => c.codaKey === countryKey);
              const countryStores = enCoursStores.filter(s => s.country === countryKey);
              const allCountryStores = stores.filter(s => s.country === countryKey);
              const openCount = allCountryStores.filter(s => s.status === "✅ Ouvert").length;
              const progress = allCountryStores.length > 0 ? Math.round((openCount / allCountryStores.length) * 100) : 0;
              return (
                <div key={countryKey} className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{meta?.flag ?? "🌍"}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="font-semibold text-gray-900">{meta?.name ?? countryKey}</p>
                          <p className="text-xs text-gray-400">
                            {countryStores.map(s => s.name).join(" · ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">{progress}%</p>
                          <p className="text-[10px] text-gray-400">{openCount}/{allCountryStores.length} ouverts</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: progress >= 80 ? "#22C55E" : progress >= 40 ? "#3B82F6" : "#F59E0B" }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {countryStores.map(s => (
                      <div key={s.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {s.name}{s.city ? ` · ${s.city}` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global checklist progress */}
      {!loading && totalTasks > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Avancement checklist de lancement</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{doneTasks}/{totalTasks} tâches</span>
              <span className="text-sm font-bold" style={{ color: globalProgress === 100 ? "#22C55E" : "#1B2E6B" }}>{globalProgress}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${globalProgress}%`, background: globalProgress === 100 ? "#22C55E" : "#1B2E6B" }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {checklists.map(c => {
              const done = c.tasks.filter(t => t.done).length;
              const pct = c.tasks.length > 0 ? Math.round((done / c.tasks.length) * 100) : 0;
              const cfg = SECTION_COLORS[c.label] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
              return (
                <div key={c.label} className={`${cfg.bg} ${cfg.border} border rounded-xl p-3`}>
                  <p className={`text-xs font-semibold ${cfg.text}`}>{c.label}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{pct}%</p>
                  <p className="text-[10px] text-gray-400">{done}/{c.tasks.length} tâches</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checklists */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          <RefreshCw size={20} className="animate-spin mx-auto mb-3 opacity-40" />
          Chargement des données Coda…
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map(checklist => {
            const done = checklist.tasks.filter(t => t.done).length;
            const isExpanded = expanded[checklist.label] ?? true;
            const cfg = SECTION_COLORS[checklist.label] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
            return (
              <div key={checklist.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [checklist.label]: !isExpanded }))}
                  className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {checklist.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{done}/{checklist.tasks.length} terminées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${checklist.tasks.length > 0 ? (done / checklist.tasks.length) * 100 : 0}%`, background: done === checklist.tasks.length ? "#22C55E" : "#1B2E6B" }} />
                    </div>
                    {isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-50">
                    {checklist.tasks.map(task => {
                      const key = `${checklist.label}-${task.id}`;
                      return (
                        <div key={task.id}
                          className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${task.done ? "bg-gray-50/40" : "hover:bg-gray-50/40"}`}>
                          <button
                            onClick={() => toggleTask(checklist, task)}
                            disabled={toggling === key}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                              task.done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"
                            } ${toggling === key ? "opacity-50" : ""}`}>
                            {task.done && <Check size={11} className="text-white" />}
                          </button>
                          <span className={`flex-1 text-sm ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] text-gray-400 shrink-0">{task.dueDate}</span>
                          )}
                          {task.done && (
                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full shrink-0">Terminé</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
