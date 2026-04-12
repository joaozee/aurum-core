import { useEffect, useRef } from "react";
import { FolderOpen, Pencil, FolderInput, Star, Trash2, Download } from "lucide-react";

export default function DocContextMenu({ x, y, item, onClose, onAction }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Adjust so menu doesn't go off screen
  const style = {
    position: "fixed",
    top: Math.min(y, window.innerHeight - 240),
    left: Math.min(x, window.innerWidth - 200),
    zIndex: 9999,
  };

  const menuItems = [
    { icon: FolderOpen, label: "Abrir", action: "open" },
    item?.type === "file" && { icon: Download, label: "Download", action: "download" },
    { icon: Pencil, label: "Renomear", action: "rename" },
    { icon: FolderInput, label: "Mover para", action: "move" },
    { icon: Star, label: item?.is_favorite ? "Remover dos favoritos" : "Favoritar", action: "favorite" },
    { divider: true },
    { icon: Trash2, label: "Excluir", action: "delete", danger: true },
  ].filter(Boolean);

  return (
    <div
      ref={ref}
      style={style}
      className="bg-card border border-border rounded-xl shadow-2xl py-1.5 w-48 text-sm"
    >
      {menuItems.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 border-t border-border" />
        ) : (
          <button
            key={item.action}
            onClick={() => { onAction(item.action); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors ${
              item.danger
                ? "text-red-400 hover:bg-red-500/10"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {item.label}
          </button>
        )
      )}
    </div>
  );
}