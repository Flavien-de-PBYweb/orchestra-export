"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { OrchestraLogo, OrchestraLogoRed } from "@/components/shared/OrchestraLogo";
import { X, Copy, CheckCircle, ArrowLeft } from "lucide-react";

// ── Forgot password modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const adminEmail = "lfernandez@orchestra-premaman.com";
  const message = `Bonjour,

J'ai oublié mon mot de passe pour accéder à l'outil Orchestra Export International.

Mon adresse e-mail : ${email || "votre.email@example.com"}

Merci de me renvoyer mes accès.

Cordialement`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === "done" && (
              <button onClick={() => setStep("form")} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-gray-900">Mot de passe oublié</h2>
              <p className="text-xs text-gray-400">
                {step === "form" ? "Entrez votre email pour continuer" : "Message prêt à envoyer"}
              </p>
            </div>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-6">
          {step === "form" ? (
            <>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                La réinitialisation se fait via votre administrateur. Entrez votre email et nous préparerons un message à lui envoyer.
              </p>
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Votre adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
                  autoFocus
                />
              </div>
              <button
                onClick={() => { if (email) setStep("done"); }}
                disabled={!email}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40 transition-all"
                style={{ background: "#1B2E6B" }}>
                Continuer
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Copiez ce message et envoyez-le à votre administrateur :
                <a href={`mailto:${adminEmail}`} className="text-blue-600 hover:underline ml-1 font-medium">{adminEmail}</a>
              </p>

              {/* Message preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: copied ? "#16a34a" : "#1B2E6B" }}>
                  {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                  {copied ? "Copié !" : "Copier le message"}
                </button>
                <a
                  href={`mailto:${adminEmail}?subject=Réinitialisation%20mot%20de%20passe%20Orchestra%20Export&body=${encodeURIComponent(message)}`}
                  className="px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1.5">
                  ✉️ Email
                </a>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                L'administrateur vous renverra vos accès via le même canal.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Login page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
      router.push("/dashboard");
    } else {
      setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #111D4A 0%, #1B2E6B 60%, #2B4494 100%)" }}>
        <div>
          <OrchestraLogo className="h-10 w-auto" />
          <div className="mt-2 text-xs uppercase tracking-widest font-semibold" style={{ color: "#E40E20" }}>Export & International</div>
        </div>

        <div className="text-white">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Pilotage global<br />du développement<br />international
          </h1>
          <p className="text-white/60 text-lg">
            Centralisation, suivi et analyse<br />de l'activité export Orchestra.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: "14", label: "Pays actifs" },
              { val: "118", label: "Magasins" },
              { val: "+18%", label: "Croissance CA" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{s.val}</div>
                <div className="text-white/60 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/30 text-xs">© 2025 Orchestra Prémaman — Confidentiel</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F6FB]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <OrchestraLogoRed className="h-9 w-auto" />
            <div className="mt-1 text-xs uppercase tracking-widest font-semibold" style={{ color: "#E40E20" }}>Export & International</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
            <p className="text-gray-500 text-sm mb-8">Accès réservé aux équipes Export Orchestra</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50"
                  style={{ "--tw-ring-color": "#1B2E6B" } as React.CSSProperties}
                  placeholder="prenom.nom@orchestra.fr"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: "#1B2E6B" }}>
                    Mot de passe oublié ?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50"
                  placeholder="••••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                style={{ background: loading ? "#6B7280" : "#E40E20" }}
              >
                {loading ? "Connexion en cours…" : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 font-medium mb-2">Comptes démo :</p>
              <p className="text-xs text-blue-600">sophie@orchestra.fr / Orchestra2025!</p>
              <p className="text-xs text-blue-600">marc@orchestra.fr / Orchestra2025!</p>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Problème de connexion ? Contactez{" "}
            <a href="mailto:lfernandez@orchestra-premaman.com" className="underline">votre administrateur</a>
          </p>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
