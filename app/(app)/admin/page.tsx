"use client";
import { useState } from "react";
import { Shield, Users, Bell, Link2, CheckCircle, X, ExternalLink, Copy, Eye, EyeOff } from "lucide-react";

// Honest integration definitions — status is determined by whether the user has configured them
// In a real deployment, these would be checked server-side. Here we use localStorage flags.

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  setupSteps: string[];
  envKey: string;
  docsUrl?: string;
  category: "data" | "tickets" | "meetings" | "ecommerce" | "comms";
}

const INTEGRATIONS: Integration[] = [
  {
    id: "coda",
    name: "Coda",
    description: "Base de données principale — lecture et écriture bidirectionnelle des magasins, actions, notes",
    icon: "📊",
    envKey: "CODA_API_KEY",
    category: "data",
    setupSteps: [
      "Aller sur coda.io → votre avatar → API settings",
      "Cliquer « Generate API token »",
      "Copier le token",
      'Ajouter dans votre fichier .env.local : CODA_API_KEY=votre_token',
      "Redémarrer le serveur (npm run dev)",
      "Cliquer « Synchroniser Coda » dans l'en-tête",
    ],
    docsUrl: "https://coda.io/developers/apis/v1",
  },
  {
    id: "jira",
    name: "JIRA",
    description: "Gestion des tickets techniques — sync bidirectionnelle avec votre projet JIRA",
    icon: "🎯",
    envKey: "JIRA_API_TOKEN",
    category: "tickets",
    setupSteps: [
      "Aller sur id.atlassian.com → Security → API tokens",
      "Créer un token avec nom « Orchestra Export »",
      "Ajouter dans .env.local :\n  JIRA_HOST=votre-domaine.atlassian.net\n  JIRA_EMAIL=votre@email.com\n  JIRA_API_TOKEN=votre_token\n  JIRA_PROJECT_KEY=EXP",
      "Redémarrer le serveur",
    ],
    docsUrl: "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/",
  },
  {
    id: "fireflies",
    name: "Fireflies.ai",
    description: "Transcription automatique des réunions — import des CR et action items",
    icon: "🔥",
    envKey: "FIREFLIES_API_KEY",
    category: "meetings",
    setupSteps: [
      "Aller sur fireflies.ai → Settings → Integrations → API",
      "Copier votre API key",
      "Ajouter dans .env.local : FIREFLIES_API_KEY=votre_key",
      "Inviter le bot Fireflies à vos réunions (notetaker@fireflies.ai)",
      "Les transcriptions apparaîtront dans l'onglet Réunions",
    ],
    docsUrl: "https://docs.fireflies.ai/",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Reporting e-commerce pour vos boutiques Shopify par pays",
    icon: "🛍️",
    envKey: "SHOPIFY_API_KEY",
    category: "ecommerce",
    setupSteps: [
      "Dans votre Shopify Admin → Apps → Develop apps",
      "Créer une app privée « Orchestra Export »",
      "Activer les permissions : orders (read), products (read), analytics (read)",
      "Copier Admin API access token",
      "Ajouter dans .env.local : SHOPIFY_API_KEY=votre_key\nSHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com",
    ],
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Reporting e-commerce pour vos boutiques WooCommerce",
    icon: "🛒",
    envKey: "WOOCOMMERCE_KEY",
    category: "ecommerce",
    setupSteps: [
      "Dans WooCommerce → Settings → Advanced → REST API",
      "Ajouter une clé, permissions : Read",
      "Copier Consumer Key et Consumer Secret",
      "Ajouter dans .env.local : WOOCOMMERCE_KEY=ck_xxx\nWOOCOMMERCE_SECRET=cs_xxx\nWOOCOMMERCE_URL=https://votre-boutique.com",
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Notifications équipe — alertes actions en retard, nouvelles réunions",
    icon: "💬",
    envKey: "SLACK_WEBHOOK_URL",
    category: "comms",
    setupSteps: [
      "Aller sur api.slack.com/apps → Create New App",
      "Activer Incoming Webhooks",
      "Créer un webhook pour votre canal (ex: #export-alertes)",
      "Copier l'URL du webhook",
      "Ajouter dans .env.local : SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...",
    ],
  },
];

function SetupModal({ intg, onClose }: { intg: Integration; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const envBlock = intg.setupSteps.filter((s) => s.includes(".env.local")).map((s) =>
    s.split("\n").filter((l) => l.includes("=")).join("\n")
  ).join("\n");

  const copyEnv = () => {
    if (envBlock) {
      navigator.clipboard.writeText(envBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{intg.icon}</span>
            <h2 className="text-lg font-bold text-gray-900">Connecter {intg.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <p className="text-sm text-gray-500 mb-5">{intg.description}</p>

        <div className="space-y-3 mb-5">
          {intg.setupSteps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white mt-0.5"
                style={{ background: "#1B2E6B" }}>
                {i + 1}
              </div>
              <div className="flex-1">
                {step.includes("\n") ? (
                  <div>
                    <p className="text-sm text-gray-700 mb-1">{step.split("\n")[0]}</p>
                    <pre className="text-xs bg-gray-900 text-green-400 rounded-lg p-3 font-mono whitespace-pre overflow-x-auto">
                      {step.split("\n").slice(1).join("\n")}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{step}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {envBlock && (
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-mono">.env.local</span>
              <button onClick={copyEnv} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Copy size={11} />
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
            <pre className="text-xs text-green-400 font-mono whitespace-pre">{envBlock}</pre>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          {intg.docsUrl && (
            <a href={intg.docsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              Documentation officielle <ExternalLink size={10} />
            </a>
          )}
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium ml-auto"
            style={{ background: "#E40E20" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  data: "Base de données",
  tickets: "Gestion de projet",
  meetings: "Réunions",
  ecommerce: "E-commerce",
  comms: "Communications",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"integrations" | "users" | "security" | "notifications">("integrations");
  const [setupIntg, setSetupIntg] = useState<Integration | null>(null);
  // In production, these would come from server-side env checks
  // For now, we show all as "non configuré" since we can't read env from client
  const [configured, setConfigured] = useState<Record<string, boolean>>({});

  const categories = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));

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
        <div className="space-y-6">
          {/* Important notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">⚠️ Aucune intégration n'est encore connectée</p>
            <p className="text-xs text-amber-700">Les données affichées dans l'outil proviennent du dernier import Coda. Pour activer la synchronisation en temps réel, configurez les intégrations ci-dessous en ajoutant les clés dans votre fichier <code className="bg-amber-100 px-1 rounded">.env.local</code>.</p>
          </div>

          {/* Priority: Coda first */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">Coda — Priorité 1</h3>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold uppercase">Requis</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Synchronisation bidirectionnelle des magasins, actions et notes. Sans cette connexion, les données ne sont pas en temps réel.</p>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs font-mono text-gray-700 mb-1">Dans <span className="text-blue-600">.env.local</span> :</p>
                    <pre className="text-xs text-green-700 font-mono">CODA_API_KEY=votre_token_coda</pre>
                    <p className="text-[10px] text-gray-400 mt-1">Obtenir sur coda.io → votre avatar → API settings → Generate API token</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSetupIntg(INTEGRATIONS.find((i) => i.id === "coda")!)}
                className="shrink-0 px-4 py-2 text-sm text-white rounded-lg font-medium"
                style={{ background: "#1B2E6B" }}>
                Guide complet
              </button>
            </div>
          </div>

          {/* Other integrations by category */}
          {categories.filter((c) => c !== "data").map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{CATEGORY_LABELS[cat]}</h3>
              <div className="grid grid-cols-2 gap-4">
                {INTEGRATIONS.filter((i) => i.category === cat).map((intg) => (
                  <div key={intg.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{intg.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{intg.name}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        Non configuré
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{intg.description}</p>
                    <button onClick={() => setSetupIntg(intg)}
                      className="w-full text-xs py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium">
                      Voir les instructions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            { label: "Session timeout", desc: "Déconnexion automatique après 8h d'inactivité", enabled: true },
            { label: "Audit logs", desc: "Journalisation de toutes les actions utilisateurs", enabled: false },
            { label: "SSO / SAML", desc: "Connexion via le SSO d'entreprise Orchestra", enabled: false },
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
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-2 text-xs text-gray-500">
            <span>Les notifications Slack et Email seront actives une fois les intégrations correspondantes configurées.</span>
          </div>
          {[
            { label: "Nouvelle action en retard", channels: ["Email", "App"] },
            { label: "Magasin dont le statut a changé", channels: ["App"] },
            { label: "Nouvelle réunion transcrite (Fireflies)", channels: ["App"] },
            { label: "Rapport hebdomadaire export", channels: ["Email"] },
            { label: "Erreur de synchronisation Coda", channels: ["App"] },
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

      {setupIntg && <SetupModal intg={setupIntg} onClose={() => setSetupIntg(null)} />}
    </div>
  );
}
