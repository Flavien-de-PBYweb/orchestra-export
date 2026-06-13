"use client";
import { useState } from "react";
import { COUNTRIES, type Country, type CountryStatus } from "@/lib/data";
import { Search, Plus, Filter, MapPin, Store, TrendingUp, ExternalLink } from "lucide-react";

const STATUS_LABELS: Record<CountryStatus, string> = {
  actif: "Actif",
  prospect: "Prospect",
  négociation: "Négociation",
  suspendu: "Suspendu",
  en_ouverture: "En ouverture",
};

const STATUS_COLORS: Record<CountryStatus, string> = {
  actif: "bg-green-100 text-green-700",
  prospect: "bg-gray-100 text-gray-600",
  négociation: "bg-purple-100 text-purple-700",
  suspendu: "bg-red-100 text-red-600",
  en_ouverture: "bg-orange-100 text-orange-700",
};

function CountryCard({ c }: { c: Country }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all hover:border-blue-100 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{c.flag}</span>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{c.name}</h3>
            <p className="text-xs text-gray-400">{c.region}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
          {STATUS_LABELS[c.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <Store size={11} />
            <span className="text-[10px] uppercase tracking-wide">Magasins</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">{c.stores}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <TrendingUp size={11} />
            <span className="text-[10px] uppercase tracking-wide">Croissance</span>
          </div>
          <span className={`font-bold text-lg ${(c.growth ?? 0) > 0 ? "text-green-600" : c.growth === undefined ? "text-gray-400" : "text-red-500"}`}>
            {c.growth !== undefined ? `${c.growth > 0 ? "+" : ""}${c.growth}%` : "–"}
          </span>
        </div>
      </div>

      {c.partner && (
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
          <span className="capitalize text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{c.partnership}</span>
          <span className="truncate">{c.partner}</span>
        </div>
      )}

      {c.revenue && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">CA annuel</span>
          <span className="text-sm font-semibold text-gray-700">{c.revenue.toLocaleString("fr-FR")} €</span>
        </div>
      )}

      <div className="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Voir le détail <ExternalLink size={11} />
      </div>
    </div>
  );
}

export default function CountriesPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<CountryStatus | "all">("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = COUNTRIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.partner ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchRegion = filterRegion === "all" || c.region === filterRegion;
    return matchSearch && matchStatus && matchRegion;
  });

  const regions = Array.from(new Set(COUNTRIES.map((c) => c.region)));

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-5 gap-3">
        {(["actif", "en_ouverture", "négociation", "prospect", "suspendu"] as CountryStatus[]).map((s) => {
          const count = COUNTRIES.filter((c) => c.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={`bg-white rounded-xl p-3 border text-left transition-all ${
                filterStatus === s ? "border-blue-300 shadow-sm" : "border-gray-100 hover:border-gray-200"
              }`}>
              <div className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mb-1.5 ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]}
              </div>
              <div className="text-2xl font-bold text-gray-800">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un pays ou partenaire…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2"
          />
        </div>

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
          <option value="all">Toutes régions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`px-3 py-2 text-xs ${view === "grid" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}>Grille</button>
          <button onClick={() => setView("list")} className={`px-3 py-2 text-xs border-l border-gray-200 ${view === "list" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}>Liste</button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium transition-colors"
          style={{ background: "#F47920" }}>
          <Plus size={15} />
          Ajouter un pays
        </button>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500">{filtered.length} pays / marchés</p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => <CountryCard key={c.id} c={c} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Pays</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Partenariat</th>
                <th className="px-5 py-3 font-medium">Partenaire</th>
                <th className="px-5 py-3 font-medium text-right">Magasins</th>
                <th className="px-5 py-3 font-medium text-right">CA (€)</th>
                <th className="px-5 py-3 font-medium text-right">Croissance</th>
                <th className="px-5 py-3 font-medium">Manager</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="font-medium text-gray-800">{c.name}</div>
                        <div className="text-[10px] text-gray-400">{c.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 capitalize">{c.partnership}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{c.partner ?? "–"}</td>
                  <td className="px-5 py-3 text-right font-semibold">{c.stores}</td>
                  <td className="px-5 py-3 text-right text-gray-700 text-xs">{c.revenue?.toLocaleString("fr-FR") ?? "–"}</td>
                  <td className="px-5 py-3 text-right">
                    {c.growth !== undefined ? (
                      <span className={`text-xs font-semibold ${c.growth > 0 ? "text-green-600" : "text-red-500"}`}>
                        {c.growth > 0 ? "+" : ""}{c.growth}%
                      </span>
                    ) : "–"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{c.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
