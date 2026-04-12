import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildPayload(entityName, eventType, data, oldData) {
  const d = data || {};
  const old = oldData || {};

  switch (entityName) {
    case 'Task': {
      if (eventType === 'create') {
        return { icon: '📋', title: `📋 Nova tarefa criada: ${d.title}`, link: '/tarefas', actor: d.created_by };
      }
      if (eventType === 'update') {
        if (d.status === 'in_progress' && old.status !== 'in_progress') {
          return { icon: '🔄', title: `🔄 Tarefa em andamento: ${d.title}`, link: '/tarefas', actor: d.created_by };
        }
        if (d.status === 'done' && old.status !== 'done') {
          return { icon: '✅', title: `✅ Tarefa concluída: ${d.title}`, link: '/tarefas', actor: d.created_by };
        }
        return { icon: '✏️', title: `✏️ Tarefa atualizada: ${d.title}`, link: '/tarefas', actor: d.created_by };
      }
      if (eventType === 'delete') {
        return { icon: '🗑️', title: `🗑️ Tarefa removida: ${d.title || 'sem título'}`, link: '/tarefas', actor: d.created_by };
      }
      break;
    }
    case 'Message': {
      if (eventType === 'create') {
        const preview = (d.text || '').slice(0, 60);
        return { icon: '💬', title: `💬 ${d.sender_name || 'Alguém'}: ${preview}`, link: '/comunicacao', actor: d.sender_email };
      }
      break;
    }
    case 'Update': {
      if (eventType === 'create') {
        return { icon: '📢', title: `📢 ${d.author_name || 'Alguém'} publicou uma atualização`, link: '/atualizacoes', actor: d.author_email };
      }
      break;
    }
    case 'Decision': {
      if (eventType === 'create') {
        return { icon: '⚖️', title: `⚖️ Nova decisão: ${d.title}`, link: '/decisoes', actor: d.created_by };
      }
      if (eventType === 'update') {
        return { icon: '✏️', title: `✏️ Decisão atualizada: ${d.title}`, link: '/decisoes', actor: d.created_by };
      }
      break;
    }
    case 'Idea': {
      if (eventType === 'create') {
        return { icon: '💡', title: `💡 Nova ideia: ${d.title}`, link: '/ideias', actor: d.author_email || d.created_by };
      }
      if (eventType === 'update') {
        const statusLabels = { new: 'Nova', analyzing: 'Em análise', approved: 'Aprovada', rejected: 'Rejeitada' };
        const label = statusLabels[d.status] || d.status;
        return { icon: '💡', title: `💡 Ideia "${d.title}" agora está: ${label}`, link: '/ideias', actor: d.created_by };
      }
      break;
    }
    case 'Document': {
      if (eventType === 'create') {
        return { icon: '📄', title: `📄 Novo arquivo: ${d.name}`, link: '/documentos', actor: d.created_by };
      }
      break;
    }
    case 'Folder': {
      if (eventType === 'create') {
        return { icon: '📁', title: `📁 Nova pasta criada: ${d.name}`, link: '/documentos', actor: d.created_by };
      }
      break;
    }
    default:
      return null;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    if (!event) {
      return Response.json({ error: 'Missing event' }, { status: 400 });
    }

    const payload = buildPayload(event.entity_name, event.type, data, old_data);
    if (!payload) {
      return Response.json({ skipped: true });
    }

    const users = await base44.asServiceRole.entities.User.list();
    const targets = users.filter(u => u.email && u.email !== payload.actor);

    await Promise.all(
      targets.map(u =>
        base44.asServiceRole.entities.Notification.create({
          user_email: u.email,
          type: payload.icon,
          icon: payload.icon,
          title: payload.title,
          body: payload.title,
          link: payload.link,
          read: false,
        })
      )
    );

    return Response.json({ sent: targets.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});