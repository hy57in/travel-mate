import { T } from "./tokens";

export const glass = {
  background: T.glass,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.r,
  boxShadow: T.shadow,
};

export const pill = (active) => ({
  padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 600,
  cursor: "pointer", border: "none", transition: "all 0.2s",
  background: active ? T.indigo : "rgba(255,255,255,0.7)",
  color: active ? "#fff" : T.textSoft,
  whiteSpace: "nowrap", flexShrink: 0,
});

export const inputStyle = {
  borderRadius: T.rSm, border: "1.5px solid #E5E7EB",
  padding: "10px 14px", fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.85)", fontFamily: "inherit",
  transition: "border-color 0.15s",
};

export const btnPrimary = {
  background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`,
  color: "#fff", border: "none", borderRadius: T.rSm,
  padding: "12px 0", fontSize: 14, fontWeight: 700,
  cursor: "pointer", width: "100%",
};

export const btnOutline = {
  background: "transparent", color: T.textSoft,
  border: "1.5px solid #E5E7EB", borderRadius: T.rSm,
  padding: "10px 16px", fontSize: 13, cursor: "pointer",
};
