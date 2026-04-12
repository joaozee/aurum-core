import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight } from "lucide-react";

function FolderNode({ folder, allFolders, depth, selected, onSelect, excludeId }) {
  const children = allFolders.filter(f => f.parent_folder_id === folder.id && f.id !== excludeId);
  if (folder.id === excludeId) return null;
  return (
    <div>
      <button
        onClick={() => onSelect(folder.id)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
          selected === folder.id ? "bg-gold/15 text-gold" : "text-foreground hover:bg-secondary"
        }`}
        style={{ paddingLeft: 12 + depth * 16 }}
      >
        <Folder className="w-3.5 h-3.5 text-gold shrink-0" />
        {folder.name}
      </button>
      {children.map(child => (
        <FolderNode key={child.id} folder={child} allFolders={allFolders} depth={depth + 1} selected={selected} onSelect={onSelect} excludeId={excludeId} />
      ))}
    </div>
  );
}

export default function MoveToModal({ open, onClose, onMove, allFolders, excludeId }) {
  const [selected, setSelected] = useState(null);
  const rootFolders = allFolders.filter(f => !f.parent_folder_id && f.id !== excludeId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader><DialogTitle>Mover para</DialogTitle></DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          <button
            onClick={() => setSelected("root")}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
              selected === "root" ? "bg-gold/15 text-gold" : "text-foreground hover:bg-secondary"
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-gold" /> Documentos (raiz)
          </button>
          {rootFolders.map(f => (
            <FolderNode key={f.id} folder={f} allFolders={allFolders} depth={0} selected={selected} onSelect={setSelected} excludeId={excludeId} />
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
          <Button
            disabled={selected === null}
            onClick={() => { onMove(selected === "root" ? null : selected); onClose(false); setSelected(null); }}
            className="bg-gold hover:bg-gold-hover text-black"
          >Mover</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}