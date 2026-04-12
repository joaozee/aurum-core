import { Search, Bell } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Header() {
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
      <button className="relative text-muted-foreground hover:text-foreground transition-colors">
        <Bell className="w-[18px] h-[18px]" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold rounded-full" />
      </button>
    </header>
  );
}