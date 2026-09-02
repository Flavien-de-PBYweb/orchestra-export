"use client";
import { useState } from "react";
import { useTodoStore } from "@/lib/store";
import { Plus, Search, RefreshCw, Check, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import type { TodoPriority } from "@/lib/data";

const PRIORITY_CFG: Record<string, { label: string; dot: string; badge: string; codaLabel: string }> = {
  haute:   { label: "P1", dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700 border-orange-300", codaLabel: "P1" },
  moyenne: { label: "P2", dot: "bg-green-400",  badge: "bg-green-100 text-green-700 border-green-300",   codaLabel: "P2" },
  basse:   { label: "P3", dot: "bg-blue-300",   badge: "bg-blue-50 text-blue-500 border-blue-200",       codaLabel: "P3" },
};

function AddTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (title: string, priority: TodoPriority) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("moyenne");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle tâche</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Titre *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
              placeholder="ex: Relancer partenaire Mongolie"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Priorité</label>
            <div className="flex gap-2">
              {(["haute", "moyenne", "basse"] as TodoPriority[]).map((p) => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${priority === p ? `${PRIORITY_CFG[p].badge} border-current ring-2 ring-current/20` : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                  {PRIORITY_CFG[p].codaLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
          <button disabled={!title.trim()} onClick={() => { if (title.trim()) { onAdd(title.trim(), priority); onClose(); } }}
            className="px-5 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50"
            style={{ background: "#7C3AED" }}>
            + Ajouter la tâche
          </button>
        </div>
      </div>
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete, isExpanded, onToggleExpand }: {
  todo: import("@/lib/data").Todo;
  onToggle: () => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const done = todo.status === "terminé";
  const cfg = PRIORITY_CFG[todo.priority] ?? PRIORITY_CFG.moyenne;
  return (
    <div className={`border-b border-gray-100 last:border-0 transition-colors ${done ? "bg-gray-50/50" : "hover:bg-gray-50/40"}`}>
      <div className="flex items-center gap-4 px-5 py-3.5">
        {/* Done checkbox */}
        <button onClick={onToggle}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}>
          {done && <Check size={11} className="text-white" />}
        </button>

        {/* Title */}
        <span className={`flex-1 text-sm ${done ? "line-through text-gray-400" : "text-gray-800"}`}>{todo.title}</span>

        {/* Priority badge */}
        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${cfg.badge}`}>{cfg.codaLabel}</span>

        {/* Expand toggle */}
        <button onClick={onToggleExpand} className="text-gray-300 hover:text-gray-500 shrink-0">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-14 pb-3 flex items-center gap-3">
          <button onClick={onDelete}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
            <Trash2 size={12} /> Supprimer
          </button>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-[11px] text-gray-400">
            {todo.codaRowId ? "Synchro Coda" : "Local uniquement"}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TodosPage() {
  const { todos, addTodo, updateTodo, deleteTodo, syncFromCoda, isSyncing, lastSync } = useTodoStore();
  const [tab, setTab] = useState<"open" | "done">("open");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<TodoPriority | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = todos.filter((t) => {
    const isDone = t.status === "terminé";
    if (tab === "open" && isDone) return false;
    if (tab === "done" && !isDone) return false;
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => {
    const order: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
  });

  const openCount = todos.filter((t) => t.status !== "terminé").length;
  const doneCount = todos.filter((t) => t.status === "terminé").length;

  const handleAdd = (title: string, priority: TodoPriority) => {
    addTodo({ title, priority, status: "à_faire", assignee: "", category: undefined });
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">✅</span> TO DO
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Plan d'actions · synchronisé avec Coda</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={syncFromCoda} disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-60 shadow-sm">
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Sync…" : "Synchroniser Coda"}
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-sm px-4 py-2 text-white rounded-xl font-medium shadow-sm"
            style={{ background: "#7C3AED" }}>
            <Plus size={15} /> Add task
          </button>
        </div>
      </div>

      {/* Sync status */}
      {!lastSync && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-amber-700">
          <span>ℹ️</span>
          <span>Feel the satisfaction of checking off boxes as you get things done. <button onClick={syncFromCoda} className="underline font-medium">Synchroniser Coda →</button></span>
        </div>
      )}

      {/* To-do list card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">To-do list</h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…"
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none w-40" />
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 text-white rounded-lg font-medium"
              style={{ background: "#7C3AED" }}>
              <Plus size={14} /> Add task
            </button>
          </div>
        </div>

        {/* Tabs + Priority filter */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {[
              { key: "open", label: "Open", count: openCount },
              { key: "done", label: "Done", count: doneCount },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setTab(key as "open" | "done")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                <span className="text-base">{key === "open" ? "☰✓" : "☰✓"}</span>
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? "bg-white text-gray-600" : "text-gray-300"}`}>{count}</span>
              </button>
            ))}
          </div>
          {/* Priority chips */}
          <div className="flex items-center gap-1">
            <button onClick={() => setFilterPriority("all")}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filterPriority === "all" ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
              Tous
            </button>
            {(["haute", "moyenne", "basse"] as TodoPriority[]).map((p) => (
              <button key={p} onClick={() => setFilterPriority(filterPriority === p ? "all" : p)}
                className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-all ${filterPriority === p ? `${PRIORITY_CFG[p].badge} ring-1 ring-current/30` : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                {PRIORITY_CFG[p].codaLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_5rem_2rem] gap-4 px-5 py-2.5 text-xs font-medium text-gray-400 bg-gray-50/50 border-b border-gray-100">
          <span>Done</span>
          <span className="flex items-center gap-1">🔖 Task</span>
          <span>Priorité</span>
          <span />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            {tab === "done" ? "Aucune tâche terminée" : "Aucune tâche en cours ✅"}
          </div>
        ) : (
          filtered.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              onToggle={() => updateTodo(t.id, { status: t.status === "terminé" ? "à_faire" : "terminé" })}
              onDelete={() => handleDelete(t.id)}
              isExpanded={expandedId === t.id}
              onToggleExpand={() => setExpandedId(expandedId === t.id ? null : t.id)}
            />
          ))
        )}

        {/* Add row inline */}
        {tab === "open" && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 w-full transition-colors">
            <Plus size={14} /> Add a task
          </button>
        )}
      </div>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
