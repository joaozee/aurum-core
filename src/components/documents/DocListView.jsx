import { useState } from "react";
import { Star, ChevronUp, ChevronDown } from "lucide-react";
import FileTypeIcon, { extLabel, formatSize } from "./FileTypeIcon";
import moment from "moment";

export default function DocListView({
  folders, files, onFolderOpen, onFileOpen,
  onContextMenu, onToggleFavorite, onDragStart, onDrop,
  selectedId, onSelect, searchQuery
}) {
  const [sort, setSort] = useState({ col: "name", dir: "asc" });

  const toggleSort = (col) => {
    setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
  };

  const sortFn = (a, b) => {
    let va, vb;
    if (sort.col === "name") { va = a.name?.toLowerCase(); vb = b.name?.toLowerCase(); }
    else if (sort.col === "author") { va = a.author_name || a.created_by || ""; vb = b.author_name || b.created_by || ""; }
    else if (sort.col === "modified") { va = a.modified_date || a.updated_date || ""; vb = b.modified_date || b.updated_date || ""; }
    else if (sort.col === "type") { va = extLabel(a.name); vb = extLabel(b.name); }
    return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  };

  const SortIcon = ({ col }) => {
    if (sort.col !== col) return null;
    return sort.dir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const thCls = "text-left text-[10px] text-muted-foreground uppercase tracking-wider font-medium pb-2 cursor-pointer hover:text-foreground select-none";

  const sortedFolders = [...folders].sort(sortFn);
  const sortedFiles = [...files].sort(sortFn);
  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileTypeIcon name="" isFolder size={48} />
          <p className="mt-4 text-sm">{searchQuery ? "Nenhum resultado encontrado." : "Esta pasta está vazia."}</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={thCls} onClick={() => toggleSort("name")}>Nome <SortIcon col="name" /></th>
              <th className={thCls} onClick={() => toggleSort("author")}>Autor <SortIcon col="author" /></th>
              <th className={thCls} onClick={() => toggleSort("modified")}>Modificado <SortIcon col="modified" /></th>
              <th className={thCls} onClick={() => toggleSort("type")}>Tipo <SortIcon col="type" /></th>
              <th className="w-8 pb-2" />
            </tr>
          </thead>
          <tbody>
            {sortedFolders.map(f => (
              <tr
                key={"folder-" + f.id}
                draggable
                onDragStart={() => onDragStart({ type: "folder", id: f.id })}
                onDragOver={e => e.preventDefault()}
                onDrop={(e) => { e.stopPropagation(); onDrop({ type: "folder", id: f.id }); }}
                onDoubleClick={() => onFolderOpen(f)}
                onClick={() => onSelect("folder-" + f.id)}
                onContextMenu={e => { e.preventDefault(); onContextMenu(e, { ...f, type: "folder" }); }}
                className={`border-b border-border/50 cursor-pointer transition-colors group ${
                  selectedId === "folder-" + f.id ? "bg-gold/10" : "hover:bg-secondary/60"
                }`}
              >
                <td className="py-2 text-sm text-foreground">
                  <div className="flex items-center gap-2.5">
                    <FileTypeIcon isFolder size={16} />
                    {f.name}
                  </div>
                </td>
                <td className="py-2 text-xs text-muted-foreground">{f.created_by?.split("@")[0] || "—"}</td>
                <td className="py-2 text-xs text-muted-foreground">{moment(f.updated_date).format("DD/MM/YY HH:mm")}</td>
                <td className="py-2 text-xs text-muted-foreground">Pasta</td>
                <td className="py-2">
                  <button onClick={e => { e.stopPropagation(); onToggleFavorite({ ...f, type: "folder" }); }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${f.is_favorite ? "!opacity-100 text-gold" : "text-muted-foreground"}`}>
                    <Star className="w-3.5 h-3.5" fill={f.is_favorite ? "currentColor" : "none"} />
                  </button>
                </td>
              </tr>
            ))}
            {sortedFiles.map(f => (
              <tr
                key={"file-" + f.id}
                draggable
                onDragStart={() => onDragStart({ type: "file", id: f.id })}
                onDragOver={e => e.preventDefault()}
                onDoubleClick={() => onFileOpen(f)}
                onClick={() => onSelect("file-" + f.id)}
                onContextMenu={e => { e.preventDefault(); onContextMenu(e, { ...f, type: "file" }); }}
                className={`border-b border-border/50 cursor-pointer transition-colors group ${
                  selectedId === "file-" + f.id ? "bg-gold/10" : "hover:bg-secondary/60"
                }`}
              >
                <td className="py-2 text-sm text-foreground">
                  <div className="flex items-center gap-2.5">
                    <FileTypeIcon name={f.name} size={16} />
                    {f.name}
                  </div>
                </td>
                <td className="py-2 text-xs text-muted-foreground">{f.author_name || f.created_by?.split("@")[0] || "—"}</td>
                <td className="py-2 text-xs text-muted-foreground">{moment(f.modified_date || f.updated_date).format("DD/MM/YY HH:mm")}</td>
                <td className="py-2 text-xs text-muted-foreground">{extLabel(f.name)} {f.file_size ? "· " + formatSize(f.file_size) : ""}</td>
                <td className="py-2">
                  <button onClick={e => { e.stopPropagation(); onToggleFavorite({ ...f, type: "file" }); }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${f.is_favorite ? "!opacity-100 text-gold" : "text-muted-foreground"}`}>
                    <Star className="w-3.5 h-3.5" fill={f.is_favorite ? "currentColor" : "none"} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}