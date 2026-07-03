"use client";
import { useState, useEffect } from "react";
import { COUNTRIES } from "@/lib/data";
import { useAuthStore } from "@/lib/store";
import { User, Mail, Shield, CheckCircle, XCircle, Plus, Edit, X, Loader2, Eye, EyeOff, Trash2, Copy, Share2 } from "lucide-react";

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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Pays assignés <span className="text-gray-400">({form.countries.length} sélectionné{form.countries.length > 1 ? "s" : ""})</span>
              </label>
              <button type="button"
                onClick={() => setForm((p) => ({ ...p, countries: form.countries.length === COUNTRIES.length ? [] : COUNTRIES.map((c) => c.id) }))}
                className="text-xs text-blue-600 hover:underline">
                {form.countries.length === COUNTRIES.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
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

function InviteShareModal({ name, email, password, onClose }: {
  name: string; email: string; password: string; onClose: () => void;
}) {
  const loginUrl = "https://orchestra-export.vercel.app/login";
  const [copied, setCopied] = useState(false);

  const message = `Bonjour ${name} 👋

Tu as été invité(e) sur l'outil Orchestra Export International.

🔗 Lien de connexion : ${loginUrl}
📧 Email : ${email}
🔑 Mot de passe temporaire : ${password}

Pense à changer ton mot de passe après ta première connexion.

— Équipe Orchestra Export`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1B2E6B" }}>
              <Share2 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Partager l'invitation</h2>
              <p className="text-xs text-gray-400">Copiez et envoyez par le canal de votre choix</p>
            </div>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Message preview */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: copied ? "#16a34a" : "#1B2E6B" }}>
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? "Copié !" : "Copier le message"}
          </button>
          <button
            onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
            }}
            className="px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
            <span>💬</span> WhatsApp
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-2">
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<TeamUser[]>(INITIAL_USERS);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [inviteCard, setInviteCard] = useState<{ name: string; email: string; password: string } | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const handleSave = async (u: TeamUser, sendInvite: boolean) => {
    if (isNew) {
      setUsers((prev) => [...prev, u]);
    } else {
      setUsers((prev) => prev.map((p) => (p.id === u.id ? u : p)));
    }

    if (sendInvite && isNew && u.password) {
      setInviteCard({ name: u.name, email: u.email, password: u.password });
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

      {/* Invite share modal */}
      {inviteCard && (
        <InviteShareModal
          name={inviteCard.name}
          email={inviteCard.email}
          password={inviteCard.password}
          onClose={() => setInviteCard(null)}
        />
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
                      {u.password && (
                        <button
                          title="Repartager les accès"
                          onClick={() => setInviteCard({ name: u.name, email: u.email, password: u.password! })}
                          className="text-gray-400 hover:text-green-500 transition-colors p-1 rounded hover:bg-green-50">
                          <Share2 size={13} />
                        </button>
                      )}
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
