import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Library,
  Upload,
  Cpu,
  Type,
  Image,
  Shield,
  TrendingUp,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV_PRINCIPAL = [
  { to: "/biblioteca", icon: Library, label: "Biblioteca" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/ia-cortes", icon: Cpu, label: "IA de cortes" },
  { to: "/titulos", icon: Type, label: "Títulos & SEO" },
  { to: "/thumbnails", icon: Image, label: "Thumbnails" },
];

const NAV_PROTECAO = [
  { to: "/copyright", icon: Shield, label: "Risco de copyright" },
  { to: "/viral-score", icon: TrendingUp, label: "Score de viralização" },
];

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SidebarLink({ to, icon: Icon, label }: SidebarLinkProps) {
  const router = useRouterState();
  const isActive = router.location.pathname === to ||
    (to !== "/" && router.location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
        isActive
          ? "bg-[#C2FF45]/10 text-[#C2FF45]"
          : "text-[#6B7A6B] hover:bg-white/5 hover:text-[#F0F5F0]"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-[#C2FF45]"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-[#C2FF45]" : "text-[#4A5A4A] group-hover:text-[#F0F5F0]"
        )}
      />
      <span className="font-medium">{label}</span>
      {isActive && (
        <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const { signOut, session } = useAuth();
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase() || "AC";

  return (
    <aside
      className="flex h-screen w-[236px] shrink-0 flex-col"
      style={{ background: "#080A09", borderRight: "1px solid rgba(194,255,69,0.08)" }}
    >
      {/* Logo */}
      <div className="flex items-center px-5 py-6">
        <Link to="/biblioteca" className="group flex items-baseline gap-0">
          <span className="font-display text-[22px] tracking-wide text-[#F0F5F0] group-hover:text-white transition-colors">
            Arena
          </span>
          <span className="font-display text-[22px] tracking-wide text-[#C2FF45]">
            Clips
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6">
        {/* PRINCIPAL section */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] text-[#3A4A3A] uppercase">
            Principal
          </p>
          <div className="space-y-0.5">
            {NAV_PRINCIPAL.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        </div>

        {/* PROTEÇÃO section */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] text-[#3A4A3A] uppercase">
            Proteção
          </p>
          <div className="space-y-0.5">
            {NAV_PROTECAO.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer — channel/user info */}
      <div
        className="border-t px-4 py-4"
        style={{ borderColor: "rgba(194,255,69,0.08)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="h-8 w-8 shrink-0 rounded-lg bg-[#C2FF45]/15 flex items-center justify-center">
            <span className="text-xs font-bold text-[#C2FF45] font-mono">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#F0F5F0] truncate">
              {email.split("@")[0] || "Meu canal"}
            </p>
            <p className="text-[10px] text-[#3A4A3A]">Plano Criador</p>
          </div>
        </div>
        <button
          id="btn-signout"
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#4A5A4A] hover:bg-white/5 hover:text-[#FF7A6B] transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
