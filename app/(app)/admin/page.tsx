"use client";
import { useState } from "react";
import { Shield, Users, Database, Link2, Key, Bell, Globe, Zap, CheckCircle, AlertCircle } from "lucide-react";

const integrations = [
  { name: "Coda", description: "Base de données principale & synchronisation", icon: "📊", status: "connected", lastSync: "Il y a 5 min" },
  { name: "JIRA", description: "Gestion des tickets techniques", icon: "🎯", status: "connected", lastSync: "Il y a 2 min" },
  { name: "Fireflies.ai", description: "Transcription automatique des réunions", icon: "🔥", status: "connected", lastSync: "Temps réel" },
  { name: "Shopify (Maroc)", description: "E-commerce orchestra.ma", icon: "🛍️", status: "connected", lastSync: "Il y a 1h" },
  { name: "Shopify (KSA)", description: "E-commerce orchestra-ksa.com", icon: "🛍️", status: "connected", lastSync: "Il y a 1h" },
  { name: "WooCommerce (UAE)", description: "E-commerce orchestra-uae.com", icon: "🛒", status: "connected", lastSync: "Il y a 2h" },
  { name: "SFCC (Espagne)", description: "Salesforce Commerce Cloud orchestra.es", icon: "☁️", status: "warning", lastSync: "Il y a 6h" },
  { name: "Slack", description: "Notifications équipe", icon: "💬", status: "disconnected", lastSync: "—" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"integrations" | "users" | "security" | "notifications">("integrations");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {[
          { id: "integrations", label: "Intégrations", icon: Link2 },
          { id: "users", label: "Accès utilisateurs", icon: Users },
          { id: "security", label: "Sécurité", icon: Shield },
          { id: "notifications", label: "Notifications", icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? "text-white" : "text-gray-500 hover:text-gray-700"
            }`}
            style={activeTab === id ? { background: "#1B2E6B" } : {}}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Integrations tab */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <strong>Coda comme base de données :</strong> Toutes les données de l'outil sont synchronisées avec votre Coda. En cas de bug ou de panne, l'historique complet reste accessible sur Coda.
          </div>
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((intg) => (
              <div key={intg.name} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <div className="text-2xl shrink-0">{intg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">{intg.name}</h3>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${
                      intg.status === "connected" ? "text-green-600" :
                      intg.status === "warning" ? "text-orange-500" : "text-gray-400"
                    }`}>
                      {intg.status === "connected"
                        ? <><div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Connecté</>
                        : intg.status === "warning"
                        ? <><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Attention</>
                        : <><div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Déconnecté</>
                      }
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{intg.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-300">Sync : {intg.lastSync}</span>
                    <button className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                      intg.status === "disconnected"
                        ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}>
                      {intg.status === "disconnected" ? "Connecter" : "Configurer"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Gestion des accès</h2>
          <div className="space-y-4">
            {[
              { role: "Administrateur", desc: "Accès complet — gestion des utilisateurs, intégrations, paramètres", perms: ["Tout voir", "Tout modifier", "Gestion accès", "Intégrations"] },
              { role: "Manager", desc: "Accès à toutes les données, modification limitée aux pays assignés", perms: ["Voir tout", "Modifier ses pays", "Créer des notes", "Créer des tickets"] },
              { role: "Lecteur", desc: "Accès en lecture seule à toutes les sections", perms: ["Voir tout", "Exporter des données"] },
            ].map((r) => (
              <div key={r.role} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{r.role}</h3>
                  <button className="text-xs text-blue-600 hover:underline">Modifier</button>
                </div>
                <p className="text-xs text-gray-500 mb-2">{r.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.perms.map((p) => (
                    <span key={p} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={9} />{p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Paramètres de sécurité</h2>
          {[
            { label: "Authentification à deux facteurs", desc: "Obligatoire pour tous les administrateurs", enabled: true },
            { label: "SSO / SAML", desc: "Connexion via le SSO d'entreprise Orchestra", enabled: false },
            { label: "Session timeout", desc: "Déconnexion automatique après 8h d'inactivité", enabled: true },
            { label: "Audit logs", desc: "Journalisation de toutes les actions utilisateurs", enabled: true },
            { label: "IP Whitelist", desc: "Restreindre l'accès aux réseaux Orchestra", enabled: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <button className={`w-11 h-6 rounded-full transition-colors relative ${s.enabled ? "bg-green-500" : "bg-gray-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${s.enabled ? "right-1" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Notifications</h2>
          {[
            { label: "Nouvel ticket JIRA assigné", channels: ["Email", "App"] },
            { label: "Action en retard", channels: ["Email", "App", "Slack"] },
            { label: "Nouvelle réunion transcrite", channels: ["App"] },
            { label: "Rapport hebdomadaire export", channels: ["Email"] },
            { label: "Alerte seuil CA e-commerce", channels: ["Email", "App"] },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <p className="text-sm text-gray-700">{n.label}</p>
              <div className="flex gap-2">
                {n.channels.map((ch) => (
                  <span key={ch} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{ch}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
