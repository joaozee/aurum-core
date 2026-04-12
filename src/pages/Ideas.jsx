import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import moment from "moment";

const statusLabel = { new: "Nova", analyzing: "Em Análise", approved: "Aprovada", rejected: "Rejeitada" };
const statusStyle = {
  new: "bg-blue-500/15 text-blue-400",
  analyzing: "bg-gold/15 text-gold",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

const filters = ["all", "new", "analyzing", "approved", "rejected"];
const filterLabels = { all: "Todas", new: "Nova", analyzing: "Em Análise", approved: "Aprovada", rejected: "Rejeitada" };

export default function Ideas() {
  const { user } = useOutletContext();
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", impact: "" });

  useEffect(() => {
    base44.entities.Idea.list("-created_date", 100).then(setIdeas);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const idea = await base44.entities.Idea.create({
      ...form,
      status: "new",
      author_name: user?.full_name || "Usuário",
      author_email: user?.email || "",
    });
    setIdeas(prev => [idea, ...prev]);
    setShowModal(false);
    setForm({ title: "", description: "", category: "", impact: "" });
  };

  const filtered = filter === "all" ? ideas : ideas.filter(i => i.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aurum Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">Banco de ideias e inovação</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="hidden md:flex bg-gold hover:bg-gold-hover text-black gap-1.5">
          <Plus className="w-4 h-4" /> Nova Ideia
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f ? "bg-gold/15 text-gold border-gold/30" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gold hover:bg-gold-hover text-black flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 text-center py-10">Nenhuma ideia encontrada.</p>
        )}
        {filtered.map(idea => (
          <div key={idea.id} className="bg-card border border-border rounded-xl p-4 hover:border-gold/20 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{idea.title}</h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyle[idea.status]}`}>
                {statusLabel[idea.status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{idea.description}</p>
            {idea.category && <p className="text-[10px] text-gold mt-2">{idea.category}</p>}
            <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
              <span>{idea.author_name}</span>
              <span>·</span>
              <span>{moment(idea.created_date).format("DD/MM/YYYY")}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nova Ideia</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary border-border mt-1 resize-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Impacto Esperado</Label>
              <Textarea value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} className="bg-secondary border-border mt-1 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-hover text-black">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}