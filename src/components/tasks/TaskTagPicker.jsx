import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PREDEFINED_TAGS } from "@/utils/taskTags";

const CUSTOM_COLORS = [
  "#3B82F6", "#EF4444", "#8B5CF6", "#10B981",
  "#EC4899", "#F97316", "#6B7280", "#EAB308",
  "#14B8A6", "#F43F5E",
];

export default function TaskTagPicker({ selected = [], onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState("#3B82F6");

  const isSelected = (name) => selected.some(t => t.name === name);

  const toggle = (tag) => {
    if (isSelected(tag.name)) {
      onChange(selected.filter(t => t.name !== tag.name));
    } else {
      onChange([...selected, tag]);
    }
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const tag = { name: customName.trim(), color: customColor };
    if (!isSelected(tag.name)) {
      onChange([...selected, tag]);
    }
    setCustomName("");
    setShowCustom(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PREDEFINED_TAGS.map(tag => (
          <button
            key={tag.name}
            type="button"
            onClick={() => toggle(tag)}
            className="text-xs px-2.5 py-1 rounded-full font-medium transition-all border"
            style={{
              background: isSelected(tag.name) ? tag.color + "33" : "transparent",
              borderColor: tag.color,
              color: tag.color,
              opacity: isSelected(tag.name) ? 1 : 0.55,
            }}
          >
            {tag.name}
          </button>
        ))}
        {/* Custom tags already added */}
        {selected.filter(t => !PREDEFINED_TAGS.some(p => p.name === t.name)).map(tag => (
          <button
            key={tag.name}
            type="button"
            onClick={() => toggle(tag)}
            className="text-xs px-2.5 py-1 rounded-full font-medium transition-all border"
            style={{
              background: tag.color + "33",
              borderColor: tag.color,
              color: tag.color,
            }}
          >
            {tag.name} ×
          </button>
        ))}
      </div>

      {!showCustom ? (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> nova tag
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            autoFocus
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Nome da tag"
            className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground w-32 outline-none"
          />
          <div className="flex gap-1 flex-wrap">
            {CUSTOM_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCustomColor(c)}
                className="w-4 h-4 rounded-full border-2 transition-transform"
                style={{
                  background: c,
                  borderColor: customColor === c ? "#fff" : "transparent",
                  transform: customColor === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <button type="button" onClick={addCustom} className="text-xs bg-gold text-black px-2 py-1 rounded font-medium hover:bg-gold-hover transition-colors">
            Adicionar
          </button>
          <button type="button" onClick={() => setShowCustom(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}