import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Grid, List, FolderPlus, Upload, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DocSidebar from "../components/documents/DocSidebar";
import DocListView from "../components/documents/DocListView";
import DocGridView from "../components/documents/DocGridView";
import DocContextMenu from "../components/documents/DocContextMenu";
import MoveToModal from "../components/documents/MoveToModal";
import { Menu } from "lucide-react";

export default function Documents() {
  const { user } = useOutletContext();
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [tab, setTab] = useState("docs");
  const [viewMode, setViewMode] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  // Dialogs
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameItem, setRenameItem] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [moveItem, setMoveItem] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, item }
  const [dragSource, setDragSource] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [folders, files] = await Promise.all([
      base44.entities.Folder.list("name", 500),
      base44.entities.Document.list("-modified_date", 500),
    ]);
    setAllFolders(folders);
    setAllFiles(files);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Navigate into folder
  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => {
      // If already in breadcrumbs, slice to it
      const idx = prev.findIndex(b => b.id === folder.id);
      if (idx >= 0) return prev.slice(0, idx + 1);
      return [...prev, folder];
    });
    setTab("docs");
    setSelectedId(null);
    setSearchQuery("");
  };

  const navigateToBreadcrumb = (index) => {
    if (index < 0) {
      setCurrentFolderId(null);
      setBreadcrumbs([]);
    } else {
      setCurrentFolderId(breadcrumbs[index].id);
      setBreadcrumbs(prev => prev.slice(0, index + 1));
    }
    setSelectedId(null);
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t !== "docs") {
      setCurrentFolderId(null);
      setBreadcrumbs([]);
    }
    setSelectedId(null);
    setSearchQuery("");
  };

  // Compute displayed folders/files
  const getDisplayItems = () => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return {
        folders: allFolders.filter(f => f.name.toLowerCase().includes(q)),
        files: allFiles.filter(f => f.name.toLowerCase().includes(q)),
      };
    }
    if (tab === "recent") {
      return { folders: [], files: [...allFiles].sort((a, b) => new Date(b.modified_date || b.updated_date) - new Date(a.modified_date || a.updated_date)).slice(0, 20) };
    }
    if (tab === "favorites") {
      return {
        folders: allFolders.filter(f => f.is_favorite),
        files: allFiles.filter(f => f.is_favorite),
      };
    }
    return {
      folders: allFolders.filter(f => (f.parent_folder_id || null) === currentFolderId),
      files: allFiles.filter(f => (f.folder_id || null) === currentFolderId),
    };
  };

  const { folders: displayFolders, files: displayFiles } = getDisplayItems();

  // File open/download
  const handleFileOpen = (file) => {
    if (file.file_url) window.open(file.file_url, "_blank");
  };

  // Upload
  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      setUploading(true);
      for (const file of Array.from(e.target.files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.Document.create({
          name: file.name,
          file_url,
          file_type: file.name.split(".").pop().toLowerCase(),
          file_size: file.size,
          folder_id: currentFolderId || undefined,
          author_name: user?.full_name || user?.email?.split("@")[0] || "Usuário",
          modified_date: new Date().toISOString(),
        });
      }
      await loadData();
      setUploading(false);
    };
    input.click();
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await base44.entities.Folder.create({
      name: newFolderName.trim(),
      parent_folder_id: currentFolderId || undefined,
    });
    await loadData();
    setShowNewFolder(false);
    setNewFolderName("");
  };

  // Rename
  const startRename = (item) => {
    setRenameItem(item);
    setRenameName(item.name);
  };
  const handleRename = async () => {
    if (!renameName.trim()) return;
    if (renameItem.type === "folder") {
      await base44.entities.Folder.update(renameItem.id, { name: renameName.trim() });
    } else {
      await base44.entities.Document.update(renameItem.id, { name: renameName.trim(), modified_date: new Date().toISOString() });
    }
    await loadData();
    setRenameItem(null);
  };

  // Favorite toggle
  const handleToggleFavorite = async (item) => {
    if (item.type === "folder") {
      await base44.entities.Folder.update(item.id, { is_favorite: !item.is_favorite });
    } else {
      await base44.entities.Document.update(item.id, { is_favorite: !item.is_favorite });
    }
    await loadData();
  };

  // Delete
  const handleDelete = async (item) => {
    if (item.type === "folder") {
      await base44.entities.Folder.delete(item.id);
    } else {
      await base44.entities.Document.delete(item.id);
    }
    await loadData();
  };

  // Move
  const handleMove = async (targetFolderId) => {
    if (!moveItem) return;
    if (moveItem.type === "folder") {
      await base44.entities.Folder.update(moveItem.id, { parent_folder_id: targetFolderId || undefined });
    } else {
      await base44.entities.Document.update(moveItem.id, { folder_id: targetFolderId || undefined, modified_date: new Date().toISOString() });
    }
    await loadData();
    setMoveItem(null);
  };

  // Context menu actions
  const handleContextAction = (action, item) => {
    if (action === "open") {
      if (item.type === "folder") navigateToFolder(item);
      else handleFileOpen(item);
    } else if (action === "download") {
      handleFileOpen(item);
    } else if (action === "rename") {
      startRename(item);
    } else if (action === "move") {
      setMoveItem(item);
    } else if (action === "favorite") {
      handleToggleFavorite(item);
    } else if (action === "delete") {
      handleDelete(item);
    }
  };

  // Drag and drop
  const handleDragStart = (source) => setDragSource(source);
  const handleDrop = async (target) => {
    if (!dragSource || dragSource.id === target.id) return;
    if (target.type !== "folder") return;
    if (dragSource.type === "folder") {
      await base44.entities.Folder.update(dragSource.id, { parent_folder_id: target.id });
    } else {
      await base44.entities.Document.update(dragSource.id, { folder_id: target.id, modified_date: new Date().toISOString() });
    }
    await loadData();
    setDragSource(null);
  };

  const viewProps = {
    folders: displayFolders,
    files: displayFiles,
    onFolderOpen: navigateToFolder,
    onFileOpen: handleFileOpen,
    onContextMenu: (e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item }),
    onToggleFavorite: handleToggleFavorite,
    onDragStart: handleDragStart,
    onDrop: handleDrop,
    selectedId,
    onSelect: setSelectedId,
    searchQuery,
  };

  return (
    <div
      className="flex h-[calc(100vh-7.5rem)] rounded-xl overflow-hidden border border-border relative"
      style={{ background: "#0a0a0a" }}
      onClick={() => { setSelectedId(null); setContextMenu(null); setMobileSidebarOpen(false); }}
    >
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className={`${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } md:relative fixed left-0 top-0 h-full z-40 transition-transform duration-300`}
        onClick={e => e.stopPropagation()}
      >
        <DocSidebar
          allFolders={allFolders}
          currentFolderId={currentFolderId}
          tab={tab}
          onTabChange={(t) => { handleTabChange(t); setMobileSidebarOpen(false); }}
          onNavigate={(f) => { navigateToFolder(f); setMobileSidebarOpen(false); }}
          onUpload={handleUpload}
          onNewFolder={() => setShowNewFolder(true)}
          uploading={uploading}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b border-border flex items-center gap-3 px-4 shrink-0" style={{ background: "#111111" }}>
          {/* Mobile nav toggle */}
          <button
            onClick={e => { e.stopPropagation(); setMobileSidebarOpen(o => !o); }}
            className="md:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2.5 py-1 shrink-0"
          >
            <Menu className="w-3.5 h-3.5" /> Navegar
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-1 min-w-0 overflow-hidden">
            <button onClick={() => navigateToBreadcrumb(-1)} className={`hover:text-foreground transition-colors whitespace-nowrap ${!currentFolderId && tab === "docs" ? "text-foreground" : ""}`}>
              Documentos
            </button>
            {tab === "recent" && <><ChevronRight className="w-3 h-3 shrink-0" /><span className="text-foreground">Recentes</span></>}
            {tab === "favorites" && <><ChevronRight className="w-3 h-3 shrink-0" /><span className="text-foreground">Favoritos</span></>}
            {breadcrumbs.map((bc, i) => (
              <span key={bc.id} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3 h-3 shrink-0" />
                <button
                  onClick={() => navigateToBreadcrumb(i)}
                  className={`hover:text-foreground transition-colors truncate ${i === breadcrumbs.length - 1 ? "text-foreground" : ""}`}
                >
                  {bc.name}
                </button>
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-xs bg-secondary border-border w-44"
            />
          </div>

          {/* View toggle */}
          <div className="flex gap-0.5">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground"}`}>
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={e => { e.stopPropagation(); setShowNewFolder(true); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2.5 py-1"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Nova Pasta
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleUpload(); }}
            className="flex items-center gap-1.5 text-xs bg-gold hover:bg-gold-hover text-black rounded-lg px-2.5 py-1 font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
        </div>

        {/* Content */}
        {viewMode === "list"
          ? <DocListView {...viewProps} />
          : <DocGridView {...viewProps} />
        }
      </div>

      {/* Context menu */}
      {contextMenu && (
        <DocContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={() => setContextMenu(null)}
          onAction={(action) => handleContextAction(action, contextMenu.item)}
        />
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent className="bg-card border-border" onClick={e => e.stopPropagation()}>
          <DialogHeader><DialogTitle>Nova Pasta</DialogTitle></DialogHeader>
          <Input
            autoFocus
            placeholder="Nome da pasta"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateFolder()}
            className="bg-secondary border-border"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancelar</Button>
            <Button onClick={handleCreateFolder} className="bg-gold hover:bg-gold-hover text-black">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameItem} onOpenChange={() => setRenameItem(null)}>
        <DialogContent className="bg-card border-border" onClick={e => e.stopPropagation()}>
          <DialogHeader><DialogTitle>Renomear</DialogTitle></DialogHeader>
          <Input
            autoFocus
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleRename()}
            className="bg-secondary border-border"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameItem(null)}>Cancelar</Button>
            <Button onClick={handleRename} className="bg-gold hover:bg-gold-hover text-black">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move To Modal */}
      <MoveToModal
        open={!!moveItem}
        onClose={() => setMoveItem(null)}
        onMove={handleMove}
        allFolders={allFolders}
        excludeId={moveItem?.type === "folder" ? moveItem?.id : null}
      />
    </div>
  );
}