import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import NotificationCenter from "../notifications/NotificationCenter";

export default function Header({ notifications = [], unreadCount = 0, onMarkAllRead, onMarkRead }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0" style={{ background: "#0a0a0a" }}>
      <div className="flex items-center gap-3">
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar..."
              className="pl-9 w-64 h-8 bg-secondary border-border text-sm"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Buscar...</span>
          </button>
        )}
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