"use client";
import { useState } from "react";
import { COUNTRIES, STORES } from "@/lib/data";
import { useCodaSyncStore } from "@/lib/store";
import { RefreshCw, MapPin, Store, Users, Package, Search } from "lucide-react";
import dynamic from "next/dynamic";

const ProspectMap = dynamic(() => import("@/components/shared/ProspectMap").then(m => m.ProspectMap), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />,
});

const PARTNERSHIP_COLORS: Record<string, string> = {
  "FRANCHISE":            "bg-blue-50 text-blue-700 border-blue-200",
  "MASTER FRANCHISE":     "bg-red-50 text-red-700 border-red-200",
  "DISTRI LIGHT":         "bg-cyan-50 text-cyan-700 border-cyan-200",
  "COMMISSION AFFILIATION": "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ProspectsPage() {
  const { stores: syncedStores, lastSync, isSyncing, syncFromCoda } = useCodaSyncStore();
  const storeSource = syncedStores ?? STORES;
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterPartnership, setFilterPartnership] = useState("all");

  const prospects = storeSource.filter((s) => s.status === "🎯 Prospects");

  const filtered = prospects.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.country.toLowerCase().includes(q);
    const matchCountry = filterCountry === "all" || s.country === filterCountry;
    const matchPartnership = filterPartnership === "all" || s.partnership === filterPartnership;
    return matchSearch && matchCountry && matchPartnership;
  });

  const prospectCountries = Array.from(new Set(prospects.map((s) => s.country)));
  const partnerships = Array.from(new Set(prospects.map((s) => s.partnership).filter(Boolean)));

  const byCountry = prospectCountries.map((key) => {
    const countryMeta = COUNTRIES.find((c) => c.codaKey === key);
    const countryStores = filtered.filter((s) => s.country === key);
    return { key, countryMeta, stores: countryStores };
  }).filter((c) => c.stores.length > 0).sort((a, b) => b.stores.length - a.stores.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🎯 <span>Prospects</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Magasins en phase de prospection — source Coda</p>
        </div>
        <button onClick={syncFromCoda} disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-60 shadow-sm">
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Sync…" : lastSync ? "Resync Coda" : "Synchroniser Coda"}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Store size={18} className="text-violet-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Total prospects</p>
          </div>
          <p className="text-3xl font-bold text-violet-700">{prospects.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Pays concernés</p>
          </div>
          <p className="text-3xl font-bold text-blue-700">{prospectCountries.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Package size={18} className="text-red-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Type Mixte</p>
          </div>
          <p className="text-3xl font-bold text-red-700">{prospects.filter(s => s.product === "MIXTE").length}</p>
        </div>
      </div>

      {/* World map */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">Carte des prospects</h2>
          <p className="text-xs text-gray-400">{prospectCountries.length} pays · {prospects.length} magasins</p>
        </div>
        <div className="p-3">
          <ProspectMap prospectStores={prospects} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un prospect…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2" />
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
          <option value="all">Tous les pays ({prospectCountries.length})</option>
          {prospectCountries.sort().map((k) => {
            const meta = COUNTRIES.find(c => c.codaKey === k);
            return <option key={k} value={k}>{meta ? `${meta.flag} ${meta.name}` : k}</option>;
          })}
        </select>
        {partnerships.length > 0 && (
          <select value={filterPartnership} onChange={(e) => setFilterPartnership(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
            <option value="all">Tous types de contrat</option>
            {partnerships.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* No sync warning */}
      {!lastSync && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <span>⚡</span>
          <span>Les données affichées sont statiques. Cliquez <strong>Synchroniser Coda</strong> pour charger les vrais prospects.</span>
        </div>
      )}

      {/* Prospect stores by country */}
      {byCountry.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 text-sm">Aucun prospect trouvé.</p>
          <p className="text-gray-400 text-xs mt-1">Synchronisez Coda ou modifiez les filtres.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {byCountry.map(({ key, countryMeta, stores: countryStores }) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Country header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{countryMeta?.flag ?? "🌍"}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{countryMeta?.name ?? key}</h3>
                    <p className="text-xs text-gray-400">{countryMeta?.region ?? ""}</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                  {countryStores.length} prospect{countryStores.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Store cards */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {countryStores.map((s) => {
                  const mapsUrl = s.city
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.name, s.city, countryMeta?.name ?? key].filter(Boolean).join(", "))}`
                    : null;
                  return (
                    <div key={s.id} className="border border-violet-100 rounded-xl p-3.5 bg-violet-50/30 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-sm text-gray-800 leading-snug">{s.name}</p>
                        {s.product && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ml-2 shrink-0 ${s.product === "MIXTE" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                            {s.product}
                          </span>
                        )}
                      </div>

                      {s.city && (
                        <div className="flex items-center gap-1 mb-2">
                          {mapsUrl ? (
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-0.5">
                              <MapPin size={11} />{s.city}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                              <MapPin size={11} />{s.city}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.partnership && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${PARTNERSHIP_COLORS[s.partnership] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {s.partnership}
                          </span>
                        )}
                        {s.rep && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                            👤 {s.rep}
                          </span>
                        )}
                      </div>

                      {s.notes && (
                        <p className="mt-2 text-[11px] text-gray-400 line-clamp-2 italic">{s.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
