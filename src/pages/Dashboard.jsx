import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Clock, CheckCircle, ListTodo, Lightbulb } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import MetricCard from "../components/dashboard/MetricCard";
import moment from "moment";

export default function Dashboard() {
  const { user } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    base44.entities.Task.list("-created_date", 50).then(setTasks);
    base44.entities.Update.list("-created_date", 5).then(setUpdates);
    base44.entities.Idea.list("-created_date", 50).then(setIdeas);
  }, []);

  const todo = tasks.filter(t => t.status === "todo").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const done = tasks.filter(t => t.status === "done").length;
  const approvedIdeas = ideas.filter(i => i.status === "approved").length;

  const chartData = [
    { name: "A Fazer", value: todo, color: "#6b7280" },
    { name: "Andamento", value: inProgress, color: "#F5A623" },
    { name: "Concluído", value: done, color: "#22c55e" },
  ];

  const recentTasks = tasks.slice(0, 5);

  const statusLabel = { todo: "A Fazer", in_progress: "Em Andamento", done: "Concluído" };
  const statusColor = { todo: "bg-secondary text-muted-foreground", in_progress: "bg-gold/15 text-gold", done: "bg-green-500/15 text-green-400" };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo, {user?.full_name?.split(" ")[0] || "Usuário"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {moment().format("dddd, D [de] MMMM [de] YYYY")} · Aurum Club
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Clock} label="Em Andamento" value={inProgress} color="bg-gold/15 text-gold" />
        <MetricCard icon={CheckCircle} label="Concluídas" value={done} color="bg-green-500/15 text-green-400" />
        <MetricCard icon={ListTodo} label="A Fazer" value={todo} color="bg-secondary text-muted-foreground" />
        <MetricCard icon={Lightbulb} label="Ideias Aprovadas" value={approvedIdeas} color="bg-purple-500/15 text-purple-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Distribuição de Tarefas</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Tasks */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Tarefas Recentes</h2>
          <div className="space-y-3">
            {recentTasks.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>
            )}
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee_name || "Sem responsável"}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[task.status]}`}>
                  {statusLabel[task.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Últimas Atualizações</h2>
        <div className="space-y-3">
          {updates.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma atualização ainda.</p>
          )}
          {updates.map((up) => (
            <div key={up.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-gold">
                  {up.author_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">{up.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {up.author_name} · {moment(up.created_date).fromNow()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}