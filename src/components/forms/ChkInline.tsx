import { useState } from "react";
import { S, CC } from "../../tokens";
import { pill, inputStyle, btnPrimary, btnOutline } from "../../styles";
import type { ChecklistItem } from "../../types";

interface ChkInlineProps {
  c: ChecklistItem;
  onSave: (upd: { text: string; cat: string }) => void;
  onCancel: () => void;
}

export default function ChkInline({ c, onSave, onCancel }: ChkInlineProps) {
  const [text, setText] = useState(c.text);
  const [cat, setCat] = useState(c.cat);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <input style={inputStyle} value={text} onChange={e => setText(e.target.value)} />
      <div style={{ display: "flex", gap: S.xs }}>
        {CC.filter(c => c !== "전체").map(c => (
          <button key={c} style={{ ...pill(cat === c), fontSize: 11, padding: "4px 10px" }} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave({ text, cat })}>저장</button>
        <button style={{ ...btnOutline }} onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}
