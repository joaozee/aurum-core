import { PREDEFINED_TAGS } from "@/utils/taskTags";

export default function TaskFilterBar({ activeTag, onFilterChange, tasks }) {
  // Collect all unique tags from existing tasks
  const usedCustomTags = [];
  tasks.forEach(t => {
    (t.tags || []).forEach(tag => {
      if (!PREDEFINED_TAGS.some(p => p.name === tag.name) && !usedCustomTags.some(c => c.name === tag.name)) {
        usedCustomTags.push(tag);
      }
    });
  });

  const allTags = [...PREDEFINED_TAGS, ...usedCustomTags];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onFilterChange(null)}
        className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
          !activeTag ? "bg-gold text-black" : "bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        Todas
      </button>
      {allTags.map(tag => {
        const isActive = activeTag?.name === tag.name;
        return (
          <button
            key={tag.name}
            onClick={() => onFilterChange(isActive ? null : tag)}
            className="text-xs px-3 py-1.5 rounded-full transition-all font-medium border"
            style={{
              background: isActive ? tag.color + "33" : "transparent",
              borderColor: isActive ? tag.color : "transparent",
              color: isActive ? tag.color : "#888",
              backgroundColor: isActive ? tag.color + "22" : "hsl(0 0% 12%)",
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}