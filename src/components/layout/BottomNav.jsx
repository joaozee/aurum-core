import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, MessageSquare, Newspaper, FolderOpen } from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { path: "/comunicacao", icon: MessageSquare, label: "Chat" },
  { path: "/atualizacoes", icon: Newspaper, label: "Updates" },
  { path: "/documentos", icon: FolderOpen, label: "Docs" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border flex items-stretch"
      style={{
        background: "#111111",
        height: "60px",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}