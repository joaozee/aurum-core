import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, MessageSquare, Newspaper, CheckSquare, 
  Scale, Lightbulb, Bot, FolderOpen, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/comunicacao", icon: MessageSquare, label: "Comunicação" },
  { path: "/atualizacoes", icon: Newspaper, label: "Atualizações" },
  { path: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { path: "/decisoes", icon: Scale, label: "Decisões" },
  { path: "/ideias", icon: Lightbulb, label: "Ideias & Lab" },
  { path: "/aurum-ai", icon: Bot, label: "Aurum AI" },
  { path: "/documentos", icon: FolderOpen, label: "Documentos" },
];

export default function Sidebar({ collapsed, onToggle, user, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col border-r border-border transition-all duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      style={{ background: "#111111", width: collapsed ? "68px" : "260px" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-black">A</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-foreground font-bold text-lg leading-tight tracking-wide">Aurum</p>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">Core</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-gold" : "text-muted-foreground group-hover:text-foreground"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle - desktop only */}
      <button
        onClick={onToggle}
        className="hidden md:flex mx-auto mb-2 w-7 h-7 rounded-full border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* User */}
      <div className="border-t border-border px-3 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-gold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.full_name || "Usuário"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}