import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "../components/tasks/TaskCard";
import TaskModal from "../components/tasks/TaskModal";

const columns = [
  { id: "todo", title: "A Fazer", color: "bg-secondary", dotColor: "bg-gray-500" },
  { id: "in_progress", title: "Em Andamento", color: "bg-gold/10", dotColor: "bg-gold" },
  { id: "done", title: "Concluído", color: "bg-green-500/10", dotColor: "bg-green-500" },
];

export default function Tasks() {
  const { user } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    base44.entities.Task.list("-created_date", 200).then(setTasks);
  }, []);

  const handleSave = async (form) => {
    if (editing) {
      const updated = await base44.entities.Task.update(editing.id, form);
      setTasks(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t));
    } else {
      const created = await base44.entities.Task.create(form);
      setTasks(prev => [created, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await base44.entities.Task.update(taskId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de tarefas da equipe</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-gold hover:bg-gold-hover text-black gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-xl border border-border p-3 min-h-[300px] ${snapshot.isDraggingOver ? "border-gold/30" : ""}`}
                    style={{ background: "#111111" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-semibold text-foreground">{col.title}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map((task, i) => (
                        <Draggable draggableId={task.id} index={i} key={task.id}>
                          {(provided) => (
                            <TaskCard
                              task={task}
                              provided={provided}
                              onClick={() => { setEditing(task); setModalOpen(true); }}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <TaskModal
        open={modalOpen}
        onClose={setModalOpen}
        onSave={handleSave}
        task={editing}
      />
    </div>
  );
}