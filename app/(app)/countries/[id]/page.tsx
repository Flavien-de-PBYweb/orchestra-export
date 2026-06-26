"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getCountryById, getStoresForCountry, INITIAL_TODOS, type Store, type StoreStatus } from "@/lib/data";
import { useTodoStore } from "@/lib/store";
import { ArrowLeft, Download, Store as StoreIcon, MapPin, User, Package, Edit, X, Loader2, Flag, Calendar } from "lucide-react";
import jsPDF from "jspdf";

const STATUS_COLORS: Record<StoreStatus, string> = {
  "✅ Ouvert": "bg-green-100 text-green-700",
  "🚧 En cours": "bg-blue-100 text-blue-700",
  "🔍 En recherche cellule": "bg-yellow-100 text-yellow-700",
  "⏸️ Suspendu": "bg-orange-100 text-orange-700",
  "❌ Fermé": "bg-red-100 text-red-600",
  "FERMETURE A VENIR": "bg-red-50 text-red-500",
};

const PARTNERSHIP_COLORS: Record<string, string> = {
  "FRANCHISE": "bg-purple-100 text-purple-700",
  "MASTER FRANCHISE": "bg-indigo-100 text-indigo-700",
  "DISTRI LIGHT": "bg-teal-100 text-teal-700",
  "COMMISSION AFFILIATION": "bg-sky-100 text-sky-700",
};

function EditStoreModal({ store, onClose, onSave }: { store: Store; onClose: () => void; onSave: (s: Store) => void }) {
  const [form, setForm] = useState({ ...store });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const set = (f: keyof Store, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (form.codaRowId) {
        const res = await fetch("/api/coda/sync", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data.ok) { setResult(`Erreur Coda: ${data.error}`); setLoading(false); return; }
      }
      onSave(form);
      setResult("Sauvegardé !");
      setTimeout(onClose, 800);
    } catch (e) { setResult(String(e)); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Modifier le magasin</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        {result && <div className={`text-sm rounded-xl px-4 py-3 mb-4 ${result.startsWith("Erreur") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{result}</div>}
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-gray-700 mb-1 block">Nom du magasin *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-700 mb-1 block">Ville</label>
              <input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
            <div><label className="text-xs font-medium text-gray-700 mb-1 block">Code</label>
              <input value={form.code ?? ""} onChange={(e) => set("code", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-700 mb-1 block">Statut</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as StoreStatus)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                {(["✅ Ouvert","🚧 En cours","🔍 En recherche cellule","⏸️ Suspendu","❌ Fermé","FERMETURE A VENIR"] as StoreStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-gray-700 mb-1 block">Partenariat</label>
              <select value={form.partnership ?? ""} onChange={(e) => set("partnership", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                <option value="">—</option>
                {["FRANCHISE","MASTER FRANCHISE","DISTRI LIGHT","COMMISSION AFFILIATION"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-700 mb-1 block">Surface (m²)</label>
              <input value={form.surface ?? ""} onChange={(e) => set("surface", e.target.value)} type="number" placeholder="ex: 450" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
            <div><label className="text-xs font-medium text-gray-700 mb-1 block">Produit</label>
              <input value={form.product ?? ""} onChange={(e) => set("product", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
          </div>
          <div><label className="text-xs font-medium text-gray-700 mb-1 block">Représentant légal</label>
            <input value={form.rep ?? ""} onChange={(e) => set("rep", e.target.value)} placeholder="Nom du représentant" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
          <div><label className="text-xs font-medium text-gray-700 mb-1 block">Dénomination sociale</label>
            <input value={form.denom ?? ""} onChange={(e) => set("denom", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
          <div><label className="text-xs font-medium text-gray-700 mb-1 block">Adresse</label>
            <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" /></div>
          <div><label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
            <textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={handleSave} disabled={loading || !form.name.trim()}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            style={{ background: "#E40E20" }}>
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Sauvegarde…" : "Sauvegarder dans Coda"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StoreCard({ s, onEdit }: { s: Store; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm">{s.name}</h3>
          {s.city && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={10} />{s.city}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>{s.status}</span>
          <button onClick={onEdit} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-blue-50">
            <Edit size={13} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {s.partnership && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PARTNERSHIP_COLORS[s.partnership] ?? "bg-gray-100 text-gray-600"}`}>{s.partnership}</span>
        )}
        {s.product && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">{s.product}</span>}
        {s.surface && <span className="flex items-center gap-0.5"><Package size={10} />{s.surface} m²</span>}
        {s.code && <span className="font-mono text-[10px] text-gray-400">{s.code}</span>}
      </div>
      {s.rep && (
        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-500">
          <User size={11} className="shrink-0" />
          <span className="truncate">{s.rep}</span>
        </div>
      )}
      {s.denom && <div className="text-xs text-gray-400 mt-1 truncate">{s.denom}</div>}
    </div>
  );
}

