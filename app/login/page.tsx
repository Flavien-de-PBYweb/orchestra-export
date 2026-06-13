"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: "#1B2E6B" }}>O</span>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">ORCHESTRA</span>
          </div>
          <div className="mt-2 ml-[52px]">
            <span className="text-xs uppercase tracking-widest" style={{ color: "#F47920" }}>Export & International</span>
          </div>
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
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#1B2E6B" }}>
              <span className="text-lg font-bold text-white">O</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">ORCHESTRA</div>
              <div className="text-xs" style={{ color: "#F47920" }}>Export & International</div>
            </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
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
                style={{ background: loading ? "#6B7280" : "#F47920" }}
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
            <a href="mailto:it@orchestra.fr" className="underline">it@orchestra.fr</a>
          </p>
        </div>
      </div>
    </div>
  );
}
