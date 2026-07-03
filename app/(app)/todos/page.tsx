"use client";
import { useState, useRef } from "react";
import { COUNTRIES, type Todo, type TodoStatus, type TodoPriority } from "@/lib/data";
import { useTodoStore } from "@/lib/store";
import { Plus, Search, Calendar, User, Flag, Trash2, X, RefreshCw, Tag, Check } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const KANBAN_COLS: { status: TodoStatus; label: string; headerColor: string; dot: string }[] = [
  { status: "à_faire",  label: "À faire",   headerColor: "bg-gray-100 text-gray-700",   dot: "bg-gray-400" },
  { status: "en_cours", label: "En cours",  headerColor: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  { status: "bloqué",   label: "Stand by",  headerColor: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
  { status: "terminé",  label: "Terminé",   headerColor: "bg-green-100 text-green-700", dot: "bg-green-500" },
];

const PRIORITY_ORDER: Record<TodoPriority, number> = { haute: 0, moyenne: 1, basse: 2 };

const PRIORITY_BADGE: Record<TodoPriority, string> = {
  haute:   "bg-red-50 text-red-600 border border-red-200",
  moyenne: "bg-orange-50 text-orange-500 border border-orange-200",
  basse:   "bg-gray-50 text-gray-400 border border-gray-200",
};

const PRIORITY_LABEL: Record<TodoPriority, string> = {
  haute: "🔴 Haute", moyenne: "🟠 Moyenne", basse: "⚪ Basse",
};

const CODA_CATEGORIES = ["⚖️ Juridique", "🏗️ Travaux / Supply", "📣 Marketing / Com"];

// ── Edit Panel ─────────────────────────────────────────────────────────────────
function TodoDetailPanel({ todo, onClose, onSave, onDelete }: {
  todo: Todo; onClose: () => void;
  onSave: (patch: Partial<Todo>) => void; onDelete: () => void;
}) {
  const [form, setForm] = useState({ ...todo });
  const [isNewCat, setIsNewCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const set = (field: keyof Todo, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const effectiveCategory = isNewCat ? newCat : form.category;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[480px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Modifier la tâche</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Titre *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
              rows={3} placeholder="Notes, contexte, liens utiles…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Statut</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as TodoStatus)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer">
                {KANBAN_COLS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Priorité</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value as TodoPriority)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer">
                <option value="haute">🔴 Haute</option>
                <option value="moyenne">🟠 Moyenne</option>
                <option value="basse">⚪ Basse</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Pays associé</label>
            <select value={form.countryId ?? ""} onChange={(e) => set("countryId", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer">
              <option value="">— Aucun pays —</option>
              {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</label>
              <button type="button" onClick={() => { setIsNewCat(!isNewCat); setNewCat(""); }}
                className="text-[10px] text-blue-500 hover:underline">{isNewCat ? "← Existante" : "+ Nouvelle"}</button>
            </div>
            {isNewCat ? (
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="ex: 🤝 Partenariats" autoFocus
                className="w-full px-3 py-2.5 text-sm border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100" />
            ) : (
              <select value={form.category ?? ""} onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer">
                <option value="">— Aucune catégorie —</option>
                {CODA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Assigné à</label>
              <input value={form.assignee} onChange={(e) => set("assignee", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Échéance</label>
              <input type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Créée le {new Date(todo.createdAt).toLocaleDateString("fr-FR")}</p>
            {todo.codaRowId && <p className="font-mono text-[10px]">Coda ID: {todo.codaRowId}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={() => { onDelete(); onClose(); }}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
            <Trash2 size={13} /> Supprimer
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100">Annuler</button>
            <button onClick={() => { onSave({ ...form, category: effectiveCategory }); onClose(); }}
              disabled={!form.title.trim()}
              className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
              style={{ background: "#E40E20" }}>Sauvegarder</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Modal ──────────────────────────────────────────────────────────────────
interface NewTodoForm {
  title: string; description: string; countryId: string; status: TodoStatus;
  priority: TodoPriority; dueDate: string; assignee: string; category: string; newCategory: string;
}

function AddTodoModal({ onClose, onAdd, defaultStatus }: {
  onClose: () => void;
  onAdd: (data: NewTodoForm) => void;
  defaultStatus?: TodoStatus;
}) {
  const [form, setForm] = useState<NewTodoForm>({
    title: "", description: "", countryId: "", status: defaultStatus ?? "à_faire", priority: "moyenne",
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
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Titre *</label>
            <input value={form.title} onChange={(e) => setField("title", e.target.value)} autoFocus
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
                placeholder="ex: 🤝 Partenariats"
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
                {KANBAN_COLS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
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
          <button disabled={!form.title.trim()}
            onClick={() => { if (form.title.trim()) { onAdd({ ...form, category: effectiveCategory }); onClose(); } }}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50" style={{ background: "#E40E20" }}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kanban Card ────────────────────────────────────────────────────────────────
function KanbanCard({
  t, onToggle, onEdit, onDragStart, onDragEnd,
}: {
  t: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const country = COUNTRIES.find((c) => c.id === t.countryId);
  const isOverdue = t.dueDate && t.status !== "terminé" && new Date(t.dueDate) < new Date();
  const done = t.status === "terminé";

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(t.id); }}
      onDragEnd={onDragEnd}
      onClick={onEdit}
      className={`bg-white rounded-xl border p-3 cursor-pointer hover:shadow-sm transition-all group select-none ${done ? "border-gray-100 opacity-60" : "border-gray-200 hover:border-blue-200"}`}
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[t.priority]}`}>
          {PRIORITY_LABEL[t.priority]}
        </span>
        {t.category && (
          <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Tag size={8} />{t.category.split(" ").slice(0, 2).join(" ")}
          </span>
        )}
      </div>

      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}
        >
          {done && <Check size={10} className="text-white" />}
        </button>
        <p className={`text-sm font-medium leading-snug ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
          {t.title}
        </p>
      </div>

      {t.description && (
        <p className="text-[11px] text-gray-400 mb-2 line-clamp-2 pl-6">{t.description}</p>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-2 pl-6">
        <div className="flex items-center gap-2 flex-wrap">
          {country && <span className="text-base leading-none" title={country.name}>{country.flag}</span>}
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
            <User size={9} />{t.assignee.split(" ")[0]}
          </span>
        </div>
        {t.dueDate && (
          <span className={`text-[10px] flex items-center gap-0.5 font-medium ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
            <Calendar size={9} />
            {new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
            {isOverdue && " ⚠"}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Kanban Column ──────────────────────────────────────────────────────────────
function KanbanColumn({
  col, items, onToggle, onEdit, onDragStart, onDragEnd, onDrop, isDragOver, onAddHere,
}: {
  col: typeof KANBAN_COLS[number];
  items: Todo[];
  onToggle: (id: string) => void;
  onEdit: (t: Todo) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (status: TodoStatus) => void;
  isDragOver: boolean;
  onAddHere: () => void;
}) {
  return (
    <div
      className={`flex flex-col min-h-[200px] rounded-2xl p-3 border-2 transition-all ${isDragOver ? "border-blue-400 bg-blue-50/50" : "border-transparent bg-gray-50"}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(col.status); }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
          <span className="text-sm font-semibold text-gray-700">{col.label}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${col.headerColor}`}>{items.length}</span>
        </div>
        <button
          onClick={onAddHere}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition-all hover:shadow-sm"
          title="Ajouter ici"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-2 flex-1">
        {items.map((t) => (
          <KanbanCard
            key={t.id}
            t={t}
            onToggle={() => onToggle(t.id)}
            onEdit={() => onEdit(t)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {items.length === 0 && (
          <div className={`text-xs text-center py-6 text-gray-300 border-2 border-dashed rounded-xl transition-all ${isDragOver ? "border-blue-300" : "border-gray-200"}`}>
            {isDragOver ? "Déposer ici" : "Aucune tâche"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TodosPage() {
  const { todos, addTodo, updateTodo, deleteTodo, syncFromCoda, isSyncing, lastSync } = useTodoStore();
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState<TodoPriority | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<TodoStatus>("à_faire");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Drag state
  const draggingId = useRef<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TodoStatus | null>(null);

  const allCategories = Array.from(new Set([
    ...CODA_CATEGORIES,
    ...todos.map((t) => t.category).filter(Boolean) as string[],
  ]));

  const filtered = todos.filter((t) => {
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "all" || t.countryId === filterCountry;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    const matchPrio = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchCountry && matchCat && matchPrio;
  });

  // Group + sort by priority within each column
  const byStatus = (status: TodoStatus) =>
    filtered.filter((t) => t.status === status)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const handleDrop = (targetStatus: TodoStatus) => {
    const id = draggingId.current;
    if (!id) return;
    const todo = todos.find((t) => t.id === id);
    if (todo && todo.status !== targetStatus) {
      updateTodo(id, { status: targetStatus });
    }
    draggingId.current = null;
    setDragOverCol(null);
  };

  // Stats
  const totalOpen = todos.filter((t) => t.status !== "terminé").length;
  const overdue = todos.filter((t) => t.dueDate && t.status !== "terminé" && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="space-y-5">
      {/* Sync bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${lastSync ? "bg-green-400" : "bg-amber-400"}`} />
          {lastSync
            ? `Sync Coda : ${new Date(lastSync).toLocaleString("fr-FR")}`
            : "Données locales — synchronisez pour charger depuis Coda"}
          {overdue > 0 && (
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
              ⚠ {overdue} en retard
            </span>
          )}
        </div>
        <button onClick={syncFromCoda} disabled={isSyncing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-60">
          <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Sync…" : "Synchroniser Coda"}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {KANBAN_COLS.map((col) => {
          const count = todos.filter((t) => t.status === col.status).length;
          return (
            <div key={col.status} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-xs text-gray-500 font-medium">{col.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{count}</div>
            </div>
          );
        })}
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
        <button onClick={() => { setAddDefaultStatus("à_faire"); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium"
          style={{ background: "#E40E20" }}>
          <Plus size={15} /> Nouvelle action
        </button>
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} action{filtered.length > 1 ? "s" : ""} · Glissez-déposez pour changer de statut · Cliquez pour modifier
      </p>

      {/* Kanban board */}
      <div className="grid grid-cols-4 gap-4">
        {KANBAN_COLS.map((col) => (
          <KanbanColumn
            key={col.status}
            col={col}
            items={byStatus(col.status)}
            onToggle={(id) => {
              const t = todos.find((x) => x.id === id);
              if (t) updateTodo(id, { status: t.status === "terminé" ? "à_faire" : "terminé" });
            }}
            onEdit={(t) => setEditingTodo(t)}
            onDragStart={(id) => { draggingId.current = id; }}
            onDragEnd={() => { draggingId.current = null; setDragOverCol(null); }}
            onDrop={handleDrop}
            isDragOver={dragOverCol === col.status}
            onAddHere={() => { setAddDefaultStatus(col.status); setShowAdd(true); }}
          />
        ))}
      </div>

      {/* Drag over tracking on column hover */}
      <div
        className="hidden"
        onDragOver={(e) => {
          const el = e.target as HTMLElement;
          const col = el.closest("[data-kanban-col]");
          const s = col?.getAttribute("data-kanban-col") as TodoStatus | null;
          if (s) setDragOverCol(s);
        }}
      />

      {showAdd && (
        <AddTodoModal
          onClose={() => setShowAdd(false)}
          defaultStatus={addDefaultStatus}
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
