import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Eye } from "lucide-react";
import { useEditMode } from "@/context/EditModeContext";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export function EditModeToggle() {
  const { isAdmin, loading } = useAdminStatus();
  const { editMode, setEditMode } = useEditMode();

  if (loading || !isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 right-6 z-[100]"
      >
        <motion.button
          onClick={() => setEditMode(!editMode)}
          className={`
            flex items-center gap-3 px-5 py-3 rounded-full font-bengali font-medium text-sm
            shadow-xl transition-all duration-300
            ${editMode 
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30" 
              : "bg-white/90 text-slate-800 hover:bg-white shadow-black/20"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editMode ? (
            <>
              <Eye className="w-5 h-5" />
              <span>Preview Mode</span>
            </>
          ) : (
            <>
              <Pencil className="w-5 h-5" />
              <span>Edit Mode</span>
            </>
          )}
        </motion.button>
        
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-full font-bengali"
          >
            ✏️ যেকোনো text এ click করে edit করুন
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
