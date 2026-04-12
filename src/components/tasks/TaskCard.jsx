import { Calendar } from "lucide-react";
import moment from "moment";

const priorityStyles = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-gold/15 text-gold",
  low: "bg-blue-500/15 text-blue-400",
};
const priorityLabel = { high: "Alta", medium: "Média", low: "Baixa" };

export default function TaskCard({ task, onClick, provided }) {
  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-gold/30 transition-colors group"
    >
      <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">{task.title}</p>
      {/* Tag badges */}
      {(task.tags || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {(task.tags || []).map(tag => (
            <span
              key={tag.name}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: tag.color + "22", color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {task.priority && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>
            {priorityLabel[task.priority]}
          </span>
        )}
        {task.due_date && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {moment(task.due_date).format("DD/MM")}
          </span>
        )}
        {task.assignee_name && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
            <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-[8px] text-gold font-semibold">{task.assignee_name.charAt(0).toUpperCase()}</span>
            </div>
            {task.assignee_name}
          </span>
        )}
      </div>
    </div>
  );
}