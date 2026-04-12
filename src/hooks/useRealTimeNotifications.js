import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Watches entities for changes and creates Notification records for relevant users.
 * Each subscription targets a specific entity and event type.
 */
export function useRealTimeNotifications(user, createNotification) {
  useEffect(() => {
    if (!user?.email) return;

    const unsubs = [];

    // New Message → notify conversation participants
    unsubs.push(base44.entities.Message.subscribe(async (event) => {
      if (event.type !== "create") return;
      const msg = event.data;
      if (!msg || msg.sender_email === user.email) return;
      // Find conversation to check participants
      try {
        const convs = await base44.entities.Conversation.filter({ id: msg.conversation_id });
        const conv = convs[0];
        const participants = conv?.participants || [];
        if (participants.includes(user.email)) {
          await createNotification(user.email, {
            type: "message",
            icon: "💬",
            title: `💬 ${msg.sender_name || "Alguém"}: ${(msg.text || "").slice(0, 60)}`,
            body: msg.text || "",
            link: "/comunicacao",
          });
        }
      } catch {}
    }));

    // New Task assigned to current user
    unsubs.push(base44.entities.Task.subscribe(async (event) => {
      if (event.type !== "create") return;
      const task = event.data;
      if (!task || task.assignee !== user.email) return;
      await createNotification(user.email, {
        type: "task_assigned",
        icon: "📋",
        title: `📋 Nova tarefa: ${task.title}`,
        body: task.description || "",
        link: "/tarefas",
      });
    }));

    // Task moved to "done"
    unsubs.push(base44.entities.Task.subscribe(async (event) => {
      if (event.type !== "update") return;
      const task = event.data;
      if (!task || task.status !== "done") return;
      if (task.assignee !== user.email && task.created_by !== user.email) return;
      await createNotification(user.email, {
        type: "task_done",
        icon: "✅",
        title: `✅ Tarefa concluída: ${task.title}`,
        body: "",
        link: "/tarefas",
      });
    }));

    // New Decision
    unsubs.push(base44.entities.Decision.subscribe(async (event) => {
      if (event.type !== "create") return;
      const dec = event.data;
      if (!dec || dec.created_by === user.email) return;
      await createNotification(user.email, {
        type: "decision",
        icon: "⚖️",
        title: `⚖️ Nova decisão registrada: ${dec.title}`,
        body: dec.context || "",
        link: "/decisoes",
      });
    }));

    // New Update/post
    unsubs.push(base44.entities.Update.subscribe(async (event) => {
      if (event.type !== "create") return;
      const up = event.data;
      if (!up || up.author_email === user.email) return;
      await createNotification(user.email, {
        type: "update",
        icon: "📢",
        title: `📢 Nova atualização de ${up.author_name || "alguém"}`,
        body: (up.text || "").slice(0, 80),
        link: "/atualizacoes",
      });
    }));

    // Idea approved
    unsubs.push(base44.entities.Idea.subscribe(async (event) => {
      if (event.type !== "update") return;
      const idea = event.data;
      if (!idea || idea.status !== "approved") return;
      if (idea.author_email !== user.email) return;
      await createNotification(user.email, {
        type: "idea_approved",
        icon: "💡",
        title: `💡 Ideia aprovada: ${idea.title}`,
        body: "",
        link: "/ideias",
      });
    }));

    return () => unsubs.forEach(u => u && u());
  }, [user?.email, createNotification]);
}