"use client";
import { COUNTRIES, STORES, INITIAL_TICKETS, INITIAL_MEETINGS } from "@/lib/data";
import { useTodoStore, useCodaSyncStore } from "@/lib/store";
import { Globe, Store, Clock, ArrowUpRight, Users, Zap, CheckCircle, RefreshCw, Check } from "lucide-react";
import dynamic from "next/dynamic";
const WorldMap = dynamic(() => import("@/components/shared/WorldMap").then(m => m.WorldMap), { ssr: false, loading: () => <div className="h-[340px] bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" /> });
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";

const COLORS = ["#1B2E6B", "#E40E20", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function DashboardPage() {
  const { todos, updateTodo } = useTodoStore();
  const { stores: syncedStores, lastSync, isSyncing, syncFromCoda } = useCodaSyncStore();
  // Use synced stores if available, fallback to static seed
  const stores = syncedStores ?? STORES;

  const openTodos = todos.filter((t) => t.status !== "terminé").length;
  const openTickets = INITIAL_TICKETS.filter((t) => t.status === "ouvert" || t.status === "en_cours").length;
  const urgentTodos = todos.filter((t) => t.priority === "haute" && t.status !== "terminé").slice(0, 4);
  const recentMeeting = INITIAL_MEETINGS[0];

  // Real computed stats from actual store data
  const storesOpen = stores.filter((s) => s.status === "✅ Ouvert").length;
  const storesEnCours = stores.filter((s) => s.status === "🚧 En cours").length;
  const storesFermeture = stores.filter((s) => s.status === "FERMETURE A VENIR" || s.status === "❌ Fermé").length;
  const storesSuspendu = stores.filter((s) => s.status === "⏸️ Suspendu").length;
  const totalStores = stores.length;
  const totalCountries = new Set(stores.map((s) => s.country)).size;

  const statusData = [
    { name: "Ouverts", value: storesOpen, color: "#22C55E" },
    { name: "En cours", value: storesEnCours, color: "#E40E20" },
    { name: "Fermeture", value: storesFermeture, color: "#EF4444" },
    { name: "Suspendus", value: storesSuspendu, color: "#8B5CF6" },
    { name: "En recherche", value: stores.filter((s) => s.status === "🔍 En recherche cellule").length, color: "#F59E0B" },
  ].filter((s) => s.value > 0);

  const topCountries = COUNTRIES.map((c) => ({
    ...c,
    storeCount: stores.filter((s) => s.country === c.codaKey).length,
  })).filter((c) => c.storeCount > 0).sort((a, b) => b.storeCount - a.storeCount).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Sync status bar */}
      {!lastSync && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span>⚡</span>
            <span>Les données proviennent du dernier import Coda. <strong>Synchronisez pour avoir les données en temps réel.</strong></span>
          </div>
          <button onClick={syncFromCoda} disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-60">
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Sync…" : "Synchroniser Coda"}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pays / marchés", value: totalCountries, icon: Globe, color: "#1B2E6B", sub: `${COUNTRIES.length} dans la base` },
          { label: "Magasins", value: totalStores, icon: Store, color: "#E40E20", sub: `${storesOpen} ouverts` },
          { label: "Actions en cours", value: openTodos, icon: Clock, color: "#8B5CF6", sub: `${todos.filter(t => t.priority === "haute" && t.status !== "terminé").length} haute priorité` },
          { label: "Tickets ouverts", value: openTickets, icon: Zap, color: "#22C55E", sub: "JIRA (bêta)" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.color + "15" }}>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Statut des magasins</h2>
          <p className="text-xs text-gray-500 mb-3">Source : Coda {lastSync ? `· Sync ${new Date(lastSync).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "· Import statique"}</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${String(v)} magasins`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                  <span className="text-gray-600">{s.name}</span>
                </div>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent actions */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Actions urgentes</h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{urgentTodos.length}</span>
          </div>
          <div className="space-y-2">
            {urgentTodos.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucune action urgente</p>
            ) : urgentTodos.map((t) => {
              const country = COUNTRIES.find((c) => c.id === t.countryId);
              const done = t.status === "terminé";
              return (
                <div key={t.id} className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${done ? "opacity-50" : "hover:bg-gray-50"}`}>
                  <button
                    onClick={() => updateTodo(t.id, { status: done ? "à_faire" : "terminé" })}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}
                  >
                    {done && <Check size={11} className="text-white" />}
                  </button>
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-sm">
                    {country?.flag ?? "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${done ? "line-through text-gray-400" : "text-gray-800"}`}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">{t.assignee}</span>
                      {t.dueDate && (
                        <span className={`text-[10px] font-medium ${new Date(t.dueDate) < new Date() && !done ? "text-red-500" : "text-orange-400"}`}>
                          · {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest meeting */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Dernière réunion</h2>
            <span className="text-xs text-gray-400">{new Date(recentMeeting.date).toLocaleDateString("fr-FR")}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Zap size={15} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{recentMeeting.title}</p>
              <p className="text-xs text-gray-400">{recentMeeting.duration} min</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 leading-relaxed">
            {recentMeeting.summary}
          </p>
          <div className="space-y-1.5">
            {recentMeeting.actionItems?.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                {a}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
            <Users size={11} className="text-gray-400" />
            <p className="text-xs text-gray-400">{recentMeeting.participants.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* World map */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Présence mondiale</h2>
            <p className="text-xs text-gray-400">{Object.keys(new Set(stores.map(s => s.country))).length || new Set(stores.map(s => s.country)).size} pays · {stores.length} magasins · taille du cercle = nombre de magasins</p>
          </div>
        </div>
        <WorldMap />
      </div>

      {/* Top countries table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Top marchés — nombre de magasins</h2>
          <a href="/countries" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Voir tous <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Pays</th>
                <th className="pb-3 font-medium">Région</th>
                <th className="pb-3 font-medium text-right">Magasins</th>
                <th className="pb-3 font-medium text-right">Ouverts</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.map((c) => {
                const openCount = stores.filter((s) => s.country === c.codaKey && s.status === "✅ Ouvert").length;
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{c.flag}</span>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-500">{c.region}</td>
                    <td className="py-3 text-right font-semibold">{c.storeCount}</td>
                    <td className="py-3 text-right">
                      <span className="text-xs font-medium text-green-600">{openCount}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
