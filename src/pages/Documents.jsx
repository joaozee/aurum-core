import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FolderPlus, Upload, Folder, File, Download, Star, ChevronRight, Grid, List, Clock, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import moment from "moment";

export default function Documents() {
  const { user } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [view, setView] = useState("list");
  const [tab, setTab] = useState("docs");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    const [docs, flds] = await Promise.all([
      base44.entities.Document.list("-created_date", 200),
      base44.entities.Folder.list("name", 100),
    ]);
    setDocuments(docs);
    setFolders(flds);
  };

  useEffect(() => { loadData(); }, []);

  const navigateTo = (folder) => {
    if (folder) {
      setCurrentFolder(folder.id);
      setBreadcrumbs(prev => [...prev, folder]);
    } else {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    }
    setTab("docs");
  };

  const navigateBreadcrumb = (index) => {
    if (index < 0) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const folder = breadcrumbs[index];
      setCurrentFolder(folder.id);
      setBreadcrumbs(prev => prev.slice(0, index + 1));
    }
  };

  const currentFolders = folders.filter(f => (f.parent_id || null) === currentFolder);
  
  const currentDocs = tab === "docs"
    ? documents.filter(d => (d.folder_id || null) === currentFolder)
    : tab === "recent"
    ? [...documents].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)).slice(0, 20)
    : documents.filter(d => d.is_favorite);

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      setUploading(true);
      for (const file of e.target.files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.Document.create({
          name: file.name,
          file_url,
          file_type: file.type || file.name.split(".").pop(),
          file_size: file.size,
          folder_id: currentFolder || undefined,
          author_name: user?.full_name || "Usuário",
        });
      }
      await loadData();
      setUploading(false);
    };
    input.click();
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    await base44.entities.Folder.create({ name: folderName.trim(), parent_id: currentFolder || undefined });
    await loadData();
    setShowNewFolder(false);
    setFolderName("");
  };

  const toggleFavorite = async (doc) => {
    await base44.entities.Document.update(doc.id, { is_favorite: !doc.is_favorite });
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, is_favorite: !d.is_favorite } : d));
  };

  const sidebarItems = [
    { id: "docs", icon: File, label: "Documentos" },
    { id: "recent", icon: Clock, label: "Recentes" },
    { id: "favorites", icon: Heart, label: "Favoritos" },
  ];

  return (
    <div className="flex h-[calc(100vh-7.5rem)] gap-0 rounded-xl overflow-hidden border border-border bg-card">
      {/* Sidebar */}
      <div className="w-56 border-r border-border flex flex-col shrink-0 p-3 space-y-4">
        <div className="space-y-1">
          <Button onClick={handleUpload} disabled={uploading} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs border-border">
            <Upload className="w-3.5 h-3.5" /> {uploading ? "Enviando..." : "Upload de Arquivo"}
          </Button>
          <Button onClick={() => setShowNewFolder(true)} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs border-border">
            <FolderPlus className="w-3.5 h-3.5" /> Nova Pasta
          </Button>
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Navegação</p>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); if (item.id !== "docs") { setCurrentFolder(null); setBreadcrumbs([]); }}}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                tab === item.id ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" /> {item.label}
            </button>
          ))}
        </div>

        {folders.filter(f => !f.parent_id).length > 0 && (
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pastas</p>
            {folders.filter(f => !f.parent_id).map(f => (
              <button
                key={f.id}
                onClick={() => navigateTo(f)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  currentFolder === f.id ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Folder className="w-3.5 h-3.5" /> {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => navigateBreadcrumb(-1)} className="hover:text-foreground transition-colors">Documentos</button>
            {breadcrumbs.map((bc, i) => (
              <span key={bc.id} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => navigateBreadcrumb(i)} className="hover:text-foreground transition-colors">{bc.name}</button>
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "text-gold" : "text-muted-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "text-gold" : "text-muted-foreground"}`}>
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === "list" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="pb-2 font-medium">Nome</th>
                  <th className="pb-2 font-medium">Autor</th>
                  <th className="pb-2 font-medium">Modificado</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {tab === "docs" && currentFolders.map(f => (
                  <tr key={f.id} onClick={() => navigateTo(f)} className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                    <td className="py-2.5 text-sm text-foreground flex items-center gap-2">
                      <Folder className="w-4 h-4 text-gold" /> {f.name}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">—</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{moment(f.updated_date).format("DD/MM/YY")}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">Pasta</td>
                    <td></td>
                  </tr>
                ))}
                {currentDocs.map(doc => (
                  <tr key={doc.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2.5 text-sm text-foreground flex items-center gap-2">
                      <File className="w-4 h-4 text-muted-foreground" /> {doc.name}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{doc.author_name}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{moment(doc.updated_date).format("DD/MM/YY")}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{doc.file_type || "—"}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleFavorite(doc)} className={`${doc.is_favorite ? "text-gold" : "text-muted-foreground"} hover:text-gold transition-colors`}>
                          <Star className="w-3.5 h-3.5" fill={doc.is_favorite ? "currentColor" : "none"} />
                        </button>
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {currentDocs.length === 0 && currentFolders.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhum documento</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {tab === "docs" && currentFolders.map(f => (
                <button key={f.id} onClick={() => navigateTo(f)} className="bg-secondary rounded-xl p-4 text-center hover:border-gold/30 border border-transparent transition-colors">
                  <Folder className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-xs text-foreground truncate">{f.name}</p>
                </button>
              ))}
              {currentDocs.map(doc => (
                <div key={doc.id} className="bg-secondary rounded-xl p-4 text-center border border-transparent hover:border-gold/30 transition-colors">
                  <File className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-foreground truncate">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{doc.author_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nova Pasta</DialogTitle></DialogHeader>
          <div>
            <Label className="text-xs text-muted-foreground">Nome da Pasta</Label>
            <Input value={folderName} onChange={e => setFolderName(e.target.value)} className="bg-secondary border-border mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancelar</Button>
            <Button onClick={handleCreateFolder} className="bg-gold hover:bg-gold-hover text-black">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}