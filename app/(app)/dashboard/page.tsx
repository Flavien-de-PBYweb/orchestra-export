"use client";
import { COUNTRIES, STORES, INITIAL_MEETINGS } from "@/lib/data";
import { useTodoStore, useCodaSyncStore } from "@/lib/store";
import { Globe, Store, Clock, ArrowUpRight, Users, Zap, CheckCircle, RefreshCw, Check, Video } from "lucide-react";
import dynamic from "next/dynamic";
const WorldMap = dynamic(() => import("@/components/shared/WorldMap").then(m => m.WorldMap), {
  ssr: false,
  loading: () => <div className="h-[340px] bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />,
});
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const PIE_COLORS = ["#1B2E6B", "#E40E20", "#22C55E", "#F59E0B", "#8B5CF6", "#06B6D4", "#EC4899"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SmallTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="font-semibold">{d.name}</p>
      <p className="text-gray-300">{d.value} · {((d.payload.percent ?? 0) * 100).toFixed(1)}%</p>
    </div>
  );
}

export default function DashboardPage() {
  const { todos, updateTodo } = useTodoStore();
  const { stores: syncedStores, lastSync, isSyncing, syncFromCoda } = useCodaSyncStore();
  const stores = syncedStores ?? STORES;

  const urgentTodos = todos.filter((t) => t.priority === "haute" && t.status !== "terminé").slice(0, 4);
  const recentMeeting = INITIAL_MEETINGS[0];

  // ── Store stats ──────────────────────────────────────────────────────────────
  const storesOpen      = stores.filter((s) => s.status === "✅ Ouvert").length;
  const storesEnCours   = stores.filter((s) => s.status === "🚧 En cours").length;
  const storesFermeture = stores.filter((s) => s.status === "FERMETURE A VENIR" || s.status === "❌ Fermé").length;
  const storesSuspendu  = stores.filter((s) => s.status === "⏸️ Suspendu").length;
  const storesRecherche = stores.filter((s) => s.status === "🔍 En recherche cellule").length;
  const totalCountries  = new Set(stores.map((s) => s.country)).size;

  const statusData = [
    { name: "Ouverts",      value: storesOpen,      color: "#22C55E" },
    { name: "En cours",     value: storesEnCours,   color: "#3B82F6" },
    { name: "Stand by",     value: storesSuspendu,  color: "#F59E0B" },
    { name: "Fermeture",    value: storesFermeture, color: "#EF4444" },
    { name: "En recherche", value: storesRecherche, color: "#8B5CF6" },
  ].filter((s) => s.value > 0);

  // ── Country status (based on stores) ────────────────────────────────────────
  const activeCountries = COUNTRIES.filter((c) => stores.some((s) => s.country === c.codaKey));
  const countriesOpen     = activeCountries.filter((c) => stores.some((s) => s.country === c.codaKey && s.status === "✅ Ouvert")).length;
  const countriesEnCours  = activeCountries.filter((c) =>
    !stores.some((s) => s.country === c.codaKey && s.status === "✅ Ouvert") &&
    stores.some((s) => s.country === c.codaKey && s.status === "🚧 En cours")
  ).length;
  const countriesStandBy  = activeCountries.filter((c) =>
    !stores.some((s) => s.country === c.codaKey && (s.status === "✅ Ouvert" || s.status === "🚧 En cours")) &&
    stores.some((s) => s.country === c.codaKey && s.status === "⏸️ Suspendu")
  ).length;
  const countriesAutres   = activeCountries.length - countriesOpen - countriesEnCours - countriesStandBy;

  const countryStatusData = [
    { name: "Ouverts",     value: countriesOpen,    color: "#22C55E" },
    { name: "En ouverture", value: countriesEnCours, color: "#3B82F6" },
    { name: "Stand by",    value: countriesStandBy, color: "#F59E0B" },
    { name: "Autres",      value: countriesAutres,  color: "#9CA3AF" },
  ].filter((s) => s.value > 0);

  // ── Partnership type per COUNTRY (not per store) ──────────────────────────
  const countryPartnershipMap: Record<string, string> = {};
  activeCountries.forEach((c) => {
    const countryStores = stores.filter((s) => s.country === c.codaKey && s.partnership);
    if (!countryStores.length) return;
    // Take the most frequent partnership type for this country
    const freq: Record<string, number> = {};
    countryStores.forEach((s) => { freq[s.partnership] = (freq[s.partnership] || 0) + 1; });
    countryPartnershipMap[c.codaKey] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  });
  const partnershipCountByCountry = Object.values(countryPartnershipMap).reduce<Record<string, number>>((acc, p) => {
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const partnershipColors: Record<string, string> = {
    "FRANCHISE": "#1B2E6B",
    "MASTER FRANCHISE": "#E40E20",
    "DISTRI LIGHT": "#06B6D4",
    "COMMISSION AFFILIATION": "#8B5CF6",
  };
  const partnershipData = Object.entries(partnershipCountByCountry).map(([name, value]) => ({
    name, value, color: partnershipColors[name] ?? "#9CA3AF",
  })).sort((a, b) => b.value - a.value);

  const topCountries = COUNTRIES.map((c) => ({
    ...c,
    storeCount: stores.filter((s) => s.country === c.codaKey).length,
  })).filter((c) => c.storeCount > 0).sort((a, b) => b.storeCount - a.storeCount).slice(0, 8);

  // Add percent to pie data for tooltip
  const withPercent = (data: { name: string; value: number; color: string }[]) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    return data.map((d) => ({ ...d, percent: total ? d.value / total : 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Sync status bar */}
      {!lastSync && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span>⚡</span>
            <span>Données issues du dernier import Coda. <strong>Synchronisez pour les données en temps réel.</strong></span>
          </div>
          <button onClick={syncFromCoda} disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-60">
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Sync…" : "Synchroniser Coda"}
          </button>
        </div>
      )}

      {/* KPI Cards — 3 cards (sans Tickets) */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pays / marchés actifs", value: totalCountries, icon: Globe, color: "#1B2E6B", sub: `${countriesOpen} pays ouverts` },
          { label: "Magasins", value: stores.length, icon: Store, color: "#E40E20", sub: `${storesOpen} ouverts · ${storesEnCours} en cours` },
          { label: "Actions en cours", value: todos.filter((t) => t.status !== "terminé").length, icon: Clock, color: "#8B5CF6", sub: `${todos.filter(t => t.priority === "haute" && t.status !== "terminé").length} haute priorité` },
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

      {/* Charts row — 3 cols */}
      <div className="grid grid-cols-3 gap-4">
        {/* Statut des MAGASINS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-0.5 text-sm">Statut des magasins</h2>
          <p className="text-[10px] text-gray-400 mb-3">Par point de vente</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={withPercent(statusData)} dataKey="value" cx="50%" cy="50%"
                outerRadius={58} innerRadius={28} labelLine={false} label={<CustomPieLabel />}>
                {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip content={<SmallTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                  <span className="text-gray-600">{s.name}</span>
                </div>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statut des PAYS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-0.5 text-sm">Statut des pays</h2>
          <p className="text-[10px] text-gray-400 mb-3">Par marché actif</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={withPercent(countryStatusData)} dataKey="value" cx="50%" cy="50%"
                outerRadius={58} innerRadius={28} labelLine={false} label={<CustomPieLabel />}>
                {countryStatusData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip content={<SmallTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {countryStatusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                  <span className="text-gray-600">{s.name}</span>
                </div>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Types de contrats par PAYS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-0.5 text-sm">Contrats par pays</h2>
          <p className="text-[10px] text-gray-400 mb-3">Type de partenariat principal</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={withPercent(partnershipData)} dataKey="value" cx="50%" cy="50%"
                outerRadius={58} innerRadius={28} labelLine={false} label={<CustomPieLabel />}>
                {partnershipData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip content={<SmallTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {partnershipData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                  <span className="text-gray-600 truncate max-w-[110px]">{s.name}</span>
                </div>
                <span className="font-semibold">{s.value} pays</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent tasks + last meeting */}
      <div className="grid grid-cols-2 gap-4">
        {/* Actions urgentes */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Actions urgentes</h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{urgentTodos.length}</span>
          </div>
          <div className="space-y-2">
            {urgentTodos.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucune action urgente ✅</p>
            ) : urgentTodos.map((t) => {
              const country = COUNTRIES.find((c) => c.id === t.countryId);
              const done = t.status === "terminé";
              return (
                <div key={t.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${done ? "opacity-50" : "hover:bg-gray-50"}`}>
                  <button
                    onClick={() => updateTodo(t.id, { status: done ? "à_faire" : "terminé" })}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}>
                    {done && <Check size={11} className="text-white" />}
                  </button>
                  <span className="text-lg shrink-0">{country?.flag ?? "📋"}</span>
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
          <a href="/todos" className="mt-4 block text-center text-xs text-blue-600 hover:underline">
            Voir toutes les actions →
          </a>
        </div>

        {/* Dernière réunion */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Dernière réunion</h2>
          </div>
          {recentMeeting ? (
            <>
              <div className="flex items-center justify-between mb-1">
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
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 leading-relaxed line-clamp-3">
                {recentMeeting.summary}
              </p>
              <div className="space-y-1.5">
                {recentMeeting.actionItems?.slice(0, 3).map((a, i) => (
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
            </>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Video size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune réunion enregistrée</p>
              <a href="/meetings" className="text-xs text-blue-500 hover:underline mt-1 block">Synchroniser Fireflies →</a>
            </div>
          )}
        </div>
      </div>

      {/* World map */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Présence mondiale</h2>
            <p className="text-xs text-gray-400">
              {new Set(stores.map(s => s.country)).size} pays · {stores.length} magasins
              · Scroll pour zoomer · Clic-glisser pour naviguer
            </p>
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
                        <a href={`/countries/${c.id}`} className="font-medium text-gray-800 hover:text-blue-600 transition-colors">{c.name}</a>
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
