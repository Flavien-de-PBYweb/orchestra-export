"use client";
import { COUNTRIES, TODOS, TICKETS, MEETINGS } from "@/lib/data";
import {
  Globe, Store, TrendingUp, AlertCircle, CheckCircle,
  Clock, ArrowUpRight, MapPin, Users, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const COLORS = ["#1B2E6B", "#F47920", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444"];

const revenueData = [
  { month: "Jan", revenue: 2.1, growth: 8 },
  { month: "Fév", revenue: 2.4, growth: 12 },
  { month: "Mar", revenue: 2.8, growth: 15 },
  { month: "Avr", revenue: 3.1, growth: 18 },
  { month: "Mai", revenue: 3.6, growth: 22 },
  { month: "Juin", revenue: 3.9, growth: 18 },
];

const regionData = [
  { name: "Moyen-Orient", value: 27, stores: 27 },
  { name: "Afrique", value: 54, stores: 54 },
  { name: "Europe", value: 37, stores: 37 },
];

export default function DashboardPage() {
  const activeCountries = COUNTRIES.filter((c) => c.status === "actif").length;
  const totalStores = COUNTRIES.reduce((sum, c) => sum + c.stores, 0);
  const totalRevenue = COUNTRIES.reduce((sum, c) => sum + (c.revenue ?? 0), 0);
  const openTodos = TODOS.filter((t) => t.status !== "terminé").length;
  const openTickets = TICKETS.filter((t) => t.status === "ouvert" || t.status === "en_cours").length;

  const urgentTodos = TODOS.filter(
    (t) => t.priority === "haute" && t.status !== "terminé"
  ).slice(0, 4);

  const recentMeeting = MEETINGS[0];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pays actifs", value: activeCountries, total: COUNTRIES.length,
            icon: Globe, color: "#1B2E6B", trend: "+2 cette année"
          },
          {
            label: "Magasins", value: totalStores, icon: Store,
            color: "#F47920", trend: "+12 vs N-1"
          },
          {
            label: "CA Export (M€)", value: (totalRevenue / 1_000_000).toFixed(1),
            icon: TrendingUp, color: "#22C55E", trend: "+18% vs N-1"
          },
          {
            label: "Actions en cours", value: openTodos, icon: Clock,
            color: "#8B5CF6", trend: `${openTickets} tickets ouverts`
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
                {kpi.total && <p className="text-xs text-gray-400 mt-0.5">sur {kpi.total} pays</p>}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.color + "15" }}>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
              <ArrowUpRight size={12} />
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Évolution du CA Export</h2>
              <p className="text-xs text-gray-500">En millions d'euros — 6 derniers mois</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">+18% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B2E6B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B2E6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${String(v)}M€`, "CA"]} />
              <Area type="monotone" dataKey="revenue" stroke="#1B2E6B" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Region breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Répartition régionale</h2>
          <p className="text-xs text-gray-500 mb-4">Magasins par zone</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={regionData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {regionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${String(v)} magasins`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {regionData.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                  <span className="text-gray-600">{r.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{r.stores}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Country status overview */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Statut des marchés</h2>
          {[
            { label: "Actifs", count: COUNTRIES.filter(c => c.status === "actif").length, color: "#22C55E" },
            { label: "En ouverture", count: COUNTRIES.filter(c => c.status === "en_ouverture").length, color: "#F47920" },
            { label: "En négociation", count: COUNTRIES.filter(c => c.status === "négociation").length, color: "#8B5CF6" },
            { label: "Prospects", count: COUNTRIES.filter(c => c.status === "prospect").length, color: "#6B7280" },
            { label: "Suspendus", count: COUNTRIES.filter(c => c.status === "suspendu").length, color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
              <span className="font-bold text-gray-800">{s.count}</span>
            </div>
          ))}
        </div>

        {/* Urgent actions */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Actions urgentes</h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{urgentTodos.length}</span>
          </div>
          <div className="space-y-3">
            {urgentTodos.map((t) => {
              const country = COUNTRIES.find((c) => c.id === t.countryId);
              return (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-base">
                    {country?.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">{t.assignee}</span>
                      {t.dueDate && (
                        <span className="text-[10px] text-orange-500">· {new Date(t.dueDate).toLocaleDateString("fr-FR")}</span>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    t.status === "en_cours" ? "bg-blue-400" : "bg-gray-300"
                  }`} />
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

      {/* Top countries table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Top marchés</h2>
          <a href="/countries" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Voir tous <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Pays</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Partenariat</th>
                <th className="pb-3 font-medium text-right">Magasins</th>
                <th className="pb-3 font-medium text-right">CA (€)</th>
                <th className="pb-3 font-medium text-right">Croissance</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.filter(c => c.status === "actif").sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(0, 6).map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.flag}</span>
                      <div>
                        <div className="font-medium text-gray-800">{c.name}</div>
                        <div className="text-[10px] text-gray-400">{c.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Actif
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-600 capitalize">{c.partnership}</td>
                  <td className="py-3 text-right font-semibold">{c.stores}</td>
                  <td className="py-3 text-right text-gray-700">{c.revenue?.toLocaleString("fr-FR")} €</td>
                  <td className="py-3 text-right">
                    <span className={`text-xs font-semibold ${(c.growth ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>
                      {(c.growth ?? 0) > 0 ? "+" : ""}{c.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
