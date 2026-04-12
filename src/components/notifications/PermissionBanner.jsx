import { X, Bell } from "lucide-react";
import { useState } from "react";

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const notifSupported = "Notification" in window;

export default function PermissionBanner() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;
  if (notifSupported && Notification.permission === "granted") return null;

  if (notifSupported && Notification.permission === "denied") {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
        <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">
          Notificações bloqueadas. Ative nas configurações do navegador.
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="w-full bg-secondary border-b border-border px-4 py-3 flex items-start gap-3">
        <span className="shrink-0 mt-0.5">📲</span>
        <p className="text-xs text-muted-foreground flex-1">
          Para ativar notificações no iPhone: toque em{" "}
          <span className="text-foreground font-medium">Compartilhar → Adicionar à Tela de Início</span>
        </p>
        <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleActivate = () => {
    if (!notifSupported) {
      alert("Seu navegador não suporta notificações.");
      setHidden(true);
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Aurum Core", {
          body: "Notificações ativadas com sucesso! ✅",
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
        onClick={handleActivate}
        className="text-xs text-gold hover:text-gold-hover font-medium shrink-0"
      >
        Ativar
      </button>
      <button onClick={() => setHidden(true)} className="text-muted-foreground hover:text-foreground shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}