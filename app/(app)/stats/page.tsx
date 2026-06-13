"use client";
import { COUNTRIES, TODOS } from "@/lib/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Legend
} from "recharts";

const COLORS = ["#1B2E6B", "#F47920", "#22C55E", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function StatsPage() {
  const byRegion = ["Europe", "Moyen-Orient", "Afrique", "Amériques", "Asie"].map((r) => ({
    region: r,
    magasins: COUNTRIES.filter((c) => c.region === r).reduce((sum, c) => sum + c.stores, 0),
    pays: COUNTRIES.filter((c) => c.region === r).length,
    ca: COUNTRIES.filter((c) => c.region === r).reduce((sum, c) => sum + (c.revenue ?? 0), 0) / 1_000_000,
  })).filter((r) => r.magasins > 0 || r.pays > 0);

  const byPartnership = ["franchise", "licence", "distribution", "propre", "joint-venture"].map((p) => ({
    type: p,
    value: COUNTRIES.filter((c) => c.partnership === p).length,
  })).filter((p) => p.value > 0);

  const byStatus = [
    { name: "Actif", value: COUNTRIES.filter((c) => c.status === "actif").length, color: "#22C55E" },
    { name: "En ouverture", value: COUNTRIES.filter((c) => c.status === "en_ouverture").length, color: "#F47920" },
    { name: "Négociation", value: COUNTRIES.filter((c) => c.status === "négociation").length, color: "#8B5CF6" },
    { name: "Prospect", value: COUNTRIES.filter((c) => c.status === "prospect").length, color: "#6B7280" },
  ].filter((s) => s.value > 0);

  const revenueByCountry = COUNTRIES.filter((c) => c.revenue)
    .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
    .slice(0, 8)
    .map((c) => ({
      name: `${c.flag} ${c.name}`,
      ca: ((c.revenue ?? 0) / 1_000_000).toFixed(2),
      growth: c.growth ?? 0,
    }));

  const growthTrend = [
    { year: "2020", ca: 12.4 },
    { year: "2021", ca: 14.1 },
    { year: "2022", ca: 18.6 },
    { year: "2023", ca: 24.3 },
    { year: "2024", ca: 34.8 },
    { year: "2025 (est.)", ca: 41.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CA Export Total", value: `${(COUNTRIES.reduce((s, c) => s + (c.revenue ?? 0), 0) / 1_000_000).toFixed(1)}M€`, sub: "+18% vs N-1", color: "#1B2E6B" },
          { label: "Nombre de marchés", value: COUNTRIES.length, sub: `${COUNTRIES.filter(c => c.status === "actif").length} actifs`, color: "#F47920" },
          { label: "Magasins totaux", value: COUNTRIES.reduce((s, c) => s + c.stores, 0), sub: "Réseau mondial", color: "#22C55E" },
          { label: "Croissance moy.", value: `+${(COUNTRIES.filter(c => c.growth).reduce((s, c) => s + (c.growth ?? 0), 0) / COUNTRIES.filter(c => c.growth).length).toFixed(1)}%`, sub: "Sur marchés actifs", color: "#8B5CF6" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">CA par marché (M€)</h2>
          <p className="text-xs text-gray-400 mb-4">Top 8 pays par chiffre d'affaires</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByCountry} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${String(v)}M€`, "CA"]} />
              <Bar dataKey="ca" fill="#1B2E6B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">Statut des marchés</h2>
          <p className="text-xs text-gray-400 mb-4">Répartition par statut</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {byStatus.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">Évolution CA Export (M€)</h2>
          <p className="text-xs text-gray-400 mb-4">Historique 2020-2025</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthTrend}>
              <defs>
                <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F47920" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F47920" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${String(v)}M€`, "CA"]} />
              <Area type="monotone" dataKey="ca" stroke="#F47920" strokeWidth={2.5} fill="url(#ca)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">Magasins & CA par région</h2>
          <p className="text-xs text-gray-400 mb-4">Comparaison régionale</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="magasins" name="Magasins" fill="#1B2E6B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pays" name="Pays" fill="#F47920" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Partnership breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Répartition des partenariats</h2>
        <div className="grid grid-cols-5 gap-3">
          {byPartnership.map((p, i) => (
            <div key={p.type} className="text-center p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-3xl font-black mb-1" style={{ color: COLORS[i] }}>{p.value}</div>
              <div className="text-xs text-gray-500 capitalize font-medium">{p.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
