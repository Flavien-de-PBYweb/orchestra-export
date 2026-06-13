"use client";
import { useState } from "react";
import { MEETINGS, COUNTRIES } from "@/lib/data";
import { Video, Clock, Users, ChevronDown, ChevronRight, ExternalLink, Zap } from "lucide-react";

export default function MeetingsPage() {
  const [expanded, setExpanded] = useState<string | null>(MEETINGS[0]?.id ?? null);

  return (
    <div className="space-y-6">
      {/* Fireflies banner */}
      <div className="rounded-2xl p-4 border flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #7C3AED10, #7C3AED05)", borderColor: "#7C3AED30" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-600">
          <Zap size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">Fireflies.ai</h3>
          <p className="text-xs text-gray-500">Transcription automatique activée · Synchronisation des comptes individuels · {MEETINGS.length} réunions disponibles</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-600 font-medium">Connecté</span>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Mes réunions</button>
        <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Configurer</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Meeting list */}
        <div className="col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm px-1">Réunions récentes</h2>
          {MEETINGS.map((m) => {
            const countries = (m.countryIds ?? []).map((id) => COUNTRIES.find((c) => c.id === id)).filter(Boolean);
            return (
              <button key={m.id} onClick={() => setExpanded(m.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${expanded === m.id ? "border-blue-300 bg-blue-50/30 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Video size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 leading-tight mb-1">{m.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={10} />
                      <span>{m.duration} min</span>
                      <span>·</span>
                      <span>{new Date(m.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {countries.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {countries.map((c) => c && <span key={c.id} className="text-base">{c.flag}</span>)}
                      </div>
                    )}
                  </div>
                  {expanded === m.id
                    ? <ChevronDown size={14} className="text-gray-400 mt-1 shrink-0" />
                    : <ChevronRight size={14} className="text-gray-400 mt-1 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Meeting detail */}
        <div className="col-span-2">
          {MEETINGS.filter((m) => m.id === expanded).map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{m.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                    <span>{new Date(m.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                    <span>·</span>
                    <Clock size={13} />
                    <span>{m.duration} minutes</span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50">
                  <ExternalLink size={12} /> Voir sur Fireflies
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {m.participants.map((p) => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{p}</span>
                  ))}
                </div>
              </div>

              {m.summary && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Résumé</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{m.summary}</div>
                </div>
              )}

              {m.actionItems && m.actionItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actions à suivre</h3>
                  <div className="space-y-2">
                    {m.actionItems.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-sm text-orange-800">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {m.transcript && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Transcription</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 max-h-48 overflow-y-auto leading-relaxed font-mono">
                    {m.transcript}
                  </div>
                </div>
              )}

              {!m.transcript && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <Video size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Transcription disponible via Fireflies.ai</p>
                  <button className="mt-2 text-xs text-purple-600 hover:underline">Charger la transcription</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
