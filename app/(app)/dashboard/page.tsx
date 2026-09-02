"use client";
import { useState } from "react";
import { COUNTRIES, STORES } from "@/lib/data";
import { useTodoStore, useCodaSyncStore } from "@/lib/store";
import { Globe, Store, Clock, ArrowUpRight, RefreshCw, X } from "lucide-react";
import dynamic from "next/dynamic";
const WorldMap = dynamic(() => import("@/components/shared/WorldMap").then(m => m.WorldMap), {
  ssr: false,
  loading: () => <div className="h-[340px] bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />,
});
import {
  PieChart, Pie, Cell, ResponsiveContainer,
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


type ActiveSlice = { chartId: string; name: string; detail: string[]; color: string } | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieCard({ title, chartId, data, legend, emptyMsg, activeSlice, setActiveSlice }: {
  title: string; chartId: string;
  data: { name: string; value: number; color: string; detail?: string[]; percent?: number }[];
  legend: { name: string; value: number; color: string; unit: string }[];
  emptyMsg?: string;
  activeSlice: ActiveSlice;
  setActiveSlice: (s: ActiveSlice) => void;
}) {
  const handleClick = (entry: { name: string; color: string; detail?: string[] }) => {
    if (activeSlice?.chartId === chartId && activeSlice?.name === entry.name) {
      setActiveSlice(null);
    } else {
      setActiveSlice({ chartId, name: entry.name, detail: entry.detail ?? [], color: entry.color });
    }
  };
  const isSelected = (name: string) => activeSlice?.chartId === chartId && activeSlice?.name === name;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-0.5 text-sm">{title}</h2>
      <p className="text-[10px] text-gray-400 mb-3">Hover · cliquer pour le détail</p>
      {data.length === 0 && emptyMsg ? (
        <p className="text-xs text-gray-400 text-center py-10">{emptyMsg}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%"
                outerRadius={58} innerRadius={28} labelLine={false} label={<CustomPieLabel />}
                onClick={(entry) => handleClick(entry as { name: string; color: string; detail?: string[] })}
                style={{ cursor: "pointer" }}>
                {data.map((s, i) => (
                  <Cell key={i} fill={s.color}
                    stroke={isSelected(s.name) ? "#1f2937" : "none"}
                    strokeWidth={isSelected(s.name) ? 2 : 0}
                    opacity={activeSlice && activeSlice.chartId === chartId && !isSelected(s.name) ? 0.35 : 1} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {legend.map((s) => (
              <button key={s.name} onClick={() => handleClick(data.find(d => d.name === s.name) ?? { name: s.name, color: s.color })}
                className={`w-full flex items-center justify-between text-xs rounded px-1 py-0.5 transition-colors ${isSelected(s.name) ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-600 truncate max-w-[110px]">{s.name}</span>
                </div>
                <span className="font-semibold">{s.value}{s.unit}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { todos } = useTodoStore();
  const { stores: syncedStores, lastSync, isSyncing, syncFromCoda } = useCodaSyncStore();
  const stores = syncedStores ?? STORES;
  const [activeSlice, setActiveSlice] = useState<ActiveSlice>(null);

  // ── Store stats ──────────────────────────────────────────────────────────────
  const storesProspects    = stores.filter((s) => s.status === "🎯 Prospects");
  const nonProspectStores  = stores.filter((s) => s.status !== "🎯 Prospects");
  const activeStores       = nonProspectStores.filter((s) => s.status !== "❌ Fermé" && s.status !== "FERMETURE A VENIR");
  const storesOpen         = stores.filter((s) => s.status === "✅ Ouvert");
  const storesEnCours      = stores.filter((s) => s.status === "🚧 En cours");
  const storesSuspendu     = stores.filter((s) => s.status === "⏸️ Suspendu");
  const storesRecherche    = stores.filter((s) => s.status === "🔍 En recherche cellule");
  // Total territories = unique countries with NON-prospect stores (= 32)
  const totalCountries     = new Set(nonProspectStores.map((s) => s.country)).size;
  // Prospect territories = unique countries with ONLY prospect stores (= 21)
  const prospectCountries  = new Set(storesProspects.map((s) => s.country)).size;

  // Store status pie — ALL statuses, separate FERMETURE A VENIR
  const storesFermeturePrevue = stores.filter((s) => s.status === "FERMETURE A VENIR");
  const storesFermes          = stores.filter((s) => s.status === "❌ Fermé");
  const statusData = [
    { name: "Ouverts",            value: storesOpen.length,            color: "#22C55E", detail: storesOpen.map(s => s.name) },
    { name: "En cours",           value: storesEnCours.length,         color: "#3B82F6", detail: storesEnCours.map(s => s.name) },
    { name: "En recherche",       value: storesRecherche.length,       color: "#8B5CF6", detail: storesRecherche.map(s => s.name) },
    { name: "Prospects",          value: storesProspects.length,       color: "#7C3AED", detail: storesProspects.map(s => s.name) },
    { name: "Stand by",           value: storesSuspendu.length,        color: "#F59E0B", detail: storesSuspendu.map(s => s.name) },
    { name: "Fermeture à venir",  value: storesFermeturePrevue.length, color: "#F97316", detail: storesFermeturePrevue.map(s => s.name) },
    { name: "Fermés",             value: storesFermes.length,          color: "#9CA3AF", detail: storesFermes.map(s => s.name) },
  ].filter((s) => s.value > 0);

  // MIXTE / TEXTILE pie — include "Non renseigné"
  const storesMixte       = stores.filter((s) => s.product === "MIXTE");
  const storesTextile     = stores.filter((s) => s.product === "TEXTILE");
  const storesNoProduct   = stores.filter((s) => s.product !== "MIXTE" && s.product !== "TEXTILE");
  const mixteData = [
    { name: "Mixte",          value: storesMixte.length,     color: "#1B2E6B", detail: storesMixte.map(s => s.name) },
    { name: "Textile",        value: storesTextile.length,   color: "#E40E20", detail: storesTextile.map(s => s.name) },
    { name: "Non renseigné",  value: storesNoProduct.length, color: "#D1D5DB", detail: storesNoProduct.map(s => s.name) },
  ].filter((s) => s.value > 0);

  // ── Country status (priority-based, all 52 countries from store data) ──────
  const STATUS_PRIORITY = ["✅ Ouvert","🚧 En cours","🔍 En recherche cellule","🎯 Prospects","⏸️ Suspendu","FERMETURE A VENIR","❌ Fermé"] as const;
  // Country status pie uses only NON-prospect stores (32 territories)
  const allCountryKeys = Array.from(new Set(nonProspectStores.map((s) => s.country).filter(Boolean)));

  const getCountryDisplay = (key: string) => {
    const found = COUNTRIES.find((c) => c.codaKey === key);
    return found ? `${found.flag} ${found.name}` : key;
  };

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
    const matchingKeys = allCountryKeys.filter((k) => getCountryStatus(k) === key);
    return { name, value: matchingKeys.length, color, detail: matchingKeys.map(getCountryDisplay) };
  }).filter((s) => s.value > 0);

  // ── Partnership type per COUNTRY (not per store) ──────────────────────────
  const countryPartnershipMap: Record<string, string> = {};
  allCountryKeys.forEach((k) => {
    const countryStores = stores.filter((s) => s.country === k && s.partnership);
    if (!countryStores.length) {
      countryPartnershipMap[k] = "Non renseigné";
      return;
    }
    const freq: Record<string, number> = {};
    countryStores.forEach((s) => { freq[s.partnership] = (freq[s.partnership] || 0) + 1; });
    countryPartnershipMap[k] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
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
    "Non renseigné": "#D1D5DB",
  };
  const partnershipData = Object.entries(partnershipCountByCountry).map(([name, value]) => ({
    name, value, color: partnershipColors[name] ?? "#9CA3AF",
    detail: allCountryKeys.filter(k => countryPartnershipMap[k] === name).map(getCountryDisplay),
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
          { label: "Territoires actifs", value: totalCountries, icon: Globe, color: "#1B2E6B", sub: `${countryStatusData.find(d=>d.name==="Ouverts")?.value ?? 0} pays ouverts` },
          { label: "Magasins (hors prospects)", value: nonProspectStores.length, icon: Store, color: "#E40E20", sub: `${storesOpen.length} ouverts · ${storesEnCours.length} en cours` },
          { label: "Territoires prospects", value: prospectCountries, icon: ArrowUpRight, color: "#7C3AED", sub: `${storesProspects.length} magasins prospects` },
          { label: "Tâches à faire", value: todos.filter((t) => t.status !== "terminé").length, icon: Clock, color: "#8B5CF6", sub: `${todos.filter(t => t.priority === "haute" && t.status !== "terminé").length} priorité P1` },
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
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-4">
          {/* Statut des MAGASINS */}
          <PieCard
            title="Statut des magasins" chartId="stores"
            data={withPercent(statusData)} activeSlice={activeSlice} setActiveSlice={setActiveSlice}
            legend={statusData.map(s => ({ name: s.name, value: s.value, color: s.color, unit: "" }))}
          />
          {/* Statut des PAYS */}
          <PieCard
            title="Statut des pays" chartId="countries"
            data={withPercent(countryStatusData)} activeSlice={activeSlice} setActiveSlice={setActiveSlice}
            legend={countryStatusData.map(s => ({ name: s.name, value: s.value, color: s.color, unit: "" }))}
          />
          {/* MIXTE / TEXTILE */}
          <PieCard
            title="Mixte / Textile" chartId="mixte"
            data={withPercent(mixteData)} activeSlice={activeSlice} setActiveSlice={setActiveSlice}
            legend={mixteData.map(s => ({ name: s.name, value: s.value, color: s.color, unit: "" }))}
            emptyMsg="Données non renseignées"
          />
          {/* Types de contrats par PAYS */}
          <PieCard
            title="Contrats par pays" chartId="partnership"
            data={withPercent(partnershipData)} activeSlice={activeSlice} setActiveSlice={setActiveSlice}
            legend={partnershipData.map(s => ({ name: s.name, value: s.value, color: s.color, unit: " pays" }))}
          />
        </div>

        {/* Click-to-expand detail panel */}
        {activeSlice && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: activeSlice.color + "40" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: activeSlice.color + "10", borderColor: activeSlice.color + "30" }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: activeSlice.color }} />
                <span className="font-semibold text-sm text-gray-800">{activeSlice.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: activeSlice.color }}>{activeSlice.detail.length}</span>
              </div>
              <button onClick={() => setActiveSlice(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {activeSlice.detail.map((item, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full border bg-gray-50 text-gray-700">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Launch progress gauges */}
      {storesEnCours.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚧</span>
              <h2 className="font-semibold text-gray-900">Lancements en cours</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{storesEnCours.length}</span>
            </div>
            <a href="/lancement" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir le détail <ArrowUpRight size={11} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">
            {Array.from(new Set(storesEnCours.map(s => s.country))).map((countryKey) => {
              const countryStores = storesEnCours.filter(s => s.country === countryKey);
              const meta = COUNTRIES.find(c => c.codaKey === countryKey);
              const totalStores = stores.filter(s => s.country === countryKey).length;
              const openStores = stores.filter(s => s.country === countryKey && s.status === "✅ Ouvert").length;
              const progress = totalStores > 0 ? Math.round((openStores / totalStores) * 100) : 0;
              return (
                <div key={countryKey} className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta?.flag ?? "🌍"}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{meta?.name ?? countryKey}</p>
                        <p className="text-[10px] text-gray-400">{countryStores.length} magasin{countryStores.length > 1 ? "s" : ""} en cours</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    {countryStores.map(s => (
                      <span key={s.id} className="truncate max-w-[120px]">{s.name}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
