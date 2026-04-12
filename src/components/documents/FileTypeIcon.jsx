import { FileText, FileImage, FileVideo, File, FileSpreadsheet, Presentation, Folder } from "lucide-react";

const EXT_CONFIG = {
  pdf:  { icon: FileText,        color: "#EF4444" },
  doc:  { icon: FileText,        color: "#3B82F6" },
  docx: { icon: FileText,        color: "#3B82F6" },
  xls:  { icon: FileSpreadsheet, color: "#10B981" },
  xlsx: { icon: FileSpreadsheet, color: "#10B981" },
  ppt:  { icon: Presentation,    color: "#F97316" },
  pptx: { icon: Presentation,    color: "#F97316" },
  png:  { icon: FileImage,       color: "#8B5CF6" },
  jpg:  { icon: FileImage,       color: "#8B5CF6" },
  jpeg: { icon: FileImage,       color: "#8B5CF6" },
  gif:  { icon: FileImage,       color: "#8B5CF6" },
  mp4:  { icon: FileVideo,       color: "#EC4899" },
  mov:  { icon: FileVideo,       color: "#EC4899" },
  txt:  { icon: FileText,        color: "#6B7280" },
};

export default function FileTypeIcon({ name = "", size = 16, isFolder = false }) {
  if (isFolder) {
    return <Folder style={{ width: size, height: size, color: "#F5A623" }} />;
  }
  const ext = (name.split(".").pop() || "").toLowerCase();
  const cfg = EXT_CONFIG[ext] || { icon: File, color: "#6B7280" };
  const Icon = cfg.icon;
  return <Icon style={{ width: size, height: size, color: cfg.color }} />;
}

export function extLabel(name = "") {
  const ext = (name.split(".").pop() || "").toUpperCase();
  return ext || "—";
}

export function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}