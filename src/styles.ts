import type { CSSProperties } from "react";
import { T } from "./tokens";

export const glass: CSSProperties = {
  background: T.glass,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.r,
  boxShadow: T.shadow,
};

export const pill = (active: boolean): CSSProperties => ({
  padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 600,
  cursor: "pointer", border: "none", transition: "all 0.2s",
  background: active ? T.indigo : T.pillBg,
  color: active ? "#fff" : T.textSoft,
  whiteSpace: "nowrap", flexShrink: 0,
});

export const inputStyle: CSSProperties = {
  borderRadius: T.rSm, border: `1.5px solid ${T.inputBorder}`,
  padding: "10px 14px", fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box",
  background: T.inputBg, fontFamily: "inherit",
  transition: "border-color 0.15s", color: T.text,
};

export const btnPrimary: CSSProperties = {
  background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`,
  color: "#fff", border: "none", borderRadius: T.rSm,
  padding: "12px 0", fontSize: 14, fontWeight: 700,
  cursor: "pointer", width: "100%",
};

export const btnOutline: CSSProperties = {
  background: "transparent", color: T.textSoft,
  border: `1.5px solid ${T.inputBorder}`, borderRadius: T.rSm,
  padding: "10px 16px", fontSize: 13, cursor: "pointer",
};
