import { T } from "../../tokens";

export default function Empty({ emoji, text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{text}</div>
    </div>
  );
}
