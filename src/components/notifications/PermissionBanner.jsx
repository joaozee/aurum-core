import { X, Bell } from "lucide-react";
import { useState } from "react";

export default function PermissionBanner({ onRequest }) {
  const [dismissed, setDismissed] = useState(false);
  const [requested, setRequested] = useState(false);

  if (dismissed || requested) return null;

  const handle = async () => {
    setRequested(true);
    await onRequest();
  };

  return (
    <div className="w-full bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
      <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">
        Ative notificações para não perder atualizações importantes.
      </p>
      <button
        onClick={handle}
        className="text-xs text-gold hover:text-gold-hover transition-colors font-medium shrink-0"
      >
        Ativar
      </button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}