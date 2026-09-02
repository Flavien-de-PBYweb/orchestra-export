"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, STORES, type Country } from "@/lib/data";
import { useCodaSyncStore } from "@/lib/store";
import { Search, Plus, Store, MapPin, X, Loader2, StickyNote } from "lucide-react";
import { useCountryNotesStore } from "@/lib/store";

const REGION_COLORS: Record<string, string> = {
  "Europe": "bg-blue-50 text-blue-700",
  "Afrique du Nord": "bg-yellow-50 text-yellow-700",
  "Afrique": "bg-green-50 text-green-700",
  "DOM-TOM": "bg-purple-50 text-purple-700",
  "Caucase": "bg-orange-50 text-orange-700",
  "Asie Centrale": "bg-red-50 text-red-700",
  "Asie": "bg-pink-50 text-pink-700",
  "Amériques": "bg-cyan-50 text-cyan-700",
  "Moyen-Orient": "bg-amber-50 text-amber-700",
};

function CountryCard({ c, storeCount, hasNote, onClick, onNote }: {
  c: Country; storeCount: number; hasNote: boolean;
  onClick: () => void; onNote: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all hover:border-blue-100 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{c.flag}</span>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{c.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${REGION_COLORS[c.region] ?? "bg-gray-100 text-gray-600"}`}>
              {c.region}
            </span>
          </div>
        </div>
        <button
          onClick={onNote}
          title="Notes"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${hasNote ? "bg-yellow-100 text-yellow-600" : "bg-gray-50 text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"}`}>
          <StickyNote size={13} />
        </button>
      </div>
      <div className="mt-4 bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
        <Store size={12} className="text-gray-400" />
        <span className="text-xs text-gray-500">Magasins</span>
        <span className="ml-auto font-bold text-gray-800">{storeCount}</span>
      </div>
      <div className="mt-2 text-xs text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Voir le détail →
      </div>
    </div>
  );
}

