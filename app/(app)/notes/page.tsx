"use client";
import { useState } from "react";
import { NOTES, COUNTRIES } from "@/lib/data";
import { Plus, Pin, Search, Tag, Calendar } from "lucide-react";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(NOTES[0]?.id ?? null);
  const [newNote, setNewNote] = useState(false);

  const filtered = NOTES.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const current = NOTES.find((n) => n.id === selected);

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar list */}
      <div className="w-72 shrink-0 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none text-sm" />
          </div>
          <button onClick={() => setNewNote(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: "#F47920" }}>
            <Plus size={16} />
          </button>
        </div>

        {/* Pinned */}
        {filtered.filter((n) => n.pinned).length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1.5">Épinglées</p>
            <div className="space-y-1">
              {filtered.filter((n) => n.pinned).map((n) => (
                <button key={n.id} onClick={() => setSelected(n.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${selected === n.id ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100 hover:border-gray-200"}`}>
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
                <button key={n.id} onClick={() => setSelected(n.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${selected === n.id ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-start gap-2">
                    {country && <span className="text-sm mt-0.5 shrink-0">{country.flag}</span>}
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{n.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{n.content.slice(0, 60)}…</p>
                      <p className="text-[10px] text-gray-300 mt-1">{new Date(n.updatedAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Note editor */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 min-w-0">
        {current ? (
          <div className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{current.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400">
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
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Modifier</button>
                <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: "#F47920" }}>Enregistrer</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {current.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Plus size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Sélectionnez une note ou créez-en une nouvelle</p>
              <button onClick={() => setNewNote(true)}
                className="mt-3 text-sm px-4 py-2 rounded-lg text-white font-medium"
                style={{ background: "#F47920" }}>
                Nouvelle note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
