"use client";
import { ECOMMERCE_STORES, COUNTRIES } from "@/lib/data";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { TrendingUp, ShoppingBag, Percent, Package, ExternalLink, Plus } from "lucide-react";

const weeklyData = [
  { day: "Lun", ma: 9200, ae: 4100, sa: 6300, es: 13800 },
  { day: "Mar", ma: 8400, ae: 4600, sa: 7100, es: 14200 },
  { day: "Mer", ma: 9800, ae: 3900, sa: 6800, es: 13100 },
  { day: "Jeu", ma: 10200, ae: 5200, sa: 7600, es: 15300 },
  { day: "Ven", ma: 11400, ae: 6100, sa: 8200, es: 16800 },
  { day: "Sam", ma: 13600, ae: 7400, sa: 9500, es: 18200 },
  { day: "Dim", ma: 10800, ae: 5900, sa: 8100, es: 14900 },
];

export default function ReportingPage() {
  const totalRevenue30d = ECOMMERCE_STORES.reduce((s, e) => s + e.revenue30d, 0);
  const totalOrders30d = ECOMMERCE_STORES.reduce((s, e) => s + e.orders30d, 0);
  const avgConversion = ECOMMERCE_STORES.reduce((s, e) => s + e.conversionRate, 0) / ECOMMERCE_STORES.length;
  const avgGrowth = ECOMMERCE_STORES.reduce((s, e) => s + e.growth, 0) / ECOMMERCE_STORES.length;

  return (
    <div className="space-y-6">
      {/* Connect banner */}
      <div className="rounded-2xl p-4 border bg-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Boutiques e-commerce connectées</h3>
            <p className="text-xs text-gray-500">{ECOMMERCE_STORES.length} boutiques · Shopify, WooCommerce, SFCC · Sync toutes les heures</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          <Plus size={14} /> Connecter une boutique
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Revenus 30j", value: totalRevenue30d.toLocaleString("fr-FR") + " *", icon: TrendingUp, color: "#1B2E6B", note: "Multi-devises" },
          { label: "Commandes 30j", value: totalOrders30d.toLocaleString("fr-FR"), icon: Package, color: "#F47920" },
          { label: "Taux conversion moy.", value: `${avgConversion.toFixed(1)}%`, icon: Percent, color: "#22C55E" },
          { label: "Croissance moy.", value: `+${avgGrowth.toFixed(0)}%`, icon: TrendingUp, color: "#8B5CF6" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">{k.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.color + "15" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            {k.note && <p className="text-[10px] text-gray-400 mt-1">{k.note}</p>}
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Revenus quotidiens par boutique</h2>
            <p className="text-xs text-gray-400">7 derniers jours (devises locales)</p>
          </div>
          <div className="flex gap-3 text-xs">
            {[
              { key: "ma", label: "🇲🇦 Maroc", color: "#1B2E6B" },
              { key: "ae", label: "🇦🇪 UAE", color: "#F47920" },
              { key: "sa", label: "🇸🇦 KSA", color: "#22C55E" },
              { key: "es", label: "🇪🇸 Espagne", color: "#8B5CF6" },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyData}>
            <defs>
              {[
                { id: "gma", color: "#1B2E6B" },
                { id: "gae", color: "#F47920" },
                { id: "gsa", color: "#22C55E" },
                { id: "ges", color: "#8B5CF6" },
              ].map(({ id, color }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            {[
              { key: "ma", color: "#1B2E6B", fill: "url(#gma)" },
              { key: "ae", color: "#F47920", fill: "url(#gae)" },
              { key: "sa", color: "#22C55E", fill: "url(#gsa)" },
              { key: "es", color: "#8B5CF6", fill: "url(#ges)" },
            ].map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} fill={s.fill} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Store cards */}
      <div className="grid grid-cols-2 gap-4">
        {ECOMMERCE_STORES.map((store) => {
          const country = COUNTRIES.find((c) => c.id === store.countryId);
          return (
            <div key={store.id} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country?.flag}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{country?.name}</h3>
                    <p className="text-xs text-gray-400">{store.platform} · {store.url}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><ExternalLink size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "CA 30j", value: store.revenue30d.toLocaleString(), suffix: store.currency },
                  { label: "Commandes 30j", value: store.orders30d.toLocaleString(), suffix: "" },
                  { label: "Conversion", value: `${store.conversionRate}%`, suffix: "" },
                  { label: "Croissance", value: `+${store.growth}%`, suffix: "", color: "#22C55E" },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                    <p className="font-bold text-sm" style={{ color: m.color ?? "#1A1A2E" }}>
                      {m.value} <span className="font-normal text-xs text-gray-400">{m.suffix}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
