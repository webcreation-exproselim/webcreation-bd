import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, X } from "lucide-react";
import { useEditMode } from "@/context/EditModeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  page: string;
  section: string;
  contentKey: string;
  value: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  multiline?: boolean;
}

export function EditableText({
  page,
  section,
  contentKey,
  value,
  className = "",
  as: Component = "span",
  multiline = false,
}: EditableTextProps) {
  const { editMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert(
          {
            page,
            section,
            content_key: contentKey,
            content_value: editValue,
            content_type: "text",
          },
          { onConflict: "page,section,content_key" }
        );

      if (error) throw error;
      toast.success("সেভ হয়েছে!");
      setIsEditing(false);
    } catch (error) {
      toast.error("সেভ করতে সমস্যা হয়েছে");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!editMode) {
    return <Component className={className}>{value}</Component>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-block min-w-[100px]">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cn(
              "w-full min-h-[80px] p-2 rounded-lg border-2 border-cyan-400 bg-black/80 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y",
              className
            )}
            style={{ fontSize: "inherit", fontFamily: "inherit" }}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cn(
              "w-full p-2 rounded-lg border-2 border-cyan-400 bg-black/80 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500",
              className
            )}
            style={{ fontSize: "inherit", fontFamily: "inherit" }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
        )}
        <div className="absolute -top-10 left-0 flex gap-1 z-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block group/edit cursor-pointer" onClick={() => setIsEditing(true)}>
      <Component className={className}>{value}</Component>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity z-50"
        >
          <div className="p-1.5 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/50">
            <Pencil className="w-3 h-3" />
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover/edit:border-cyan-400/50 group-hover/edit:bg-cyan-500/10 transition-all pointer-events-none" />
    </div>
  );
}
