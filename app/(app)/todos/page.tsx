"use client";
import { useState } from "react";
import { COUNTRIES, type Todo, type TodoStatus, type TodoPriority } from "@/lib/data";
import { useTodoStore } from "@/lib/store";
import { Plus, Search, Calendar, User, Flag, Trash2, X, RefreshCw, Tag, Edit2, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<TodoStatus, string> = {
  à_faire: "Not started",
  en_cours: "In progress",
  terminé: "Done",
  bloqué: "Blocked",
};
const STATUS_LABELS_FR: Record<TodoStatus, string> = {
  à_faire: "À faire",
  en_cours: "En cours",
  terminé: "Terminé",
  bloqué: "Bloqué",
};
const STATUS_COLORS: Record<TodoStatus, string> = {
  à_faire: "bg-gray-100 text-gray-600",
  en_cours: "bg-blue-100 text-blue-700",
  terminé: "bg-green-100 text-green-700",
  bloqué: "bg-red-100 text-red-600",
};
const PRIORITY_COLORS: Record<TodoPriority, string> = {
  haute: "text-red-500", moyenne: "text-orange-400", basse: "text-gray-400",
};
const PRIORITY_BG: Record<TodoPriority, string> = {
  haute: "bg-red-50 text-red-600 border-red-200",
  moyenne: "bg-orange-50 text-orange-600 border-orange-200",
  basse: "bg-gray-50 text-gray-500 border-gray-200",
};

const CODA_CATEGORIES = [
  "⚖️ Juridique",
  "🏗️ Travaux / Supply",
  "📣 Marketing / Com",
];

// ── Edit / Detail Panel ────────────────────────────────────────────────────────
function TodoDetailPanel({ todo, onClose, onSave, onDelete }: {
  todo: Todo;
  onClose: () => void;
  onSave: (patch: Partial<Todo>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({ ...todo });
  const [isNewCat, setIsNewCat] = useState(false);
  const [newCat, setNewCat] = useState("");

  const allCategories = Array.from(new Set([...CODA_CATEGORIES]));
  const set = (field: keyof Todo, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const effectiveCategory = isNewCat ? newCat : form.category;

  const handleSave = () => {
    onSave({ ...form, category: effectiveCategory });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />
      {/* Panel */}
      <div className="w-[480px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Modifier la tâche</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Titre *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Notes, contexte, liens utiles…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Statut</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as TodoStatus)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer"
              >
                {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Priorité</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as TodoPriority)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="haute">🔴 Haute</option>
                <option value="moyenne">🟠 Moyenne</option>
                <option value="basse">⚪ Basse</option>
              </select>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Pays associé</label>
            <select
              value={form.countryId ?? ""}
              onChange={(e) => set("countryId", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="">— Aucun pays —</option>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</label>
              <button
                type="button"
                onClick={() => { setIsNewCat(!isNewCat); setNewCat(""); }}
                className="text-[10px] text-blue-500 hover:underline"
              >
                {isNewCat ? "← Existante" : "+ Nouvelle"}
              </button>
            </div>
            {isNewCat ? (
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="ex: 🤝 Partenariats"
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            ) : (
              <select
                value={form.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="">— Aucune catégorie —</option>
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {/* 2-col: assignee + due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Assigné à</label>
              <input
                value={form.assignee}
                onChange={(e) => set("assignee", e.target.value)}
                placeholder="Nom du responsable"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Échéance</label>
              <input
                type="date"
                value={form.dueDate ?? ""}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Créée le {new Date(todo.createdAt).toLocaleDateString("fr-FR")}</p>
            <p>Modifiée le {new Date(todo.updatedAt).toLocaleDateString("fr-FR")}</p>
            {todo.codaRowId && <p className="font-mono text-[10px]">Coda ID: {todo.codaRowId}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={13} /> Supprimer
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim()}
              className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
              style={{ background: "#E40E20" }}
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Todo Modal ─────────────────────────────────────────────────────────────
interface NewTodoForm {
  title: string; description: string; countryId: string; status: TodoStatus;
  priority: TodoPriority; dueDate: string; assignee: string; category: string; newCategory: string;
}

function AddTodoModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: NewTodoForm) => void }) {
  const [form, setForm] = useState<NewTodoForm>({
    title: "", description: "", countryId: "", status: "à_faire", priority: "moyenne",
    dueDate: "", assignee: "Laura Fernandez", category: "", newCategory: "",
  });
  const [isNewCat, setIsNewCat] = useState(false);
  const setField = (field: keyof NewTodoForm, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const effectiveCategory = isNewCat ? form.newCategory : form.category;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle action</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Titre *</label>
            <input value={form.title} onChange={(e) => setField("title", e.target.value)}
              placeholder="ex: Relancer partenaire pour signature contrat"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">Catégorie</label>
              <button type="button" onClick={() => { setIsNewCat(!isNewCat); setField("newCategory", ""); }}
                className="text-[10px] text-blue-500 hover:underline">{isNewCat ? "← Existante" : "+ Nouvelle"}</button>
            </div>
            {isNewCat ? (
              <input value={form.newCategory} onChange={(e) => setField("newCategory", e.target.value)}
                placeholder="ex: 🤝 Partenariats" autoFocus
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
            ) : (
              <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                <option value="">— Aucune catégorie —</option>
                {CODA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Pays associé</label>
            <select value={form.countryId} onChange={(e) => setField("countryId", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
              <option value="">— Aucun pays —</option>
              {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Statut</label>
              <select value={form.status} onChange={(e) => setField("status", e.target.value as TodoStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Priorité</label>
              <select value={form.priority} onChange={(e) => setField("priority", e.target.value as TodoPriority)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
                <option value="haute">🔴 Haute</option>
                <option value="moyenne">🟠 Moyenne</option>
                <option value="basse">⚪ Basse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Assigné à</label>
              <input value={form.assignee} onChange={(e) => setField("assignee", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Échéance</label>
              <input type="date" value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
          <button disabled={!form.title.trim()} onClick={() => { if (form.title.trim()) { onAdd({ ...form, category: effectiveCategory }); onClose(); } }}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50" style={{ background: "#E40E20" }}>
            Ajouter dans Coda
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Todo Card ──────────────────────────────────────────────────────────────────
function TodoCard({ t, onToggle, onEdit }: { t: Todo; onToggle: () => void; onEdit: () => void }) {
  const country = COUNTRIES.find((c) => c.id === t.countryId);
  const isOverdue = t.dueDate && t.status !== "terminé" && new Date(t.dueDate) < new Date();
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-sm transition-all group cursor-pointer hover:border-blue-100"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={t.status === "terminé"}
            onChange={(e) => { e.stopPropagation(); onToggle(); }}
            className="rounded mt-0.5 cursor-pointer w-4 h-4 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {country && <span className="text-base shrink-0">{country.flag}</span>}
              <h3 className={`text-sm font-medium truncate ${t.status === "terminé" ? "line-through text-gray-400" : "text-gray-800"}`}>
                {t.title}
              </h3>
            </div>
            {t.description && <p className="text-xs text-gray-400 mb-1.5 line-clamp-1">{t.description}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <User size={10} />{t.assignee}
              </div>
              {t.category && (
                <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag size={9} />{t.category}
                </span>
              )}
              {t.dueDate && (
                <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                  <Calendar size={10} />
                  {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                  {isOverdue && " ⚠"}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[t.status]}`}>
            {STATUS_LABELS[t.status]}
          </span>
          <div className="flex items-center gap-1.5">
            <Flag size={12} className={PRIORITY_COLORS[t.priority]} />
            <ChevronRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TodosPage() {
  const { todos, addTodo, updateTodo, deleteTodo, syncFromCoda, isSyncing, lastSync } = useTodoStore();
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState<TodoPriority | "all">("all");
  const [groupBy, setGroupBy] = useState<"country" | "status" | "priority" | "category">("status");
  const [showAdd, setShowAdd] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const allCategories = Array.from(new Set([
    ...CODA_CATEGORIES,
    ...todos.map((t) => t.category).filter(Boolean) as string[],
  ]));

  const filtered = todos.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "all" || t.countryId === filterCountry;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    const matchPrio = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchCountry && matchStatus && matchCat && matchPrio;
  });

  const grouped: Record<string, Todo[]> = {};
  if (groupBy === "country") {
    COUNTRIES.forEach((c) => {
      const items = filtered.filter((t) => t.countryId === c.id);
      if (items.length) grouped[c.id] = items;
    });
    const noCountry = filtered.filter((t) => !t.countryId);
    if (noCountry.length) grouped["__none"] = noCountry;
  } else if (groupBy === "status") {
    (["en_cours", "à_faire", "bloqué", "terminé"] as TodoStatus[]).forEach((s) => {
      const items = filtered.filter((t) => t.status === s);
      if (items.length) grouped[s] = items;
    });
  } else if (groupBy === "category") {
    allCategories.forEach((cat) => {
      const items = filtered.filter((t) => t.category === cat);
      if (items.length) grouped[cat] = items;
    });
    const noCat = filtered.filter((t) => !t.category);
    if (noCat.length) grouped["__nocat"] = noCat;
  } else {
    (["haute", "moyenne", "basse"] as const).forEach((p) => {
      const items = filtered.filter((t) => t.priority === p);
      if (items.length) grouped[p] = items;
    });
  }

  return (
    <div className="space-y-6">
      {/* Sync bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${lastSync ? "bg-green-400" : "bg-amber-400"}`} />
          {lastSync
            ? `Sync Coda : ${new Date(lastSync).toLocaleString("fr-FR")}`
            : "Données locales — synchronisez pour charger depuis Coda (Planning GANTT)"}
        </div>
        <button onClick={syncFromCoda} disabled={isSyncing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-60">
          <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Sync…" : "Synchroniser Coda"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(["à_faire", "en_cours", "bloqué", "terminé"] as TodoStatus[]).map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`bg-white rounded-xl p-4 border text-left transition-all ${filterStatus === s ? "border-blue-300 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>
            <div className={`text-xs inline-block px-2 py-0.5 rounded-full mb-1.5 font-medium ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</div>
            <div className="text-2xl font-bold text-gray-800">{todos.filter((t) => t.status === s).length}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une action…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none" />
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
          <option value="all">Tous les pays</option>
          {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
          <option value="all">Toutes catégories</option>
          {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TodoPriority | "all")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer">
          <option value="all">Toutes priorités</option>
          <option value="haute">🔴 Haute</option>
          <option value="moyenne">🟠 Moyenne</option>
          <option value="basse">⚪ Basse</option>
        </select>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
          {(["status", "category", "country", "priority"] as const).map((g, i) => (
            <button key={g} onClick={() => setGroupBy(g)}
              className={`px-3 py-2 ${groupBy === g ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"} ${i > 0 ? "border-l border-gray-200" : ""}`}>
              {g === "country" ? "Pays" : g === "status" ? "Statut" : g === "category" ? "Catégorie" : "Priorité"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium"
          style={{ background: "#E40E20" }}>
          <Plus size={15} /> Nouvelle action
        </button>
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} action{filtered.length > 1 ? "s" : ""} · Cliquez sur une tâche pour la modifier
      </p>

      {/* Grouped todos */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([key, items]) => {
          const country = groupBy === "country" ? COUNTRIES.find((c) => c.id === key) : null;
          const groupLabel =
            key === "__none" ? "Sans pays"
            : key === "__nocat" ? "Sans catégorie"
            : country ? `${country.flag} ${country.name}`
            : groupBy === "status" ? STATUS_LABELS[key as TodoStatus]
            : groupBy === "category" ? key
            : key === "haute" ? "🔴 Priorité haute" : key === "moyenne" ? "🟠 Priorité moyenne" : "⚪ Priorité basse";
          return (
            <div key={key}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-semibold text-gray-700 text-sm">{groupLabel}</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <TodoCard
                    key={t.id}
                    t={t}
                    onToggle={() => updateTodo(t.id, { status: t.status === "terminé" ? "à_faire" : "terminé" })}
                    onEdit={() => setEditingTodo(t)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <p>Aucune action trouvée</p>
          </div>
        )}
      </div>

      {showAdd && (
        <AddTodoModal
          onClose={() => setShowAdd(false)}
          onAdd={(form) => {
            addTodo({
              title: form.title,
              description: form.description || undefined,
              countryId: form.countryId || undefined,
              status: form.status,
              priority: form.priority,
              dueDate: form.dueDate || undefined,
              assignee: form.assignee,
              category: form.category || undefined,
            });
            setShowAdd(false);
          }}
        />
      )}

      {editingTodo && (
        <TodoDetailPanel
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSave={(patch) => updateTodo(editingTodo.id, patch)}
          onDelete={() => deleteTodo(editingTodo.id)}
        />
      )}
    </div>
  );
}
