import { X, Download } from "lucide-react";

export default function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div className="w-full bg-gold/10 border-b border-gold/30 px-4 py-2.5 flex items-center gap-3">
      <span className="text-lg">📱</span>
      <p className="text-xs text-foreground flex-1">
        <span className="font-medium">Instale o Aurum Core no seu celular</span>
        <span className="text-muted-foreground ml-1">para acesso rápido e notificações.</span>
      </p>
      <button
        onClick={onInstall}
        className="flex items-center gap-1.5 text-xs bg-gold hover:bg-gold-hover text-black font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        <Download className="w-3 h-3" /> Instalar
      </button>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}