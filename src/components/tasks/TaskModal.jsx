import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function TaskModal({ open, onClose, onSave, task }) {
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", due_date: "", assignee_name: "", status: "todo",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        due_date: task.due_date || "",
        assignee_name: task.assignee_name || "",
        status: task.status || "todo",
      });
    } else {
      setForm({ title: "", description: "", priority: "medium", due_date: "", assignee_name: "", status: "todo" });
    }
  }, [task, open]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary border-border mt-1 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Data Limite</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Responsável</Label>
            <Input value={form.assignee_name} onChange={e => setForm(f => ({ ...f, assignee_name: e.target.value }))} className="bg-secondary border-border mt-1" placeholder="Nome" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-gold hover:bg-gold-hover text-black">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}