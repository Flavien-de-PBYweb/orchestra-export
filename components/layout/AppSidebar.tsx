"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Globe, CheckSquare, Ticket, BarChart3,
  Video, StickyNote, ShoppingCart, Users, LogOut, ChevronRight,
  Bell, Settings
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/countries", icon: Globe, label: "Pays & Marchés" },
  { href: "/todos", icon: CheckSquare, label: "Plan d'actions" },
  { href: "/tickets", icon: Ticket, label: "Tickets JIRA" },
  { href: "/stats", icon: BarChart3, label: "Statistiques" },
  { href: "/reporting", icon: ShoppingCart, label: "Reporting E-com" },
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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col h-full w-64 shrink-0"
      style={{ background: "#1B2E6B" }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="font-black text-base" style={{ color: "#1B2E6B" }}>O</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">ORCHESTRA</div>
            <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#F47920" }}>Export International</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              )}
              style={active ? { background: "rgba(244,121,32,0.25)", color: "#fff" } : {}}>
              <Icon size={17} className={active ? "text-[#F47920]" : "text-white/50 group-hover:text-white/80"} />
              <span>{label}</span>
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
                  style={active ? { background: "rgba(244,121,32,0.25)" } : {}}>
                  <Icon size={17} className={active ? "text-[#F47920]" : "text-white/50 group-hover:text-white/80"} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
          <Bell size={17} />
          <span>Notifications</span>
          <span className="ml-auto bg-[#F47920] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#F47920] flex items-center justify-center shrink-0">
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
    </aside>
  );
}
