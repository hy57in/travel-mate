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
      position: "fixed", bottom: 90, left: 0, right: 0,
      display: "flex", justifyContent: "center",
      zIndex: 2000, pointerEvents: "none",
      animation: "toastIn 0.25s ease-out",
    }}>
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{
        background: T.text, color: T.cardBg, padding: `${S.sm}px ${S.xl}px`,
        borderRadius: 50, fontSize: 13, fontWeight: 600,
        boxShadow: T.shadowLg, whiteSpace: "nowrap",
      }}>
        {message}
      </div>
    </div>
  );
}
