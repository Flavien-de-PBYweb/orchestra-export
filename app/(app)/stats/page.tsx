"use client";
import { COUNTRIES, STORES } from "@/lib/data";
import { useTodoStore, useCodaSyncStore } from "@/lib/store";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const PIE_COLORS = ["#1B2E6B", "#E40E20", "#22C55E", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#84CC16", "#F97316"];

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { total?: number } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const total = item.payload?.total ?? 0;
  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "—";
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-800">{item.name}</p>
      <p className="text-gray-600">{item.value} · <span className="font-bold text-blue-700">{pct}%</span></p>
    </div>
  );
}

export default function StatsPage() {
  const { todos } = useTodoStore();
  const { stores: syncedStores, lastSync } = useCodaSyncStore();
  const stores = syncedStores ?? STORES;

  const totalStores = stores.length;
  const storesOpen = stores.filter((s) => s.status === "✅ Ouvert").length;
  const storesEnCours = stores.filter((s) => s.status === "🚧 En cours").length;
  const storesSuspendu = stores.filter((s) => s.status === "⏸️ Suspendu").length;
  const storesFermeture = stores.filter((s) => s.status === "FERMETURE A VENIR" || s.status === "❌ Fermé").length;
  const storesEnRecherche = stores.filter((s) => s.status === "🔍 En recherche cellule").length;
  const totalCountries = new Set(stores.map((s) => s.country)).size;

  // Regions pie
  const allRegions = Array.from(new Set(COUNTRIES.map((c) => c.region)));
  const byRegionPie = allRegions.map((r) => ({
    name: r,
    value: stores.filter((s) => COUNTRIES.find((c) => c.codaKey === s.country)?.region === r).length,
    total: totalStores,
  })).filter((r) => r.value > 0).sort((a, b) => b.value - a.value);

  // Countries pie (all stores)
  const byCountryPie = COUNTRIES.map((c) => ({
    name: `${c.flag} ${c.name}`,
    value: stores.filter((s) => s.country === c.codaKey).length,
    total: totalStores,
  })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);

  // Partnership pie
  const partnershipTypes = ["FRANCHISE", "MASTER FRANCHISE", "DISTRI LIGHT", "COMMISSION AFFILIATION"];
  const byPartnershipPie = partnershipTypes.map((p, i) => ({
    name: p === "COMMISSION AFFILIATION" ? "COMM. AFFILIATION" : p,
    value: stores.filter((s) => s.partnership === p).length,
    total: totalStores,
    color: PIE_COLORS[i],
  })).filter((p) => p.value > 0);

  // Status pie
  const statusPie = [
    { name: "Ouverts", value: storesOpen, color: "#22C55E", total: totalStores },
    { name: "En cours", value: storesEnCours, color: "#E40E20", total: totalStores },
    { name: "En recherche", value: storesEnRecherche, color: "#F59E0B", total: totalStores },
    { name: "Suspendus", value: storesSuspendu, color: "#8B5CF6", total: totalStores },
    { name: "Fermeture", value: storesFermeture, color: "#EF4444", total: totalStores },
  ].filter((s) => s.value > 0);

  const todosByStatus = [
    { name: "En cours", value: todos.filter((t) => t.status === "en_cours").length, color: "#1B2E6B", total: todos.length },
    { name: "À faire", value: todos.filter((t) => t.status === "à_faire").length, color: "#E40E20", total: todos.length },
    { name: "Bloqué", value: todos.filter((t) => t.status === "bloqué").length, color: "#8B5CF6", total: todos.length },
    { name: "Terminé", value: todos.filter((t) => t.status === "terminé").length, color: "#22C55E", total: todos.length },
  ].filter((t) => t.value > 0);

  const syncInfo = lastSync
    ? `Sync Coda : ${new Date(lastSync).toLocaleString("fr-FR")}`
    : "Données : import Coda statique — cliquez « Synchroniser Coda » pour actualiser";

  return (
    <div className="space-y-6">
      {/* Source indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2">
        <div className={`w-2 h-2 rounded-full ${lastSync ? "bg-green-400" : "bg-amber-400"}`} />
        {syncInfo}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pays / marchés actifs", value: totalCountries, sub: `${COUNTRIES.length} dans la base`, color: "#1B2E6B" },
          { label: "Magasins totaux", value: totalStores, sub: `${storesOpen} ouverts`, color: "#E40E20" },
          { label: "Ouvertures en cours", value: storesEnCours, sub: `+ ${storesEnRecherche} en recherche`, color: "#22C55E" },
          { label: "Actions en cours", value: todos.filter((t) => t.status !== "terminé").length, sub: "Plan d'actions", color: "#8B5CF6" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1 — Status + Partnership */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Statut des magasins</h2>
          <p className="text-xs text-gray-500 mb-3">Répartition réelle · hover pour le %</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusPie}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                labelLine={false}
                label={CustomLabel as never}
              >
                {statusPie.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Type de partenariat</h2>
          <p className="text-xs text-gray-500 mb-3">Répartition des contrats · hover pour le %</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byPartnershipPie}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                labelLine={false}
                label={CustomLabel as never}
              >
                {byPartnershipPie.map((p, i) => <Cell key={i} fill={p.color ?? PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Regions + Todos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Répartition par région</h2>
          <p className="text-xs text-gray-500 mb-3">Tous les magasins · hover pour le %</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byRegionPie}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={40}
                labelLine={false}
                label={CustomLabel as never}
              >
                {byRegionPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Plan d'actions — Statuts</h2>
          <p className="text-xs text-gray-500 mb-3">Source : Coda Planning GANTT · hover pour le %</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={todosByStatus}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={40}
                labelLine={false}
                label={CustomLabel as never}
              >
                {todosByStatus.map((t, i) => <Cell key={i} fill={t.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — All stores by country */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-1">Magasins par pays — Tous les pays</h2>
        <p className="text-xs text-gray-500 mb-4">{byCountryPie.length} pays avec des magasins · hover pour le %</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={byCountryPie}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={50}
              labelLine={false}
              label={CustomLabel as never}
            >
              {byCountryPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Also show ranked list */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {byCountryPie.map((c, i) => (
            <div key={c.name} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-gray-700">{c.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{c.value}</span>
                <span className="text-gray-400">({((c.value / totalStores) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
