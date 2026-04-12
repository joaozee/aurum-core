import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from "moment";

const statusLabel = { pending: "Pendente", decided: "Decidido", implemented: "Implementado" };
const statusStyle = {
  pending: "bg-secondary text-muted-foreground",
  decided: "bg-gold/15 text-gold",
  implemented: "bg-green-500/15 text-green-400",
};

export default function Decisions() {
  const { user } = useOutletContext();
  const [decisions, setDecisions] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", context: "", options: "", decision: "", responsible_name: "", status: "pending" });

  useEffect(() => {
    base44.entities.Decision.list("-created_date", 100).then(setDecisions);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const d = await base44.entities.Decision.create({
      ...form,
      responsible: user?.email,
    });
    setDecisions(prev => [d, ...prev]);
    setShowModal(false);
    setForm({ title: "", context: "", options: "", decision: "", responsible_name: "", status: "pending" });
  };

  const filtered = decisions.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.context?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aurum Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Central de decisões estratégicas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-gold hover:bg-gold-hover text-black gap-1.5">
          <Plus className="w-4 h-4" /> Nova Decisão
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar decisões..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">Nenhuma decisão encontrada.</p>
        )}
        {filtered.map(d => (
          <div key={d.id} className="bg-card border border-border rounded-xl p-4 hover:border-gold/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{d.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.context}</p>
                {d.decision && (
                  <p className="text-xs text-gold mt-2">Decisão: {d.decision}</p>
                )}
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyle[d.status]}`}>
                {statusLabel[d.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
              {d.responsible_name && <span>{d.responsible_name}</span>}
              <span>{moment(d.created_date).format("DD/MM/YYYY")}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle>Nova Decisão</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contexto</Label>
              <Textarea value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} className="bg-secondary border-border mt-1 resize-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Opções Consideradas</Label>
              <Textarea value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} className="bg-secondary border-border mt-1 resize-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Decisão Tomada</Label>
              <Input value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Responsável</Label>
              <Input value={form.responsible_name} onChange={e => setForm(f => ({ ...f, responsible_name: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="decided">Decidido</SelectItem>
                  <SelectItem value="implemented">Implementado</SelectItem>
                </SelectContent>
              </Select>
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