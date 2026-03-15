import { useState, useEffect, useCallback } from "react";
import { S, T } from "../../tokens";

let showToastGlobal = () => {};

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => { showToastGlobal = show; }, [show]);

  return { toast, show };
}

export function showToast(msg) {
  showToastGlobal(msg);
}

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: T.text, color: T.cardBg, padding: `${S.sm}px ${S.xl}px`,
      borderRadius: 50, fontSize: 13, fontWeight: 600, zIndex: 2000,
      boxShadow: T.shadowLg, animation: "fadeIn 0.2s ease-out",
      pointerEvents: "none", whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
}
