import { X, Bell } from "lucide-react";
import { useState } from "react";

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInstalledPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const notifSupported = "Notification" in window;

export default function PermissionBanner() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  // Already granted — no banner
  if (notifSupported && Notification.permission === "granted") return null;

  // Denied — show settings instruction
  if (notifSupported && Notification.permission === "denied") {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
        <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">
          Notificações bloqueadas. Acesse as configurações do Android para reativar.
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // iOS — show install instructions
  if (isIOS && !isInstalledPWA) {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-3 flex items-start gap-3">
        <span className="shrink-0 mt-0.5">📲</span>
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

  // Running in browser tab (not installed PWA) — show install instruction, no Ativar button
  if (!isInstalledPWA) {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-3 flex items-start gap-3">
        <span className="shrink-0 mt-0.5">📲</span>
        <p className="text-xs text-muted-foreground flex-1">
          Para ativar notificações, instale o Aurum Core: toque no menu do Chrome →{" "}
          <span className="text-foreground font-medium">'Adicionar à tela inicial'</span>
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Installed PWA — show normal banner with Ativar button
  const handleActivateNotifications = () => {
    if (!notifSupported) {
      alert("Seu navegador não suporta notificações.");
      setHidden(true);
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Aurum Core", {
          body: "Notificações ativadas com sucesso!",
          icon: "/icon-192.png"
        });
      }
      setHidden(true);
    });
  };

  return (
    <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
      <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">
        Ative notificações para não perder atualizações importantes.
      </p>
      <button
        onClick={handleActivateNotifications}
        className="text-xs text-gold hover:text-gold-hover transition-colors font-medium shrink-0"
      >
        Ativar
      </button>
      <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}