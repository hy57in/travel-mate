import { S, T } from "../../tokens";

export default function Empty({ emoji, text, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: `${S.xxl * 2}px 0`, color: T.textMuted }}>
      <div style={{ fontSize: 40, marginBottom: S.md, filter: "grayscale(0.3)" }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: action ? S.lg : 0 }}>{text}</div>
      {action && (
        <button onClick={onAction} style={{
          padding: `${S.sm}px ${S.xl}px`, borderRadius: 50, fontSize: 12, fontWeight: 700,
          border: `1.5px dashed ${T.coral}`, background: T.coralLight, color: T.coral,
          cursor: "pointer", transition: "all 0.15s",
        }}>{action}</button>
      )}
    </div>
  );
}
