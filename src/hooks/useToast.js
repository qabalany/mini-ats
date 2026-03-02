import { useState, useCallback } from "react";

/**
 * Lightweight toast notification manager.
 *
 * Usage:
 *   const { toast, showToast, hideToast } = useToast();
 *   showToast("Saved!", "success");
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
