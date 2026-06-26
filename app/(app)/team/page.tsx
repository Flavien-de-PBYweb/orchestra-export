"use client";
import { useState, useEffect } from "react";
import { COUNTRIES } from "@/lib/data";
import { useAuthStore } from "@/lib/store";
import { User, Mail, Shield, CheckCircle, XCircle, Plus, Edit, X, Loader2, Eye, EyeOff, Trash2 } from "lucide-react";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  countries: string[];
  active: boolean;
  lastActive?: string;
  password?: string;
}

const ROLE_LABELS = { admin: "Administrateur", manager: "Manager", viewer: "Lecteur" };
const ROLE_COLORS = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

const INITIAL_USERS: TeamUser[] = [
  { id: "u1", name: "Laura Fernandez", email: "lfernandez@orchestra-premaman.com", role: "admin", active: true, countries: [], lastActive: "2026-06-26" },
  { id: "u2", name: "PBYweb", email: "pbywebagency@gmail.com", role: "admin", active: true, countries: [], lastActive: "2026-06-26" },
];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function UserModal({
  user,
  onClose,
  onSave,
  isNew,
}: {
  user?: TeamUser;
  onClose: () => void;
  onSave: (u: TeamUser, sendInvite: boolean) => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<TeamUser>(
    user ?? {
      id: `u${Date.now()}`,
      name: "",
      email: "",
      role: "manager",
      countries: [],
      active: true,
      password: generatePassword(),
    }
  );
  const [sendInvite, setSendInvite] = useState(isNew);
  const [showPassword, setShowPassword] = useState(false);
  const set = (f: keyof TeamUser, v: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [f]: v }));

  const toggleCountry = (id: string) => {
    setForm((prev) => ({
      ...prev,
      countries: prev.countries.includes(id)
        ? prev.countries.filter((c) => c !== id)
        : [...prev.countries, id],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isNew ? "Inviter un membre" : "Modifier le profil"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Prénom & Nom *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Laura Fernandez"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Email *</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)}
                type="email" placeholder="prenom@orchestra.fr"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Rôle</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value as "admin" | "manager" | "viewer")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer">
                <option value="admin">Administrateur</option>
                <option value="manager">Manager</option>
                <option value="viewer">Lecteur</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Statut</label>
              <select value={form.active ? "active" : "inactive"} onChange={(e) => set("active", e.target.value === "active")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none cursor-pointer">
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          {/* Temp password for new users */}
          {isNew && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Mot de passe temporaire</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={form.password ?? ""}
                    onChange={(e) => set("password", e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none font-mono"
                  />
                  <button onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={() => set("password", generatePassword())}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                  Régénérer
                </button>
              </div>
            </div>
          )}

          {/* Countries */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Pays assignés <span className="text-gray-400">({form.countries.length} sélectionné{form.countries.length > 1 ? "s" : ""})</span>
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 grid grid-cols-2 gap-1">
              {COUNTRIES.map((c) => (
                <button key={c.id} type="button"
                  onClick={() => toggleCountry(c.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all ${
                    form.countries.includes(c.id)
                      ? "bg-blue-50 border border-blue-200 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <span>{c.flag}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Invite checkbox */}
          {isNew && (
            <label className="flex items-center gap-3 cursor-pointer select-none bg-blue-50 rounded-xl p-3">
              <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)}
                className="w-4 h-4 rounded" />
              <div>
                <p className="text-sm font-medium text-blue-800">Envoyer l'invitation par email</p>
                <p className="text-xs text-blue-600">Un email avec les identifiants sera envoyé via Resend</p>
              </div>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100">
            Annuler
          </button>
          <button
            disabled={!form.name.trim() || !form.email.trim()}
            onClick={() => { onSave(form, sendInvite); onClose(); }}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50"
            style={{ background: "#1B2E6B" }}>
            {isNew ? "Créer le compte" : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<TeamUser[]>(INITIAL_USERS);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ id: string; status: "sending" | "sent" | "error"; msg?: string } | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const handleSave = async (u: TeamUser, sendInvite: boolean) => {
    if (isNew) {
      setUsers((prev) => [...prev, u]);
    } else {
      setUsers((prev) => prev.map((p) => (p.id === u.id ? u : p)));
    }

    if (sendInvite && isNew) {
      setInviteStatus({ id: u.id, status: "sending" });
      try {
        const res = await fetch("/api/team/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: u.name, email: u.email, role: ROLE_LABELS[u.role], tempPassword: u.password }),
        });
        const data = await res.json();
        if (data.ok) {
          setInviteStatus({ id: u.id, status: "sent", msg: data.emailSent ? "Invitation envoyée !" : data.message });
        } else {
          setInviteStatus({ id: u.id, status: "error", msg: data.error });
        }
      } catch (e) {
        setInviteStatus({ id: u.id, status: "error", msg: String(e) });
      }
      setTimeout(() => setInviteStatus(null), 5000);
    }
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Membres de l'équipe Export</h2>
          <p className="text-sm text-gray-500">{users.filter((u) => u.active).length} actifs sur {users.length} membres</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setIsNew(true); setEditingUser(null); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium transition-colors"
            style={{ background: "#1B2E6B" }}>
            <Plus size={15} /> Inviter un membre
          </button>
        )}
      </div>

      {/* Invite status toast */}
      {inviteStatus && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-3 ${
          inviteStatus.status === "sending" ? "bg-blue-50 text-blue-700 border border-blue-200"
          : inviteStatus.status === "sent" ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {inviteStatus.status === "sending" && <Loader2 size={14} className="animate-spin" />}
          {inviteStatus.status === "sent" && <CheckCircle size={14} />}
          {inviteStatus.status === "sending" ? "Envoi de l'invitation en cours…" : inviteStatus.msg}
        </div>
      )}

      {/* Role legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><Shield size={12} className="text-purple-500" /> Administrateur — accès total</div>
        <div className="flex items-center gap-1.5"><User size={12} className="text-blue-500" /> Manager — lecture + édition</div>
        <div className="flex items-center gap-1.5"><User size={12} className="text-gray-400" /> Lecteur — lecture seule</div>
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((u) => {
          const userCountries = (u.countries ?? []).map((id) => COUNTRIES.find((c) => c.id === id)).filter(Boolean);
          const isCurrent = u.email === currentUser?.email;
          return (
            <div key={u.id} className={`bg-white rounded-2xl border p-5 transition-all ${!u.active ? "opacity-60 border-gray-100" : "border-gray-100 hover:shadow-sm"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg relative"
                    style={{ background: u.active ? "#1B2E6B" : "#9CA3AF" }}>
                    {u.name.split(" ").map((n) => n[0]).join("")}
                    {isCurrent && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white" title="Vous" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{u.name}</h3>
                      {u.active ? <CheckCircle size={13} className="text-green-500" /> : <XCircle size={13} className="text-gray-400" />}
                      {isCurrent && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Vous</span>}
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
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingUser(u); setIsNew(false); }}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-blue-50">
                        <Edit size={13} />
                      </button>
                      {!isCurrent && (
                        <button onClick={() => handleDelete(u.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {userCountries.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-2">Pays assignés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userCountries.map((c) => c && (
                      <span key={c.id} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-600">
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

      {/* Modals */}
      {(editingUser || isNew) && (
        <UserModal
          user={editingUser ?? undefined}
          onClose={() => { setEditingUser(null); setIsNew(false); }}
          onSave={handleSave}
          isNew={isNew && !editingUser}
        />
      )}
    </div>
  );
}
