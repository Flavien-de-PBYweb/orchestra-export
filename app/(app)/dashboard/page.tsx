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
  const detail: string[] = d.payload?.detail ?? [];
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2.5 rounded-lg shadow-xl max-w-[200px]">
      <p className="font-semibold mb-0.5">{d.name}</p>
      <p className="text-gray-300 mb-1">{d.value} · {((d.payload.percent ?? 0) * 100).toFixed(1)}%</p>
      {detail.length > 0 && (
        <ul className="border-t border-white/10 pt-1.5 space-y-0.5">
          {detail.slice(0, 8).map((item, i) => (
            <li key={i} className="text-gray-300 truncate">· {item}</li>
          ))}
          {detail.length > 8 && <li className="text-gray-500">+{detail.length - 8} autres</li>}
        </ul>
      )}
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
  const activeStores    = stores.filter((s) => s.status !== "❌ Fermé" && s.status !== "FERMETURE A VENIR");
  const storesOpen      = stores.filter((s) => s.status === "✅ Ouvert");
  const storesEnCours   = stores.filter((s) => s.status === "🚧 En cours");
  const storesFermeture = stores.filter((s) => s.status === "FERMETURE A VENIR" || s.status === "❌ Fermé");
  const storesSuspendu  = stores.filter((s) => s.status === "⏸️ Suspendu");
  const storesRecherche = stores.filter((s) => s.status === "🔍 En recherche cellule");
  const storesProspects = stores.filter((s) => s.status === "🎯 Prospects");
  const totalCountries  = new Set(stores.map((s) => s.country)).size;

  // Store status pie — ALL statuses, with store name list for tooltip
  const statusData = [
    { name: "Ouverts",      value: storesOpen.length,      color: "#22C55E", detail: storesOpen.map(s => s.name) },
    { name: "En cours",     value: storesEnCours.length,   color: "#3B82F6", detail: storesEnCours.map(s => s.name) },
    { name: "En recherche", value: storesRecherche.length, color: "#8B5CF6", detail: storesRecherche.map(s => s.name) },
    { name: "Prospects",    value: storesProspects.length, color: "#7C3AED", detail: storesProspects.map(s => s.name) },
    { name: "Stand by",     value: storesSuspendu.length,  color: "#F59E0B", detail: storesSuspendu.map(s => s.name) },
    { name: "Fermeture",    value: storesFermeture.length, color: "#EF4444", detail: storesFermeture.map(s => s.name) },
  ].filter((s) => s.value > 0);

  // MIXTE / TEXTILE pie
  const storesMixte   = stores.filter((s) => s.product === "MIXTE");
  const storesTextile = stores.filter((s) => s.product === "TEXTILE");
  const mixteData = [
    { name: "Mixte",   value: storesMixte.length,   color: "#1B2E6B", detail: storesMixte.map(s => s.name) },
    { name: "Textile", value: storesTextile.length,  color: "#E40E20", detail: storesTextile.map(s => s.name) },
  ].filter((s) => s.value > 0);

  // ── Country status (priority-based, show ALL) ─────────────────────────────
  // Priority: Ouvert > En cours > En recherche > Prospects > Suspendu > Fermeture > Fermé
  const STATUS_PRIORITY = ["✅ Ouvert","🚧 En cours","🔍 En recherche cellule","🎯 Prospects","⏸️ Suspendu","FERMETURE A VENIR","❌ Fermé"] as const;
  const activeCountries = COUNTRIES.filter((c) => stores.some((s) => s.country === c.codaKey));

  const getCountryStatus = (codaKey: string) => {
    const cs = stores.filter((s) => s.country === codaKey);
    for (const st of STATUS_PRIORITY) {
      if (cs.some((s) => s.status === st)) return st;
    }
    return cs[0]?.status ?? "❌ Fermé";
  };

  const COUNTRY_STATUS_CFG = [
    { key: "✅ Ouvert",               name: "Ouverts",      color: "#22C55E" },
    { key: "🚧 En cours",             name: "En ouverture", color: "#3B82F6" },
    { key: "🔍 En recherche cellule", name: "En recherche", color: "#8B5CF6" },
    { key: "🎯 Prospects",            name: "Prospects",    color: "#7C3AED" },
    { key: "⏸️ Suspendu",             name: "Stand by",     color: "#F59E0B" },
    { key: "FERMETURE A VENIR",       name: "Fermeture",    color: "#F97316" },
    { key: "❌ Fermé",                name: "Fermés",       color: "#9CA3AF" },
  ] as const;

  const countryStatusData = COUNTRY_STATUS_CFG.map(({ key, name, color }) => {
    const matching = activeCountries.filter((c) => getCountryStatus(c.codaKey) === key);
    return { name, value: matching.length, color, detail: matching.map((c) => `${c.flag} ${c.name}`) };
  }).filter((s) => s.value > 0);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pays / marchés actifs", value: totalCountries, icon: Globe, color: "#1B2E6B", sub: `${countryStatusData.find(d=>d.name==="Ouverts")?.value ?? 0} pays ouverts` },
          { label: "Magasins actifs", value: activeStores.length, icon: Store, color: "#E40E20", sub: `${storesOpen.length} ouverts · ${storesEnCours.length} en cours` },
          { label: "Prospects", value: storesProspects.length, icon: Store, color: "#7C3AED", sub: `${new Set(storesProspects.map(s=>s.country)).size} pays concernés` },
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

      {/* Charts row — 4 cols */}
      <div className="grid grid-cols-4 gap-4">
        {/* Statut des MAGASINS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-0.5 text-sm">Statut des magasins</h2>
          <p className="text-[10px] text-gray-400 mb-3">Hover pour le détail</p>
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
          <p className="text-[10px] text-gray-400 mb-3">Hover pour la liste des pays</p>
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

        {/* MIXTE / TEXTILE */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-0.5 text-sm">Mixte / Textile</h2>
          <p className="text-[10px] text-gray-400 mb-3">Répartition par type</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={withPercent(mixteData)} dataKey="value" cx="50%" cy="50%"
                outerRadius={58} innerRadius={28} labelLine={false} label={<CustomPieLabel />}>
                {mixteData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip content={<SmallTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {mixteData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">Données non renseignées</p>
          ) : (
            <div className="space-y-1 mt-1">
              {mixteData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          )}
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

      {/* ── Prospects section ─────────────────────────────────────────── */}
      {storesProspects.length > 0 && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-violet-50"
            style={{ background: "linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%)" }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg">🎯</span>
                <h2 className="font-bold text-violet-900 text-base">Prospects</h2>
                <span className="text-xs bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full font-semibold">{storesProspects.length}</span>
              </div>
              <p className="text-xs text-violet-500">{new Set(storesProspects.map(s=>s.country)).size} pays · magasins en phase de prospection</p>
            </div>
            <a href="/countries" className="text-xs text-violet-600 hover:underline flex items-center gap-1">Voir tous <ArrowUpRight size={12}/></a>
          </div>

          {/* KPIs prospects */}
          <div className="grid grid-cols-3 gap-0 border-b border-violet-50">
            {[
              { label: "Total prospects", value: storesProspects.length, color: "#7C3AED" },
              { label: "Pays concernés",  value: new Set(storesProspects.map(s=>s.country)).size, color: "#1B2E6B" },
              { label: "Type Mixte",      value: storesProspects.filter(s=>s.product==="MIXTE").length, color: "#E40E20" },
            ].map((k, i) => (
              <div key={i} className={`px-5 py-3 ${i < 2 ? "border-r border-violet-50" : ""}`}>
                <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
                <div className="text-[10px] text-gray-500 font-medium">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Prospect store cards */}
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {storesProspects.map((s) => {
                const country = COUNTRIES.find((c) => c.codaKey === s.country);
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.name, s.city].filter(Boolean).join(", "))}`;
                return (
                  <div key={s.id} className="bg-violet-50 border border-violet-100 rounded-xl p-3 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl shrink-0">{country?.flag ?? "🌍"}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{s.name}</p>
                        {s.city ? (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-0.5">
                            📍 {s.city}
                          </a>
                        ) : (
                          <p className="text-xs text-gray-400">{country?.name ?? s.country}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.partnership && (
                        <span className="text-[10px] bg-white border border-violet-200 text-violet-700 px-1.5 py-0.5 rounded-full">{s.partnership}</span>
                      )}
                      {s.product && (
                        <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">{s.product}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