function generatePDF(countryName: string, flag: string, stores: Store[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const navyR = 27, navyG = 46, navyB = 107;
  const orangeR = 244, orangeG = 121, orangeB = 32;

  // Header
  doc.setFillColor(navyR, navyG, navyB);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`ORCHESTRA — Rapport ${countryName}`, 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} · ${stores.length} point(s) de vente`, 15, 28);
  doc.setTextColor(orangeR, orangeG, orangeB);
  doc.text("Export International", 15, 36);

  // Summary
  const open = stores.filter((s) => s.status === "✅ Ouvert").length;
  const inProgress = stores.filter((s) => s.status === "🚧 En cours").length;
  const closing = stores.filter((s) => s.status === "FERMETURE A VENIR" || s.status === "❌ Fermé").length;

  doc.setFillColor(244, 246, 251);
  doc.rect(0, 45, 210, 25, "F");
  doc.setTextColor(27, 46, 107);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${open} ouverts`, 20, 57);
  doc.text(`${inProgress} en cours`, 75, 57);
  doc.text(`${closing} en fermeture`, 130, 57);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Magasins ouverts", 20, 63);
  doc.text("Ouvertures en cours", 75, 63);
  doc.text("Fermetures", 130, 63);

  // Stores table
  let y = 80;
  doc.setFillColor(navyR, navyG, navyB);
  doc.rect(10, y, 190, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("MAGASIN", 13, y + 5.5);
  doc.text("STATUT", 80, y + 5.5);
  doc.text("PARTENARIAT", 120, y + 5.5);
  doc.text("SURFACE", 175, y + 5.5);
  y += 10;

  stores.forEach((s, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 251 : 255);
    doc.rect(10, y, 190, 14, "F");
    doc.setTextColor(30, 30, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(s.name.substring(0, 35), 13, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 100);
    doc.text(s.city.substring(0, 25) || "", 13, y + 10);
    // Status
    const statusText = s.status.replace(/[^\w\s]/g, "").trim();
    doc.setTextColor(orangeR, orangeG, orangeB);
    doc.setFontSize(7);
    doc.text(statusText.substring(0, 20), 80, y + 7);
    doc.setTextColor(80, 80, 100);
    doc.text((s.partnership || "").substring(0, 22), 120, y + 7);
    doc.text(s.surface ? `${s.surface} m²` : "—", 175, y + 7);
    y += 14;
  });

  // Footer
  doc.setFillColor(navyR, navyG, navyB);
  doc.rect(0, 285, 210, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text("ORCHESTRA International Export — Document confidentiel", 15, 292);
  doc.text(`${new Date().getFullYear()}`, 195, 292);

  doc.save(`Orchestra_${countryName.replace(/\s/g, "_")}_rapport.pdf`);
}

export default function CountryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const country = getCountryById(id);
  const stores = country ? getStoresForCountry(country.codaKey) : [];
  const { todos } = useTodoStore();
  const countryTodos = todos.filter((t) => t.countryId === id);
  const [activeTab, setActiveTab] = useState<"stores" | "actions" | "notes">("stores");
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [localStores, setLocalStores] = useState<Store[]>(stores);

  if (!country) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Pays introuvable</p>
          <button onClick={() => router.push("/countries")} className="mt-3 text-blue-500 text-sm hover:underline">← Retour aux pays</button>
        </div>
      </div>
    );
  }

  const openStores = stores.filter((s) => s.status === "✅ Ouvert").length;
  const statusGroups = stores.reduce<Record<string, Store[]>>((acc, s) => {
    acc[s.status] = [...(acc[s.status] ?? []), s];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/countries")}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.flag}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{country.name}</h1>
              <p className="text-sm text-gray-500">{country.region} · {stores.length} magasin{stores.length > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => generatePDF(country.name, country.flag, stores)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
          style={{ background: "#1B2E6B" }}>
          <Download size={15} />
          Télécharger PDF
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <StoreIcon size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Total magasins</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stores.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Ouverts</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{openStores}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500">En cours</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stores.filter((s) => s.status === "🚧 En cours").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flag size={14} className="text-orange-400" />
            <span className="text-xs text-gray-500">Actions en cours</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{countryTodos.filter((t) => t.status !== "terminé").length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {(["stores", "actions", "notes"] as const).map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? "text-blue-700 border-b-2 border-blue-600 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "stores" ? `Magasins (${stores.length})` : tab === "actions" ? `Actions (${countryTodos.length})` : "Notes"}
          </button>
        ))}
      </div>

      {/* Stores tab */}
      {activeTab === "stores" && (
        <div className="space-y-4">
          {stores.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              <StoreIcon size={32} className="mx-auto mb-3 opacity-30" />
              <p>Aucun magasin enregistré pour ce pays</p>
            </div>
          ) : (
            Object.entries(statusGroups).map(([status, group]) => (
              <div key={status}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{status}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{group.length}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map((s) => <StoreCard key={s.id} s={s} onEdit={() => setEditingStore(s)} />)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Actions tab */}
      {activeTab === "actions" && (
        <div className="space-y-2">
          {countryTodos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              <p>Aucune action pour ce pays</p>
            </div>
          ) : (
            countryTodos.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm text-gray-800">{t.title}</div>
                  {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User size={11} />{t.assignee}</span>
                    {t.dueDate && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(t.dueDate).toLocaleDateString("fr-FR")}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  t.status === "terminé" ? "bg-green-100 text-green-700" :
                  t.status === "en_cours" ? "bg-blue-100 text-blue-700" :
                  t.status === "bloqué" ? "bg-red-100 text-red-600" :
                  "bg-gray-100 text-gray-600"
                }`}>{t.status.replace("_", " ")}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes tab */}
      {activeTab === "notes" && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          <p>Accédez aux notes liées à ce pays depuis l'onglet <span className="text-blue-500 cursor-pointer">Notes</span></p>
        </div>
      )}

      {/* Store edit modal */}
      {editingStore && (
        <EditStoreModal
          store={editingStore}
          onClose={() => setEditingStore(null)}
          onSave={(updated) => {
            setLocalStores((prev) => prev.map((s) => s.id === updated.id ? updated : s));
            setEditingStore(null);
          }}
        />
      )}
    </div>
  );
}
