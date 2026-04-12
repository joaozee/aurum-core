import { Search, Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": "Dashboard",
  "/comunicacao": "Comunicação",
  "/atualizacoes": "Updates",
  "/tarefas": "Tarefas",
  "/decisoes": "Decisões",
  "/ideias": "Aurum Lab",
  "/aurum-ai": "Aurum AI",
  "/documentos": "Documentos",
};
import { useState } from "react";
import { Input } from "@/components/ui/input";
import NotificationCenter from "../notifications/NotificationCenter";

export default function Header({ notifications = [], unreadCount = 0, onMarkAllRead, onMarkRead, mobileOpen, onMenuToggle }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Aurum Core";

  return (
    <header className="h-12 md:h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0" style={{ background: "#0a0a0a" }}>
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop search */}
        <div className="hidden md:flex items-center gap-3">
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Buscar..."
                className="pl-9 w-64 h-8 bg-secondary border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Buscar...</span>
            </button>
          )}
        </div>

        {/* Mobile page title */}
        <span className="md:hidden text-sm font-semibold text-foreground absolute left-1/2 -translate-x-1/2">{pageTitle}</span>
      </div>
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />
    </header>
  );
}