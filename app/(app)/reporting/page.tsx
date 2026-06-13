"use client";
import { ShoppingBag, Plus, ExternalLink, ArrowRight } from "lucide-react";

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      {/* Not connected state */}
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Reporting E-commerce</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          Connectez vos boutiques e-commerce (Shopify, WooCommerce, Salesforce Commerce Cloud) pour voir les revenus, commandes et taux de conversion en temps réel.
        </p>
        <a href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
          style={{ background: "#1B2E6B" }}>
          Configurer les intégrations
          <ArrowRight size={15} />
        </a>
      </div>

      {/* Platform guides */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            name: "Shopify",
            icon: "🛍️",
            desc: "Connectez vos boutiques Shopify par pays. Accès en lecture aux commandes, produits et analytics.",
            steps: ["Admin Shopify → Apps → Develop apps", "Créer une app privée avec permissions orders + analytics", "Copier Admin API access token dans .env.local"],
          },
          {
            name: "WooCommerce",
            icon: "🛒",
            desc: "Pour chaque boutique WooCommerce, créez une clé API en lecture seule.",
            steps: ["WooCommerce → Settings → Advanced → REST API", "Ajouter une clé avec permissions : Read", "Copier Consumer Key et Consumer Secret dans .env.local"],
          },
          {
            name: "Salesforce CC",
            icon: "☁️",
            desc: "Connectez Salesforce Commerce Cloud via l'API OCAPI pour accéder aux données de vente.",
            steps: ["SFCC Business Manager → Administration → OCAPI Settings", "Créer un client ID avec accès data", "Ajouter SFCC_CLIENT_ID et SFCC_CLIENT_PASSWORD dans .env.local"],
          },
        ].map((p) => (
          <div key={p.name} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  Non configuré
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">{p.desc}</p>
            <div className="space-y-2">
              {p.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-xs text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 font-bold text-[10px]">{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <a href="/admin" className="mt-4 flex items-center gap-1 text-xs text-blue-500 hover:underline">
              Guide complet <ExternalLink size={10} />
            </a>
          </div>
        ))}
      </div>

      {/* Coming soon note */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-xs text-gray-500 text-center">
        Une fois connectées, vous verrez ici les revenus par boutique, le nombre de commandes, les taux de conversion et les tendances semaine par semaine.
      </div>
    </div>
  );
}
