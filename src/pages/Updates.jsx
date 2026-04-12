import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ImagePlus, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";

export default function Updates() {
  const { user } = useOutletContext();
  const [updates, setUpdates] = useState([]);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    base44.entities.Update.list("-created_date", 50).then(setUpdates);
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    const up = await base44.entities.Update.create({
      text: text.trim(),
      image_url: imageUrl || undefined,
      author_name: user?.full_name || "Usuário",
      author_email: user?.email || "",
      reactions: { fire: [], heart: [], clap: [] },
    });
    setUpdates(prev => [up, ...prev]);
    setText("");
    setImageUrl("");
    setPosting(false);
  };

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setImageUrl(file_url);
      }
    };
    input.click();
  };

  const handleReaction = async (updateId, emoji) => {
    const up = updates.find(u => u.id === updateId);
    if (!up) return;
    const email = user?.email;
    const reactions = { ...up.reactions } || { fire: [], heart: [], clap: [] };
    const key = emoji === "🔥" ? "fire" : emoji === "❤️" ? "heart" : "clap";
    const arr = reactions[key] || [];
    if (arr.includes(email)) {
      reactions[key] = arr.filter(e => e !== email);
    } else {
      reactions[key] = [...arr, email];
    }
    await base44.entities.Update.update(updateId, { reactions });
    setUpdates(prev => prev.map(u => u.id === updateId ? { ...u, reactions } : u));
  };

  const emojiMap = { fire: "🔥", heart: "❤️", clap: "👏" };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aurum Updates</h1>
        <p className="text-sm text-muted-foreground mt-1">Feed interno do Aurum Club</p>
      </div>

      {/* Post box */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Compartilhe uma atualização..."
          className="bg-secondary border-border resize-none min-h-[80px] text-sm"
        />
        {imageUrl && (
          <img src={imageUrl} alt="preview" className="w-full max-h-48 object-cover rounded-lg" />
        )}
        <div className="flex items-center justify-between">
          <button onClick={handleImageUpload} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs">
            <ImagePlus className="w-4 h-4" /> Imagem
          </button>
          <Button onClick={handlePost} disabled={posting || !text.trim()} className="bg-gold hover:bg-gold-hover text-black text-sm px-5">
            Publicar
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {updates.map(up => (
          <div key={up.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-gold">{up.author_name?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{up.author_name}</p>
                <p className="text-[11px] text-muted-foreground">{moment(up.created_date).fromNow()}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{up.text}</p>
            {up.image_url && (
              <img src={up.image_url} alt="" className="w-full max-h-64 object-cover rounded-lg mt-3" />
            )}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              {Object.entries(emojiMap).map(([key, emoji]) => {
                const count = (up.reactions?.[key] || []).length;
                const isActive = (up.reactions?.[key] || []).includes(user?.email);
                return (
                  <button
                    key={key}
                    onClick={() => handleReaction(up.id, emoji)}
                    className={`flex items-center gap-1 text-xs px-3 py-2.5 md:px-2.5 md:py-1 rounded-full transition-colors min-h-[44px] md:min-h-0 ${
                      isActive ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {emoji} {count > 0 && count}
                  </button>
                );
              })}
              <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors ml-auto">
                <MessageCircle className="w-3 h-3" /> Comentar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}