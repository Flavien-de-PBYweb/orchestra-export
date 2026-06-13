"use client";
import { USERS, COUNTRIES } from "@/lib/data";
import { User, Mail, Shield, CheckCircle, XCircle, Plus, Edit } from "lucide-react";

const ROLE_LABELS = { admin: "Administrateur", manager: "Manager", viewer: "Lecteur" };
const ROLE_COLORS = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Membres de l'équipe Export</h2>
          <p className="text-sm text-gray-500">{USERS.filter(u => u.active).length} actifs sur {USERS.length} membres</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium" style={{ background: "#1B2E6B" }}>
          <Plus size={15} /> Inviter un membre
        </button>
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {USERS.map((u) => {
          const userCountries = (u.countries ?? []).map((id) => COUNTRIES.find((c) => c.id === id)).filter(Boolean);
          return (
            <div key={u.id} className={`bg-white rounded-2xl border p-5 ${!u.active ? "opacity-60" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: u.active ? "#1B2E6B" : "#9CA3AF" }}>
                    {u.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{u.name}</h3>
                      {u.active
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <XCircle size={14} className="text-gray-400" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <Mail size={10} />{u.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit size={14} />
                  </button>
                </div>
              </div>

              {userCountries.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-2">Pays assignés</p>
                  <div className="flex flex-wrap gap-2">
                    {userCountries.map((c) => c && (
                      <span key={c.id} className="text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full text-gray-600">
                        {c.flag} {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {u.lastActive && (
                <p className="text-xs text-gray-300 mt-3">
                  Dernière activité : {new Date(u.lastActive).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
