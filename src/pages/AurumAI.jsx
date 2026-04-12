import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Bot, Send, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

const quickActions = [
  "Resumo das tarefas pendentes",
  "O que decidimos recentemente?",
  "Resumo das conversas",
  "Próximas ações sugeridas",
];

export default function AurumAI() {
  const { user } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const contextParts = [];

    try {
      const [tasks, decisions, ideas, updates] = await Promise.all([
        base44.entities.Task.list("-created_date", 20),
        base44.entities.Decision.list("-created_date", 10),
        base44.entities.Idea.list("-created_date", 10),
        base44.entities.Update.list("-created_date", 10),
      ]);

      if (tasks.length) contextParts.push("TAREFAS: " + JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, assignee: t.assignee_name }))));
      if (decisions.length) contextParts.push("DECISÕES: " + JSON.stringify(decisions.map(d => ({ title: d.title, status: d.status, decision: d.decision }))));
      if (ideas.length) contextParts.push("IDEIAS: " + JSON.stringify(ideas.map(i => ({ title: i.title, status: i.status }))));
      if (updates.length) contextParts.push("ATUALIZAÇÕES: " + JSON.stringify(updates.map(u => ({ text: u.text, author: u.author_name }))));
    } catch (e) {
      // continue without context
    }

    const systemPrompt = `Você é o Aurum AI, assistente inteligente do Aurum Club. Você ajuda a equipe com resumos, análises e sugestões estratégicas. Responda sempre em português brasileiro, de forma clara e objetiva. Usuário atual: ${user?.full_name || "Membro"}.

CONTEXTO ATUAL DO AURUM CLUB:
${contextParts.join("\n\n")}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nPergunta do usuário: ${text.trim()}`,
        model: "claude_sonnet_4_6",
      });
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, houve um erro ao processar sua pergunta." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
          <Bot className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aurum AI</h1>
          <p className="text-sm text-muted-foreground">Assistente inteligente do Aurum Club</p>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-gold/30 transition-colors group"
            >
              <Sparkles className="w-4 h-4 text-gold mb-2" />
              <p className="text-sm text-foreground group-hover:text-gold transition-colors">{action}</p>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 min-h-[200px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-gold" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-gold/15 rounded-tr-md"
                : "bg-card border border-border rounded-tl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="text-sm text-foreground/90 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-foreground">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-gold animate-pulse" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-3 flex gap-3 items-end sticky bottom-6">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
          placeholder="Pergunte qualquer coisa ao Aurum AI..."
          className="bg-secondary border-border resize-none min-h-[48px] max-h-[120px] text-sm flex-1"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="bg-gold hover:bg-gold-hover text-black shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}