function AddStoreModal({ onClose }: { onClose: () => void }) {
  const { addStoreToCoda, stores: syncedStores } = useCodaSyncStore();
  const [storeName, setStoreName] = useState("");
  const [country, setCountry] = useState("");
  const [isNewCountry, setIsNewCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [rep, setRep] = useState("");
  const [city, setCity] = useState("");
  const [partnership, setPartnership] = useState("FRANCHISE");
  const [status, setStatus] = useState("🔍 En recherche cellule");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Build unique sorted country list from existing Coda data
  const existingCountries = Array.from(
    new Set((syncedStores ?? STORES).map((s) => s.country).filter(Boolean))
  ).sort();

  const effectiveCountry = isNewCountry ? newCountryName.toUpperCase() : country;

  const handleSubmit = async () => {
    if (!storeName.trim() || !effectiveCountry.trim()) return;
    setLoading(true);
    const res = await addStoreToCoda({
      id: `s${Date.now()}`,
      name: storeName,
      country: effectiveCountry,
      status: status as import("@/lib/data").StoreStatus,
      partnership: partnership as import("@/lib/data").PartnershipType,
      product: "",
      code: "",
      rep,
      denom: "",
      address: "",
      city,
      notes: "",
      surface: "",
    });
    setLoading(false);
    if (res.ok) {
      setResult({ ok: true, message: `Magasin « ${storeName} » ajouté dans Coda${isNewCountry ? ` (nouveau pays : ${effectiveCountry})` : ""} ! Cliquez « Synchroniser Coda » pour actualiser.` });
    } else if (res.error?.includes("CODA_API_KEY")) {
      setResult({ ok: false, message: "Coda n'est pas encore configuré. Ajoutez CODA_API_KEY dans votre .env.local (voir Administration → Intégrations)." });
    } else {
      setResult({ ok: false, message: res.error ?? "Erreur inconnue" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Ajouter un magasin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {result ? (
          <div className={`rounded-xl p-4 mb-4 text-sm ${result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {result.message}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Nom du magasin *</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="ex: RABAT MEGA MALL"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Pays *</label>
                <button
                  type="button"
                  onClick={() => { setIsNewCountry(!isNewCountry); setCountry(""); setNewCountryName(""); }}
                  className="text-[10px] text-blue-500 hover:underline"
                >
                  {isNewCountry ? "← Pays existant" : "+ Nouveau pays"}
                </button>
              </div>
              {isNewCountry ? (
                <div className="space-y-1">
                  <input
                    value={newCountryName}
                    onChange={(e) => setNewCountryName(e.target.value)}
                    placeholder="ex: JORDANIE"
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400">Ce pays sera créé dans Coda avec ce nom (en majuscules).</p>
                </div>
              ) : (
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
                >
                  <option value="">— Sélectionner un pays —</option>
                  {existingCountries.map((c) => {
                    const countryData = COUNTRIES.find((cd) => cd.codaKey === c);
                    return (
                      <option key={c} value={c}>
                        {countryData ? `${countryData.flag} ${countryData.name}` : c}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Ville</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="ex: Rabat"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Partenariat</label>
                <select value={partnership} onChange={(e) => setPartnership(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                  <option>FRANCHISE</option>
                  <option>MASTER FRANCHISE</option>
                  <option>DISTRI LIGHT</option>
                  <option>COMMISSION AFFILIATION</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                <option value="✅ Ouvert">✅ Ouvert</option>
                <option value="🚧 En cours">🚧 En cours</option>
                <option value="🔍 En recherche cellule">🔍 En recherche cellule</option>
                <option value="🎯 Prospects">🎯 Prospects</option>
                <option value="⏸️ Suspendu">⏸️ Suspendu</option>
                <option value="❌ Fermé">❌ Fermé</option>
                <option value="FERMETURE A VENIR">FERMETURE A VENIR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Représentant légal</label>
              <input value={rep} onChange={(e) => setRep(e.target.value)} placeholder="Nom du représentant"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            {result ? "Fermer" : "Annuler"}
          </button>
          {!result && (
            <button onClick={handleSubmit} disabled={loading || !storeName.trim() || !effectiveCountry.trim()}
              className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              style={{ background: "#E40E20" }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Envoi vers Coda…" : "Ajouter dans Coda"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CountriesPage() {
  const router = useRouter();
  const { stores: syncedStores } = useCodaSyncStore();
  const { notes: countryNotes, setNote } = useCountryNotesStore();
  const stores = syncedStores ?? STORES;
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showAdd, setShowAdd] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [noteCountry, setNoteCountry] = useState<Country | null>(null);
  const [noteText, setNoteText] = useState("");

  const regions = Array.from(new Set(COUNTRIES.map((c) => c.region))).sort();

  const filtered = COUNTRIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = filterRegion === "all" || c.region === filterRegion;
    return matchSearch && matchRegion;
  });

  const getStoreCount = (c: Country) => stores.filter((s) => s.country === c.codaKey).length;

  // ── Store recap across all countries ───────────────────────────────────────
  const recapStats = [
    { label: "Ouverts",            color: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50  border-green-100",  activeBg: "ring-2 ring-green-400",  status: "✅ Ouvert" },
    { label: "En cours",           color: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50   border-blue-100",   activeBg: "ring-2 ring-blue-400",   status: "🚧 En cours" },
    { label: "En recherche",       color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-100", activeBg: "ring-2 ring-yellow-400", status: "🔍 En recherche cellule" },
    { label: "Fermeture à venir",  color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50 border-orange-100", activeBg: "ring-2 ring-orange-400", status: "FERMETURE A VENIR" },
    { label: "Prospects",          color: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50 border-violet-100", activeBg: "ring-2 ring-violet-400", status: "🎯 Prospects" },
    { label: "Stand by",           color: "bg-gray-400",   text: "text-gray-600",   bg: "bg-gray-50   border-gray-200",   activeBg: "ring-2 ring-gray-400",   status: "⏸️ Suspendu" },
    { label: "Fermés",             color: "bg-red-400",    text: "text-red-600",    bg: "bg-red-50    border-red-100",    activeBg: "ring-2 ring-red-400",    status: "❌ Fermé" },
  ].map((s) => ({ ...s, count: stores.filter((st) => st.status === s.status).length }))
   .filter((s) => s.count > 0);

  // Stores shown when a status card is clicked
  const filteredStoresByStatus = activeStatus
    ? stores.filter((s) => s.status === activeStatus)
    : [];

  return (
    <div className="space-y-6">
      {/* Recap block — clickable */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${recapStats.length}, minmax(0,1fr))` }}>
        {recapStats.map((s) => {
          const isActive = activeStatus === s.status;
          return (
            <button key={s.label}
              onClick={() => setActiveStatus(isActive ? null : s.status)}
              className={`rounded-xl border p-3 flex items-center gap-3 text-left transition-all cursor-pointer hover:scale-[1.02] ${s.bg} ${isActive ? s.activeBg : ""}`}>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
              <div>
                <div className={`text-xl font-bold ${s.text}`}>{s.count}</div>
                <div className="text-[10px] text-gray-500 font-medium">{s.label}</div>
              </div>
              {isActive && <div className="ml-auto text-gray-400 text-xs">✕</div>}
            </button>
          );
        })}
      </div>

      {/* Filtered stores panel */}
      {activeStatus && filteredStoresByStatus.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <h3 className="font-semibold text-sm text-gray-800">
              Magasins · {recapStats.find(r => r.status === activeStatus)?.label}
              <span className="ml-2 text-xs font-normal text-gray-500">({filteredStoresByStatus.length})</span>
            </h3>
            <button onClick={() => setActiveStatus(null)} className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1">
              <X size={14} /> Fermer
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredStoresByStatus.map((s) => {
                const countryMeta = COUNTRIES.find((c) => c.codaKey === s.country);
                return (
                  <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="text-xl shrink-0">{countryMeta?.flag ?? "🌍"}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400">{countryMeta?.name ?? s.country}{s.city ? ` · ${s.city}` : ""}</p>
                      </div>
                    </div>
                    {s.partnership && (
                      <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{s.partnership}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Region filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRegion("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterRegion === "all" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
          Toutes régions <span className="ml-1 opacity-60">{COUNTRIES.length}</span>
        </button>
        {regions.map((r) => {
          const count = COUNTRIES.filter((c) => c.region === r).length;
          return (
            <button key={r}
              onClick={() => setFilterRegion(filterRegion === r ? "all" : r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterRegion === r ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
              {r} <span className="ml-1 opacity-60">{count}</span>
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
            placeholder="Rechercher un pays…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2"
          />
        </div>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`px-3 py-2 text-xs ${view === "grid" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}>Grille</button>
          <button onClick={() => setView("list")} className={`px-3 py-2 text-xs border-l border-gray-200 ${view === "list" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}>Liste</button>
        </div>

        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium transition-colors"
          style={{ background: "#E40E20" }}>
          <Plus size={15} />
          Ajouter un magasin
        </button>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} pays / marchés</p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CountryCard key={c.id} c={c} storeCount={getStoreCount(c)}
              hasNote={!!countryNotes[c.codaKey]}
              onClick={() => router.push(`/countries/${c.id}`)}
              onNote={(e) => { e.stopPropagation(); setNoteCountry(c); setNoteText(countryNotes[c.codaKey] ?? ""); }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Pays</th>
                <th className="px-5 py-3 font-medium">Région</th>
                <th className="px-5 py-3 font-medium text-right">Magasins</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => router.push(`/countries/${c.id}`)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="font-medium text-gray-800">{c.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${REGION_COLORS[c.region] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.region}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{getStoreCount(c)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-xs text-blue-500 hover:underline flex items-center gap-1 justify-end">
                      <MapPin size={11} /> Voir détail
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddStoreModal onClose={() => setShowAdd(false)} />}

      {/* Country notes slide panel */}
      {noteCountry && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setNoteCountry(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{noteCountry.flag}</span>
                <div>
                  <h2 className="font-bold text-gray-900">{noteCountry.name}</h2>
                  <p className="text-xs text-gray-400">Notes internes</p>
                </div>
              </div>
              <button onClick={() => setNoteCountry(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-6">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={`Notez ici vos observations sur ${noteCountry.name}…\n\nEx : contact local, avancement des négociations, points de vigilance...`}
                className="w-full h-full min-h-[300px] text-sm text-gray-700 border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setNoteCountry(null)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => { setNote(noteCountry.codaKey, noteText); setNoteCountry(null); }}
                className="flex-1 py-2 text-sm text-white rounded-lg font-medium"
                style={{ background: "#1B2E6B" }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
