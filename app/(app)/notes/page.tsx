"use client";
import { useState } from "react";
import { COUNTRIES } from "@/lib/data";
import { useNoteStore } from "@/lib/store";
import { useAuthStore } from "@/lib/store";
import { Plus, Pin, Search, Tag, Calendar, Trash2, X, Save } from "lucide-react";

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNoteStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const current = notes.find((n) => n.id === selectedId);

  const startEdit = () => {
    if (!current) return;
    setEditTitle(current.title);
    setEditContent(current.content);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!selectedId) return;
    updateNote(selectedId, { title: editTitle, content: editContent });
    setEditing(false);
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addNote({
      title: newTitle,
      content: newContent,
      author: user?.name ?? "Laura Fernandez",
      pinned: false,
    });
    setNewTitle("");
    setNewContent("");
    setShowNew(false);
    // Select the new note (it's inserted at front)
    setTimeout(() => {
      const latestId = useNoteStore.getState().notes[0]?.id;
      if (latestId) setSelectedId(latestId);
    }, 50);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none" />
          </div>
          <button onClick={() => setShowNew(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: "#E40E20" }}>
            <Plus size={16} />
          </button>
        </div>

        {/* Pinned */}
        {filtered.filter((n) => n.pinned).length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1.5">Épinglées</p>
            <div className="space-y-1">
              {filtered.filter((n) => n.pinned).map((n) => (
                <button key={n.id} onClick={() => { setSelectedId(n.id); setEditing(false); }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${selectedId === n.id ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-start gap-2">
                    <Pin size={11} className="text-orange-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{n.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{n.content.slice(0, 60)}…</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1.5">Toutes les notes</p>
          <div className="space-y-1">
            {filtered.filter((n) => !n.pinned).map((n) => {
              const country = n.countryId ? COUNTRIES.find((c) => c.id === n.countryId) : null;
              return (
                <button key={n.id} onClick={() => { setSelectedId(n.id); setEditing(false); }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${selectedId === n.id ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-start gap-2">
                    {country && <span className="text-sm mt-0.5 shrink-0">{country.flag}</span>}
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{n.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.content.slice(0, 60)}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{new Date(n.updatedAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* New note modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle note</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre de la note"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 font-medium" />
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={6}
                placeholder="Contenu de la note…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()}
                className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50"
                style={{ background: "#E40E20" }}>Créer la note</button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 min-w-0 flex flex-col overflow-hidden">
        {current ? (
          <>
            <div className="flex items-start justify-between mb-4 gap-3 shrink-0">
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 truncate">{current.title}</h2>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>{current.author}</span>
                  <Calendar size={11} />
                  <span>{new Date(current.updatedAt).toLocaleDateString("fr-FR")}</span>
                  {current.tags?.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                      <Tag size={9} />{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => togglePin(current.id)}
                  className={`text-xs px-3 py-1.5 border rounded-lg transition-colors ${current.pinned ? "border-orange-200 bg-orange-50 text-orange-500" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <Pin size={13} />
                </button>
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
                    <button onClick={saveEdit}
                      className="text-xs px-3 py-1.5 rounded-lg text-white flex items-center gap-1"
                      style={{ background: "#E40E20" }}>
                      <Save size={12} /> Enregistrer
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={startEdit}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Modifier</button>
                    <button onClick={() => { deleteNote(current.id); setSelectedId(notes.find((n) => n.id !== current.id)?.id ?? null); }}
                      className="text-xs px-3 py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {editing ? (
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full text-sm text-gray-700 leading-relaxed focus:outline-none resize-none"
                  style={{ minHeight: "300px" }} />
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {current.content}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Plus size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Sélectionnez une note ou créez-en une nouvelle</p>
              <button onClick={() => setShowNew(true)}
                className="mt-3 text-sm px-4 py-2 rounded-lg text-white font-medium"
                style={{ background: "#E40E20" }}>
                Nouvelle note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
