export const PREDEFINED_TAGS = [
  { name: "Roteiro",  color: "#3B82F6" },
  { name: "Gravação", color: "#EF4444" },
  { name: "LGPD",     color: "#8B5CF6" },
  { name: "App",      color: "#10B981" },
  { name: "Instagram",color: "#EC4899" },
  { name: "Curso",    color: "#F97316" },
  { name: "Reunião",  color: "#6B7280" },
];

export function getTagColor(tagName) {
  const found = PREDEFINED_TAGS.find(t => t.name === tagName);
  return found ? found.color : "#6B7280";
}