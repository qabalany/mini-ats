import { useEffect } from "react";
import { X } from "lucide-react";

const STYLES = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-300",
  error: "bg-red-50 text-red-800 border-red-300",
  info: "bg-indigo-50 text-indigo-800 border-indigo-300",
};

/**
 * Auto-dismissing toast notification.
 * Appears at top-right and disappears after 3 seconds.
 */
export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        fixed top-6 right-6 z-[100] animate-slide-in
        flex items-center gap-2 px-5 py-3 rounded-xl border
        text-sm font-semibold shadow-lg
        ${STYLES[type] || STYLES.info}
      `}
    >
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
