import { X, Bell } from "lucide-react";
import { useState } from "react";

// Detect iOS
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
// Detect if running as installed PWA
const isPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
// Notifications supported?
const notifSupported = "Notification" in window;

export default function PermissionBanner({ onRequest }) {
  const [hidden, setHidden] = useState(false);
  const [toast, setToast] = useState(null);

  if (hidden) return null;

  // iOS but not installed as PWA — show install instructions
  if (isIOS && !isPWA) {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-3 flex items-start gap-3">
        <Bell className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground flex-1">
          Para ativar notificações no iPhone, instale o app: toque em{" "}
          <span className="text-foreground font-medium">Compartilhar → Adicionar à Tela de Início</span>
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Notifications not supported
  if (!notifSupported) {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
        <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">Seu navegador não suporta notificações push.</p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleActivate = () => {
    // Must be called directly in onClick (user gesture) — no async wrapper
    Notification.requestPermission().then((result) => {
      setHidden(true);
      if (onRequest) onRequest(result);
    });
  };

  return (
    <>
      <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
        <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">
          Ative notificações para não perder atualizações importantes.
        </p>
        <button
          onClick={handleActivate}
          className="text-xs text-gold hover:text-gold-hover transition-colors font-medium shrink-0"
        >
          Ativar
        </button>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}