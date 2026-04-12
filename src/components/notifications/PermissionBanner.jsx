import { X, Bell } from "lucide-react";
import { useState } from "react";

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export default function PermissionBanner() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  // Already granted — no banner needed
  if ("Notification" in window && Notification.permission === "granted") return null;

  // Already denied — show blocked message
  if ("Notification" in window && Notification.permission === "denied") {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
        <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">
          Notificações bloqueadas. Ative nas configurações do seu navegador.
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // iOS — show install instructions, no Ativar button
  if (isIOS) {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-3 flex items-start gap-3">
        <Bell className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground flex-1">
          No iPhone, instale o app primeiro: toque em{" "}
          <span className="text-foreground font-medium">Compartilhar → Adicionar à Tela de Início</span>.
          Depois ative as notificações.
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleActivateNotifications = () => {
    if (!("Notification" in window)) {
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