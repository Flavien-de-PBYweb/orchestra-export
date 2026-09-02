"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Globe, CheckSquare, BarChart3,
  Video, StickyNote, Users, LogOut, ChevronRight,
  Bell, Settings, AlertCircle, Calendar, X, Target, Rocket,
} from "lucide-react";
import { useAuthStore, useTodoStore, useTeamStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { OrchestraLogo } from "@/components/shared/OrchestraLogo";
import { COUNTRIES } from "@/lib/data";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/countries", icon: Globe, label: "Pays & Marchés" },
  { href: "/prospects", icon: Target, label: "Prospects" },
  { href: "/lancement", icon: Rocket, label: "Lancement" },
  { href: "/todos", icon: CheckSquare, label: "Plan d'actions" },
  { href: "/stats", icon: BarChart3, label: "Statistiques" },
  { href: "/meetings", icon: Video, label: "Réunions" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
];

const ADMIN_NAV = [
  { href: "/team", icon: Users, label: "Équipe" },
  { href: "/admin", icon: Settings, label: "Administration" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { todos } = useTodoStore();
  const { users: teamUsers } = useTeamStore();
  const [showNotifs, setShowNotifs] = useState(false);

  const currentTeamUser = teamUsers.find(u => u.email === user?.email);
  const pageAccess = currentTeamUser?.pageAccess ?? {};
  const visibleNav = user?.role === "admin"
    ? NAV
    : NAV.filter(n => pageAccess[n.href] !== false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Compute real notifications from todos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const notifications = [
    // Overdue todos
    ...todos
      .filter((t) => t.status !== "terminé" && t.dueDate && new Date(t.dueDate) < today)
      .map((t) => ({
        id: `overdue-${t.id}`,
        type: "overdue" as const,
        title: t.title,
        detail: `En retard depuis le ${new Date(t.dueDate!).toLocaleDateString("fr-FR")}`,
        country: COUNTRIES.find((c) => c.id === t.countryId),
        todoId: t.id,
      })),
    // High priority not started
    ...todos
      .filter((t) => t.priority === "haute" && t.status === "à_faire")
      .map((t) => ({
        id: `urgent-${t.id}`,
        type: "urgent" as const,
        title: t.title,
        detail: "Haute priorité · Non démarrée",
        country: COUNTRIES.find((c) => c.id === t.countryId),
        todoId: t.id,
      })),
    // Due in 3 days
    ...todos
      .filter((t) => t.status !== "terminé" && t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= in3Days)
      .map((t) => ({
        id: `soon-${t.id}`,
        type: "soon" as const,
        title: t.title,
        detail: `Échéance le ${new Date(t.dueDate!).toLocaleDateString("fr-FR")}`,
        country: COUNTRIES.find((c) => c.id === t.countryId),
        todoId: t.id,
      })),
  ].slice(0, 12);

  const notifCount = notifications.length;

  return (
    <aside className="flex flex-col h-full w-64 shrink-0 relative"
      style={{ background: "#1B2E6B" }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <OrchestraLogo className="h-7 w-auto" />
        <div className="mt-1 text-[9px] uppercase tracking-widest font-semibold text-white/30">Export International</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {visibleNav.map(({ href, icon: Icon, label, badge }: { href: string; icon: React.ElementType; label: string; badge?: string }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active ? "text-white" : "text-white/60 hover:text-white hover:bg-white/8"
              )}
              style={active ? { background: "rgba(228,14,32,0.22)", color: "#fff" } : {}}>
              <Icon size={17} className={active ? "text-[#E40E20]" : "text-white/50 group-hover:text-white/80"} />
              <span>{label}</span>
              {badge && <span className="ml-1 text-[9px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full uppercase tracking-wide">{badge}</span>}
              {active && <ChevronRight size={14} className="ml-auto text-white/40" />}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Admin</span>
            </div>
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    active ? "text-white" : "text-white/60 hover:text-white hover:bg-white/8"
                  )}
                  style={active ? { background: "rgba(228,14,32,0.22)" } : {}}>
                  <Icon size={17} className={active ? "text-[#E40E20]" : "text-white/50 group-hover:text-white/80"} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all"
        >
          <Bell size={17} />
          <span>Notifications</span>
          {notifCount > 0 && (
            <span className="ml-auto bg-[#E40E20] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {notifCount}
            </span>
          )}
          {notifCount === 0 && (
            <span className="ml-auto text-[10px] text-white/30">0</span>
          )}
        </button>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#E40E20] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{user?.name?.split(" ").map(n => n[0]).join("") || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{user?.name}</div>
            <div className="text-white/40 text-[10px] capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-white/40 hover:text-white/80 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Notification panel — slides out above sidebar */}
      {showNotifs && (
        <div className="absolute bottom-28 left-0 w-full z-50 px-3">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-gray-600" />
                <span className="text-sm font-bold text-gray-900">Notifications</span>
                {notifCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{notifCount}</span>
                )}
              </div>
              <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  <p className="text-2xl mb-2">✅</p>
                  <p>Aucune notification — tout est à jour !</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href="/todos"
                    onClick={() => setShowNotifs(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === "overdue" ? "bg-red-100" : n.type === "urgent" ? "bg-orange-100" : "bg-yellow-100"
                    }`}>
                      {n.type === "overdue"
                        ? <AlertCircle size={13} className="text-red-500" />
                        : n.type === "urgent"
                        ? <AlertCircle size={13} className="text-orange-500" />
                        : <Calendar size={13} className="text-yellow-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {n.country?.flag} {n.title}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${
                        n.type === "overdue" ? "text-red-500 font-medium" : "text-gray-400"
                      }`}>{n.detail}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100">
                <Link href="/todos" onClick={() => setShowNotifs(false)}
                  className="text-xs text-blue-600 hover:underline font-medium">
                  Voir toutes les actions →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
