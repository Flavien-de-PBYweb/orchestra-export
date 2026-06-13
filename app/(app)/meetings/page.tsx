"use client";
import { useState } from "react";
import { INITIAL_MEETINGS, COUNTRIES } from "@/lib/data";
import { useFirefliesStore, type FirefliesMeeting } from "@/lib/store";
import { Video, Clock, Users, ChevronDown, ChevronRight, ExternalLink, Zap, RefreshCw, CheckCircle } from "lucide-react";

export default function MeetingsPage() {
  const { meetings: liveMeetings, lastSync, isSyncing, error, syncFromFireflies } = useFirefliesStore();
  const meetings = liveMeetings ?? INITIAL_MEETINGS;
  const isLive = !!liveMeetings;

  const [expanded, setExpanded] = useState<string | null>(meetings[0]?.id ?? null);

  return (
    <div className="space-y-6">
      {/* Fireflies status banner */}
      <div className={`rounded-2xl p-4 border flex items-center gap-4 ${isLive ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLive ? "bg-green-100" : "bg-purple-100"}`}>
          <Zap size={18} className={isLive ? "text-green-600" : "text-purple-600"} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">
            Fireflies.ai — {isLive ? "Connecté" : "Non synchronisé"}
          </h3>
          <p className={`text-xs ${isLive ? "text-green-700" : "text-amber-700"}`}>
            {isLive
              ? `${liveMeetings.length} réunion(s) chargée(s) · Sync ${new Date(lastSync!).toLocaleString("fr-FR")}`
              : "Cliquez « Synchroniser » pour charger vos vraies réunions Fireflies."}
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400" : "bg-gray-300"}`} />
          <span className="text-xs text-gray-500 font-medium">{isLive ? "Connecté" : "Non configuré"}</span>
        </div>
        <button
          onClick={syncFromFireflies}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap disabled:opacity-60 ${
            isLive
              ? "border-green-200 text-green-700 hover:bg-green-100"
              : "border-purple-200 text-purple-600 hover:bg-purple-50"
          }`}
        >
          <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Chargement…" : "Synchroniser"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Meeting list */}
        <div className="col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm px-1">
            Réunions récentes
            {!isLive && <span className="ml-2 text-[10px] text-amber-500 font-normal">exemples</span>}
          </h2>
          {meetings.map((m) => {
            const countries = ("countryIds" in m ? (m.countryIds ?? []) : [])
              .map((id: string) => COUNTRIES.find((c) => c.id === id))
              .filter(Boolean);
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
          {meetings.filter((m) => m.id === expanded).map((m) => {
            const meeting = m as FirefliesMeeting & { countryIds?: string[] };
            return (
              <div key={meeting.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{meeting.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span>{new Date(meeting.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                      <span>·</span>
                      <Clock size={13} />
                      <span>{meeting.duration} minutes</span>
                    </div>
                  </div>
                  {isLive && (
                    <a
                      href={`https://app.fireflies.ai/view/${meeting.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50"
                    >
                      <ExternalLink size={12} /> Voir sur Fireflies
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {(meeting.participants ?? []).map((p) => (
                      <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>

                {meeting.summary && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Résumé</h3>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{meeting.summary}</div>
                  </div>
                )}

                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actions à suivre</h3>
                    <div className="space-y-2">
                      {meeting.actionItems.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-sm text-orange-800">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.transcript ? (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Transcription</h3>
                    <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 max-h-48 overflow-y-auto leading-relaxed font-mono whitespace-pre-wrap">
                      {meeting.transcript}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <Video size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {isLive ? "Transcription non disponible pour cette réunion" : "Transcription disponible via Fireflies.ai"}
                    </p>
                    {!isLive && (
                      <button onClick={syncFromFireflies} className="mt-2 text-xs text-purple-600 hover:underline flex items-center gap-1 mx-auto">
                        <RefreshCw size={10} /> Synchroniser Fireflies
                      </button>
                    )}
                  </div>
                )}

                {isLive && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-xs text-gray-400">Données en direct depuis Fireflies.ai</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
