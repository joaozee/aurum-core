import { useState } from "react";
import { Upload, FolderPlus, FileText, Clock, Star, Folder, ChevronRight, ChevronDown } from "lucide-react";

function FolderTreeNode({ folder, allFolders, currentFolderId, onNavigate, depth = 0 }) {
  const children = allFolders.filter(f => f.parent_folder_id === folder.id);
  const [open, setOpen] = useState(false);
  const isActive = currentFolderId === folder.id;
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors group ${
          isActive ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        }`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onNavigate(folder)}
      >
        {hasChildren ? (
          <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="shrink-0">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-gold" : "text-gold/60"}`} />
        <span className="text-xs truncate flex-1">{folder.name}</span>
      </div>
      {open && children.map(child => (
        <FolderTreeNode key={child.id} folder={child} allFolders={allFolders} currentFolderId={currentFolderId} onNavigate={onNavigate} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function DocSidebar({ allFolders, currentFolderId, tab, onTabChange, onNavigate, onUpload, onNewFolder, uploading }) {
  const rootFolders = allFolders.filter(f => !f.parent_folder_id);

  const navItems = [
    { id: "docs", icon: FileText, label: "Documentos" },
    { id: "recent", icon: Clock, label: "Recentes" },
    { id: "favorites", icon: Star, label: "Favoritos" },
  ];

  return (
    <div className="w-56 border-r border-border flex flex-col shrink-0" style={{ background: "#111111" }}>
      <div className="p-3 space-y-1.5 border-b border-border">
        <button
          onClick={onUpload}
          disabled={uploading}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gold hover:bg-gold-hover text-black transition-colors disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "Enviando..." : "Upload de Arquivo"}
        </button>
        <button
          onClick={onNewFolder}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" /> Nova Pasta
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Navegação</p>
          <div className="space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  tab === item.id && !currentFolderId ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {rootFolders.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Pastas</p>
            <div className="space-y-0.5">
              {rootFolders.map(f => (
                <FolderTreeNode
                  key={f.id}
                  folder={f}
                  allFolders={allFolders}
                  currentFolderId={currentFolderId}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}