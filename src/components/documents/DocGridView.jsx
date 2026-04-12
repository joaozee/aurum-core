import { Star } from "lucide-react";
import FileTypeIcon, { formatSize } from "./FileTypeIcon";
import moment from "moment";

export default function DocGridView({
  folders, files, onFolderOpen, onFileOpen,
  onContextMenu, onToggleFavorite, onDragStart, onDrop,
  selectedId, onSelect, searchQuery
}) {
  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileTypeIcon isFolder size={48} name="" />
          <p className="mt-4 text-sm">{searchQuery ? "Nenhum resultado encontrado." : "Esta pasta está vazia."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {folders.map(f => (
            <div
              key={"folder-" + f.id}
              draggable
              onDragStart={() => onDragStart({ type: "folder", id: f.id })}
              onDragOver={e => e.preventDefault()}
              onDrop={(e) => { e.stopPropagation(); onDrop({ type: "folder", id: f.id }); }}
              onDoubleClick={() => onFolderOpen(f)}
              onClick={() => onSelect("folder-" + f.id)}
              onContextMenu={e => { e.preventDefault(); onContextMenu(e, { ...f, type: "folder" }); }}
              className={`relative group rounded-xl p-3 text-center cursor-pointer transition-colors border ${
                selectedId === "folder-" + f.id
                  ? "bg-gold/10 border-gold/30"
                  : "bg-secondary/50 border-transparent hover:border-border"
              }`}
            >
              <FileTypeIcon isFolder size={36} name="" />
              <p className="text-xs text-foreground mt-2 truncate">{f.name}</p>
              <p className="text-[10px] text-muted-foreground">{moment(f.updated_date).format("DD/MM/YY")}</p>
              <button
                onClick={e => { e.stopPropagation(); onToggleFavorite({ ...f, type: "folder" }); }}
                className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${f.is_favorite ? "!opacity-100 text-gold" : "text-muted-foreground"}`}
              >
                <Star className="w-3 h-3" fill={f.is_favorite ? "currentColor" : "none"} />
              </button>
            </div>
          ))}
          {files.map(f => (
            <div
              key={"file-" + f.id}
              draggable
              onDragStart={() => onDragStart({ type: "file", id: f.id })}
              onDragOver={e => e.preventDefault()}
              onDoubleClick={() => onFileOpen(f)}
              onClick={() => onSelect("file-" + f.id)}
              onContextMenu={e => { e.preventDefault(); onContextMenu(e, { ...f, type: "file" }); }}
              className={`relative group rounded-xl p-3 text-center cursor-pointer transition-colors border ${
                selectedId === "file-" + f.id
                  ? "bg-gold/10 border-gold/30"
                  : "bg-secondary/50 border-transparent hover:border-border"
              }`}
            >
              <div className="flex justify-center">
                <FileTypeIcon name={f.name} size={36} />
              </div>
              <p className="text-xs text-foreground mt-2 truncate">{f.name}</p>
              <p className="text-[10px] text-muted-foreground">{f.file_size ? formatSize(f.file_size) : moment(f.modified_date || f.updated_date).format("DD/MM/YY")}</p>
              <button
                onClick={e => { e.stopPropagation(); onToggleFavorite({ ...f, type: "file" }); }}
                className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${f.is_favorite ? "!opacity-100 text-gold" : "text-muted-foreground"}`}
              >
                <Star className="w-3 h-3" fill={f.is_favorite ? "currentColor" : "none"} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}