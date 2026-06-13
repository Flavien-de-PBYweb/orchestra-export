"use client";
import { COUNTRIES, STORES } from "@/lib/data";
import { useTodoStore, useCodaSyncStore } from "@/lib/store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#1B2E6B", "#E40E20", "#22C55E", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function StatsPage() {
  const { todos } = useTodoStore();
  const { stores: syncedStores, lastSync } = useCodaSyncStore();
  const stores = syncedStores ?? STORES;

  // All stats computed from real store data
  const totalStores = stores.length;
  const storesOpen = stores.filter((s) => s.status === "✅ Ouvert").length;
  const storesEnCours = stores.filter((s) => s.status === "🚧 En cours").length;
  const storesSuspendu = stores.filter((s) => s.status === "⏸️ Suspendu").length;
  const storesFermeture = stores.filter((s) => s.status === "FERMETURE A VENIR" || s.status === "❌ Fermé").length;
  const storesEnRecherche = stores.filter((s) => s.status === "🔍 En recherche cellule").length;
  const totalCountries = new Set(stores.map((s) => s.country)).size;

  const allRegions = Array.from(new Set(COUNTRIES.map((c) => c.region)));
  const byRegion = allRegions.map((r) => ({
    region: r.length > 12 ? r.substring(0, 12) + "…" : r,
    fullRegion: r,
    magasins: stores.filter((s) => COUNTRIES.find((c) => c.codaKey === s.country)?.region === r).length,
    pays: COUNTRIES.filter((c) => c.region === r && stores.some((s) => s.country === c.codaKey)).length,
  })).filter((r) => r.magasins > 0).sort((a, b) => b.magasins - a.magasins);

  const partnershipTypes = ["FRANCHISE", "MASTER FRANCHISE", "DISTRI LIGHT", "COMMISSION AFFILIATION"];
  const byPartnership = partnershipTypes.map((p) => ({
    type: p === "COMMISSION AFFILIATION" ? "COMM. AFFIL." : p,
    value: stores.filter((s) => s.partnership === p).length,
  })).filter((p) => p.value > 0);

  const statusGroups = [
    { name: "Ouverts", value: storesOpen, color: "#22C55E" },
    { name: "En cours", value: storesEnCours, color: "#E40E20" },
    { name: "En recherche", value: storesEnRecherche, color: "#F59E0B" },
    { name: "Suspendus", value: storesSuspendu, color: "#8B5CF6" },
    { name: "Fermeture", value: storesFermeture, color: "#EF4444" },
  ].filter((s) => s.value > 0);

  const storesByCountry = COUNTRIES.map((c) => ({
    name: `${c.flag} ${c.name}`,
    stores: stores.filter((s) => s.country === c.codaKey).length,
  })).filter((c) => c.stores > 0).sort((a, b) => b.stores - a.stores).slice(0, 10);

  const todosByStatus = [
    { name: "En cours", value: todos.filter((t) => t.status === "en_cours").length },
    { name: "À faire", value: todos.filter((t) => t.status === "à_faire").length },
    { name: "Bloqué", value: todos.filter((t) => t.status === "bloqué").length },
    { name: "Terminé", value: todos.filter((t) => t.status === "terminé").length },
  ];

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

      {/* KPIs — all real */}
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

      {/* Row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Magasins par pays (Top 10)</h2>
          <p className="text-xs text-gray-500 mb-4">Nombre de points de vente · données Coda réelles</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={storesByCountry} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v) => [`${String(v)} magasins`]} />
              <Bar dataKey="stores" fill="#1B2E6B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Statut des magasins</h2>
          <p className="text-xs text-gray-500 mb-3">Répartition réelle</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusGroups} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {statusGroups.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${String(v)} magasins`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {statusGroups.map((s) => (
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
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Magasins par région</h2>
          <p className="text-xs text-gray-500 mb-4">Distribution géographique réelle</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip labelFormatter={(l) => byRegion.find((r) => r.region === l)?.fullRegion ?? l} />
              <Bar dataKey="magasins" name="Magasins" fill="#1B2E6B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pays" name="Pays" fill="#E40E20" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Type de partenariat</h2>
          <div className="space-y-4">
            {byPartnership.map((p, i) => (
              <div key={p.type}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-medium">{p.type}</span>
                  <span className="font-bold text-gray-800">{p.value} <span className="font-normal text-gray-400">magasins</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${(p.value / totalStores) * 100}%`,
                      background: COLORS[i],
                    }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Plan d'actions</h3>
            <div className="space-y-3">
              {todosByStatus.map((t, i) => (
                <div key={t.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{t.name}</span>
                    <span className="font-semibold">{t.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: todos.length ? `${(t.value / todos.length) * 100}%` : "0%",
                        background: COLORS[i],
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
