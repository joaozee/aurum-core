import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Hash, Plus, Send, Search, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import moment from "moment";

export default function Communication() {
  const { user } = useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const messagesEnd = useRef(null);

  useEffect(() => {
    base44.entities.Conversation.list("-updated_date", 50).then(setConversations);
  }, []);

  useEffect(() => {
    if (selected) {
      base44.entities.Message.filter({ conversation_id: selected.id }, "created_date", 100).then(setMessages);
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === selected.id) {
        if (event.type === "create") setMessages(prev => [...prev, event.data]);
      }
    });
    return unsub;
  }, [selected]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selected) return;
    const msg = {
      conversation_id: selected.id,
      text: newMsg.trim(),
      sender_name: user?.full_name || "Usuário",
      sender_email: user?.email || "",
    };
    setNewMsg("");
    await base44.entities.Message.create(msg);
    await base44.entities.Conversation.update(selected.id, {
      last_message: newMsg.trim(),
      last_message_date: new Date().toISOString(),
    });
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const conv = await base44.entities.Conversation.create({
      name: newName.trim(),
      participants: [user?.email],
    });
    setConversations(prev => [conv, ...prev]);
    setSelected(conv);
    setShowNew(false);
    setNewName("");
  };

  const filtered = conversations.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-7.5rem)] gap-0 rounded-xl overflow-hidden border border-border bg-card">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Conversas</h2>
            <button onClick={() => setShowNew(true)} className="text-gold hover:text-gold-hover transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-secondary border-border"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full text-left px-3 py-3 border-b border-border transition-colors ${
                selected?.id === conv.id ? "bg-gold/10" : "hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{conv.name}</span>
              </div>
              {conv.last_message && (
                <p className="text-xs text-muted-foreground mt-1 truncate pl-5">{conv.last_message}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Hash className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Selecione uma conversa</p>
          </div>
        ) : (
          <>
            <div className="h-12 border-b border-border flex items-center px-4 gap-2 shrink-0">
              <Hash className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-foreground">{selected.name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.sender_email === user?.email;
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? "justify-end" : ""}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-gold">{msg.sender_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className={`max-w-[65%] ${isMe ? "bg-gold/15 rounded-2xl rounded-tr-md" : "bg-secondary rounded-2xl rounded-tl-md"} px-3.5 py-2`}>
                      {!isMe && <p className="text-[10px] font-medium text-gold mb-0.5">{msg.sender_name}</p>}
                      <p className="text-sm text-foreground">{msg.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{moment(msg.created_date).format("HH:mm")}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEnd} />
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-secondary border-border text-sm"
              />
              <Button onClick={handleSend} size="icon" className="bg-gold hover:bg-gold-hover text-black">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Conversa</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome da conversa"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-secondary border-border"
          />
          <DialogFooter>
            <Button onClick={handleCreate} className="bg-gold hover:bg-gold-hover text-black">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}